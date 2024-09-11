import { convertToLastRequest } from "@/db/convert-requests";
import { getEntitiesWithScrapedTimestampGt } from "@/db/entities";
import { getTrackerRequests, updateTrackerRequest } from "@/db/requests";
import { notifyEntity, notifyMessage } from "@/intercom/index";
import { procedure } from "@/server/trpc";
import { getClient } from "@/telegram/client";
import { createQueue } from "@/utils/promise";

import { doesMatch } from "../filters/config/match";

const MAX_MATCHED_ENTITIES = 10;

export const handler = procedure.mutation(async ({ ctx }) => {
	const bot = getClient();
	const trackerRequests = await getTrackerRequests(ctx.logger);
	const minimalTimestamp = trackerRequests.reduce(
		(acc, request) => Math.min(acc, request.notifiedTimestamp),
		0,
	);
	const entities = await getEntitiesWithScrapedTimestampGt(
		ctx.logger,
		minimalTimestamp,
	);
	const { add: addToQueue, getResolvePromise: getQueuePromise } = createQueue(
		100,
		(error) => ctx.logger.error(error),
	);
	for (const unknownRequest of trackerRequests) {
		const request = convertToLastRequest(unknownRequest);
		if (!request.enabled) {
			continue;
		}
		ctx.logger.info(
			`Looking up request ${request._id} with notified timestamp ${request.notifiedTimestamp}`,
		);
		const matchedIds: string[] = [];
		for (const entity of entities) {
			if (entity.scrapedTimestamp < request.notifiedTimestamp) {
				continue;
			}
			const matches = doesMatch(entity, request.filters);
			if (matches) {
				if (matchedIds.length < MAX_MATCHED_ENTITIES) {
					addToQueue(() =>
						notifyEntity({ bot, logger: ctx.logger }, request, entity).catch(
							async (error: unknown) => {
								if (
									error instanceof Error &&
									(error.message.includes("blocked by the user") ||
										error.message.includes("user is deactivated"))
								) {
									ctx.logger.info(
										`Tracker request ${request._id} has been stopped because user blocked bot`,
									);
									await updateTrackerRequest(ctx.logger, request._id, {
										enabled: false,
									});
								} else {
									throw error;
								}
							},
						),
					);
				} else if (matchedIds.length === MAX_MATCHED_ENTITIES) {
					addToQueue(() =>
						notifyMessage(
							{ bot, logger: ctx.logger },
							request,
							`У тебя больше ${MAX_MATCHED_ENTITIES} сообщений за одну проверку, кажется, надо сузить критерии`,
						),
					);
				}
				matchedIds.push(entity._id);
			}
		}
		void updateTrackerRequest(ctx.logger, request._id, {
			notifiedTimestamp: Date.now(),
		}).catch((error: unknown) =>
			ctx.logger.error(
				error,
				`Error while updating request ${request._id} with current timestamp`,
			),
		);
	}
	await getQueuePromise();
});
