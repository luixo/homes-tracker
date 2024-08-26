
import { getTrackerRequests } from "@/db/requests";
import { notifyMessage } from "@/intercom/index";
import { withLogger } from "@/utils/logger";
import { createQueue } from "@/utils/promise";

import type { BotHandler } from "../types";

export const handler: BotHandler = async (context, match) => {
	const trackerRequests = await withLogger(
		context.logger,
		`Fetching tracker requests`,
		getTrackerRequests,
		{ onSuccess: (requests) => `${requests.length} requests fetched` },
	);
	const { add: addToQueue, getResolvePromise: getQueuePromise } = createQueue(
		100,
		(error) => context.logger.error(error),
	);
	const enabledRequests = trackerRequests.filter((request) => request.enabled);
	for (const request of enabledRequests) {
		addToQueue(async () => {
			try {
				await notifyMessage(context, request, match);
			} catch (e) {
				if (typeof e === "object" && e && "code" in e && "message" in e) {
					context.logger.warn(
						`Tracker request ${request._id} got telegram error: [${String(e.code)}]: ${String(e.message)}`,
					);
				} else {
					context.logger.warn(
						`Tracker request ${request._id} got error: ${String(e)}`,
					);
				}
			}
		});
	}
	await getQueuePromise();
	await context.respond(
		`Отправил сообщение "${match}" ${enabledRequests.length} пользователям!`,
	);
};
