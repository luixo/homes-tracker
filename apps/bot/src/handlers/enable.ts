import type { BotHandler } from "../types";

export const handler: BotHandler = async (context) => {
	try {
		const existingRequest = await context.caller.requests.get();
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

		await context.caller.requests.patch({
			enabled: true,
			notifiedTimestamp: Date.now(),
		});
		await context.respond(`Запрос теперь включен`);
	} catch {
		await context.respond(
			`Невозможно включить запрос, его не существует. Создай запрос с помощью команды /request`,
		);
	}
};
