import type { BotHandler } from "../types";

export const handler: BotHandler = async (context) => {
	const existingRequest = await context.caller.requests.get();
	if (existingRequest) {
		await context.respond(
			[
				`У нас уже есть твой запрос, он ${
					existingRequest.enabled ? "включен" : "выключен"
				}`,
				!existingRequest.enabled
					? "Чтобы включить его - используй команду /enable"
					: `Чтобы поменять его - вызови команду /request`,
			]
				.filter(Boolean)
				.join("\n"),
		);
	} else {
		await context.respond(
			`У тебя сейчас нет запроса, создай его с помощью команды /request`,
		);
	}
};
