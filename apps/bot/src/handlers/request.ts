import type { BotHandler } from "@/bot/types";

export const handler: BotHandler = async (context) => {
	const { requestId } = await context.caller.chatLinks.upsert();
	await context.respond(
		process.env.SERVER_BASE_URL
			? [
					"Изменить свой запрос можно на сайте:",
					`${process.env.SERVER_BASE_URL}/request/${requestId}`,
				].join("\n")
			: "В данный момент изменение запроса невозможно :(",
	);
};
