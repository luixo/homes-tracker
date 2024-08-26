import type { BotHandler } from "../types";

const helpResponse = [
	"Что я умею:",
	"/start - начать взаимодействие",
	"/stop - остановить взаимодействие",
	"/request - поменять запрос на поиск",
	"/disable - отключить уведомления",
	"/enable - включить уведомления",
	"/help - эта подсказка",
].join("\n");

export const handler: BotHandler = async (context) => {
	await context.respond(helpResponse);
};
