import { getEntitiesWithScrapedTimestampGt } from "@/db/entities";
import {
	getTrackerRequests,
	updateTrackerRequestWithTimestamp,
	upsertTrackerRequestEnabledStatus,
} from "@/db/requests";
import { applyFilters as doesEntityMatchRequest } from "@/filters/apply";
import { notifyEntity, notifyMessage } from "@/intercom/index";
import { procedure } from "@/server/trpc";
import { getClient } from "@/telegram/client";
import { createQueue } from "@/utils/promise";

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
	for (const request of trackerRequests) {
		if (!request.enabled) {
			ctx.logger.info(`Request ${request._id} is disabled`);
		} else {
			ctx.logger.info(
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
							notifyEntity({ bot, logger: ctx.logger }, request, entity).catch(
								async (error: unknown) => {
									if (
										error instanceof Error &&
										error.message.includes("blocked by the user")
									) {
										ctx.logger.info(
											`Tracker request ${request._id} has been stopped because user blocked bot`,
										);
										await upsertTrackerRequestEnabledStatus(
											ctx.logger,
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
								{ bot, logger: ctx.logger },
								request,
								`У тебя больше ${MAX_MATCHED_ENTITIES} сообщений за одну проверку, кажется, надо сузить критерии`,
							),
						);
					}
					matchedIds.push(entity._id);
				}
			}
		}
		void updateTrackerRequestWithTimestamp(ctx.logger, request._id).catch(
			(error: unknown) =>
				ctx.logger.error(
					`Error while updating request ${
						request._id
					} with current timestamp: ${String(error)}`,
				),
		);
	}
	await getQueuePromise();
});
