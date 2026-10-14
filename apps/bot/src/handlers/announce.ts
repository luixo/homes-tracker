import type { BotHandler } from "@/bot/types";
import { convertToLastRequest } from "@/db/convert-requests";
import { notifyMessage } from "@/intercom/index";
import { createQueue } from "@/utils/promise";

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
			} catch (error) {
				if (
					typeof error === "object" &&
					error &&
					"code" in error &&
					"message" in error
				) {
					context.logger.warn(
						`Tracker request ${request._id} got telegram error: [${String(error.code)}]: ${String(error.message)}`,
					);
				} else {
					context.logger.warn(
						`Tracker request ${request._id} got error: ${String(error)}`,
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
