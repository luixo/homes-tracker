import type TelegramBot from "node-telegram-bot-api";

import type { Logger } from "@/utils/logger";

export type BotContext = {
	bot: TelegramBot;
	respond: (message: string) => Promise<TelegramBot.Message>;
	sendCard: (chatId: string) => Promise<TelegramBot.Message>;
	logger: Logger;
	chatId: string;
};

export type BotHandler = ((
	context: BotContext,
	match: string,
) => Promise<void>) & {
	adminOnly?: boolean;
};
