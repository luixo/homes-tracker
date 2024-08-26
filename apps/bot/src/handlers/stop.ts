import { upsertTrackerRequestEnabledStatus } from "@/db/requests";

import type { BotHandler } from "../types";
import { getExistingRequestByChatId } from "../utils";

export const handler: BotHandler = async (context) => {
	const existingRequest = await getExistingRequestByChatId(
		context.logger,
		context.chatId,
	);
	if (!existingRequest?.enabled) {
		await context.respond(`Пока!`);
		return;
	}
	await upsertTrackerRequestEnabledStatus(
		context.logger,
		existingRequest._id,
		false,
	);
	await context.respond(`Пока! Твой запрос пока выключаю`);
};
