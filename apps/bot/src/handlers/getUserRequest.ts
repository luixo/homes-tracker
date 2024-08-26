import { getTrackerRequestToChatLinkByChatId } from "@/db/request-chat-links";
import { getTrackerRequest } from "@/db/requests";
import { formatRequest } from "@/filters/format";
import { unparseRequest } from "@/filters/unparse";

import type { BotHandler } from "../types";

export const handler: BotHandler = async (context, lookupChatId) => {
	const maybeRequestLink = await getTrackerRequestToChatLinkByChatId(
		lookupChatId,
	)(context.logger);
	if (!maybeRequestLink) {
		await context.respond(`Для пользователя ${lookupChatId} нет запроса`);
	} else {
		const request = await getTrackerRequest(maybeRequestLink._id)(
			context.logger,
		);
		if (!request) {
			await context.respond(
				`Для пользователя обнаружена связь с запросом ${maybeRequestLink._id}, но сам запрос не обнаружен`,
			);
		} else {
			await context.respond(
				`Запрос пользователя ${lookupChatId} выглядит так:\n${formatRequest(
					request,
				)}\n(${unparseRequest(request)})`,
			);
		}
	}
	await context.sendCard(lookupChatId);
};
