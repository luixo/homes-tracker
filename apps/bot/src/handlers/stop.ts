import { upsertTrackerRequestEnabledStatus } from "@/db/requests";

import type { BotHandler } from "../types";

export const handler: BotHandler = async (context) => {
	const existingRequest = await context.caller.requests.get();
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
