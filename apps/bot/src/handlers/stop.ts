import { updateTrackerRequest } from "@/db/requests";

import type { BotHandler } from "../types";

export const handler: BotHandler = async (context) => {
	try {
		const existingRequest = await context.caller.requests.get();
		if (!existingRequest?.enabled) {
			await context.respond(`Пока!`);
			return;
		}
		await updateTrackerRequest(context.logger, existingRequest._id, {
			enabled: false,
		});
		await context.respond(`Пока! Твой запрос пока выключаю`);
	} catch {
		await context.respond(`Пока!`);
	}
};
