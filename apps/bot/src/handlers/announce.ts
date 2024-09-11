import { convertToLastRequest } from "@/db/convert-requests";
import { notifyMessage } from "@/intercom/index";
import { createQueue } from "@/utils/promise";

import type { BotHandler } from "../types";

export const handler: BotHandler = async (context, match) => {
	const trackerRequests = await context.caller.requests.getAll();
	const { add: addToQueue, getResolvePromise: getQueuePromise } = createQueue(
		100,
		(error) => context.logger.error(error),
	);
	const enabledRequests = trackerRequests.filter((request) => request.enabled);
	for (const unknownRequest of enabledRequests) {
		const request = convertToLastRequest(unknownRequest);
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
