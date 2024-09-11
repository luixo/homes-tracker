import type { BotHandler } from "../types";

export const handler: BotHandler = async (context) => {
	try {
		const existingRequest = await context.caller.requests.get();
		if (!existingRequest) {
			await context.respond(
				`Невозможно выключить запрос, его не существует. Создай запрос с помощью команды /request`,
			);
			return;
		}
		if (!existingRequest.enabled) {
			await context.respond(`Запрос уже выключен`);
			return;
		}
		await context.caller.requests.patch({ enabled: false });
		await context.respond(`Запрос теперь выключен`);
	} catch {
		await context.respond(
			`Невозможно выключить запрос, его не существует. Создай запрос с помощью команды /request`,
		);
	}
};
