import type { BotHandler } from "../types";

export const handler: BotHandler = async (context) => {
	const { requestId } = await context.caller.chatLinks.upsert();
	if (!process.env.SERVER_BASE_URL) {
		await context.respond(
			["В данный момент изменение запроса невозможно :("].join("\n"),
		);
	} else {
		await context.respond(
			[
				"Изменить свой запрос можно на сайте:",
				`${process.env.SERVER_BASE_URL}/request/${requestId}`,
			].join("\n"),
		);
	}
};
