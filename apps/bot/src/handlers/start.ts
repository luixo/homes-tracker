import type { BotHandler } from "@/bot/types";

export const handler: BotHandler = async (context) => {
	try {
		const existingRequest = await context.caller.requests.get();
		await context.respond(
			existingRequest
				? [
						`У нас уже есть твой запрос, он ${
							existingRequest.enabled ? "включен" : "выключен"
						}`,
						existingRequest.enabled
							? `Чтобы поменять его - вызови команду /request`
							: "Чтобы включить его - используй команду /enable",
					]
						.filter(Boolean)
						.join("\n")
				: `У тебя сейчас нет запроса, создай его с помощью команды /request`,
		);
	} catch {
		await context.respond(
			`У тебя сейчас нет запроса, создай его с помощью команды /request`,
		);
	}
};
