import { upsertTrackerRequestEnabledStatus } from "@/db/requests";

import type { BotHandler } from "../types";
import { getExistingRequestByChatId } from "../utils";

export const handler: BotHandler = async (context) => {
	const existingRequest = await getExistingRequestByChatId(
		context.logger,
		context.chatId,
	);
	if (!existingRequest) {
		await context.respond(
			`Невозможно включить запрос, его не существует. Создай запрос с помощью команды /request`,
		);
		return;
	}
	if (existingRequest.enabled) {
		await context.respond(`Запрос уже включен`);
		return;
	}
	await upsertTrackerRequestEnabledStatus(
		context.logger,
		existingRequest._id,
		true,
	);
	await context.respond(`Запрос теперь включен`);
};
