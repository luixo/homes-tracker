import type { NextApiRequest, NextApiResponse } from "next";

import { getClient } from "@/bot/client";
import { getEntitiesWithScrapedTimestampGt } from "@/db/entities";
import {
	getTrackerRequests,
	updateTrackerRequestWithTimestamp,
	upsertTrackerRequestEnabledStatus,
} from "@/db/requests";
import { applyFilters as doesEntityMatchRequest } from "@/filters/apply";
import { notifyEntity, notifyMessage } from "@/intercom/index";
import { withLogger } from "@/utils/logger";
import { createQueue } from "@/utils/promise";
import { getHandlerLogger } from "@/web/utils/logger";

const MAX_MATCHED_ENTITIES = 10;

type Response =
	| {
			success: string;
	  }
	| { error: string; stack?: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
	try {
		const bot = getClient();
		await withLogger(getHandlerLogger(req), `Check handler`, async (logger) => {
			const trackerRequests = await withLogger(
				logger,
				`Fetching tracker requests`,
				getTrackerRequests,
				{ onSuccess: (requests) => `${requests.length} requests fetched` },
			);
			const minimalTimestamp = trackerRequests.reduce(
				(acc, request) => Math.min(acc, request.notifiedTimestamp),
				trackerRequests[0]?.notifiedTimestamp ?? 0,
			);
			const entities = await withLogger(
				logger,
				`Fetching entities with minimal timestamp ${minimalTimestamp}`,
				getEntitiesWithScrapedTimestampGt(minimalTimestamp),
				{ onSuccess: (result) => `${result.length} entities fetched` },
			);
			const { add: addToQueue, getResolvePromise: getQueuePromise } =
				createQueue(100, (error) => logger.error(error));
			for (const request of trackerRequests) {
				if (!request.enabled) {
					logger.info(`Request ${request._id} is disabled`);
				} else {
					logger.info(
						`Looking up request ${request._id} with notified timestamp ${request.notifiedTimestamp}`,
					);
					const matchedIds: string[] = [];
					for (const entity of entities) {
						if (entity.scrapedTimestamp < request.notifiedTimestamp) {
							continue;
						}
						const matches = doesEntityMatchRequest(entity, request);
						if (matches) {
							if (matchedIds.length < MAX_MATCHED_ENTITIES) {
								addToQueue(() =>
									notifyEntity({ bot, logger }, request, entity).catch(
										async (error: unknown) => {
											if (
												error instanceof Error &&
												error.message.includes("blocked by the user")
											) {
												logger.info(
													`Tracker request ${request._id} has been stopped because user blocked bot`,
												);
												await upsertTrackerRequestEnabledStatus(
													logger,
													request._id,
													false,
												);
											} else {
												throw error;
											}
										},
									),
								);
							} else if (matchedIds.length === MAX_MATCHED_ENTITIES) {
								addToQueue(() =>
									notifyMessage(
										{ bot, logger },
										request,
										`У тебя больше ${MAX_MATCHED_ENTITIES} сообщений за одну проверку, кажется, надо сузить критерии`,
									),
								);
							}
							matchedIds.push(entity._id);
						}
					}
					if (matchedIds.length === 0) {
						logger.info(`No new matched ids for request ${request._id}`);
					} else {
						void withLogger(
							logger,
							`Put ${matchedIds.length} entities for request ${request._id}`,
							async () => {
								if (matchedIds.length !== 0) {
									// We used to put entities here, but it took too much CPU
									// return putMatchedEntities(logger, request._id, matchedIds);
								}
							},
						).catch((error: unknown) =>
							logger.error(
								`Error while putting ${
									matchedIds.length
								} entities for request ${request._id}: ${String(error)}`,
							),
						);
					}
				}
				void withLogger(
					logger,
					`Update request ${request._id} with current timestamp`,
					updateTrackerRequestWithTimestamp(request._id),
				).catch((error: unknown) =>
					logger.error(
						`Error while updating request ${
							request._id
						} with current timestamp: ${String(error)}`,
					),
				);
			}
			await getQueuePromise();
			res.status(200).send({ success: "Everything is verified" });
		});
	} catch (e) {
		res.status(500).send({
			error: String(e),
			stack: e instanceof Error ? e.stack : undefined,
		});
	}
};

export default handler;
