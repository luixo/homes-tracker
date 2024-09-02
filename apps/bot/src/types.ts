import type TelegramBot from "node-telegram-bot-api";

import type { ChatId, OutChatId } from "@/db/types";
import type { Logger } from "@/utils/logger";

import type { getCaller } from "./trpc";

export type BotContext = {
	bot: TelegramBot;
	respond: (message: string) => Promise<TelegramBot.Message>;
	sendCard: (chatId: OutChatId) => Promise<TelegramBot.Message>;
	logger: Logger;
	chatId: ChatId;
	caller: ReturnType<typeof getCaller>;
};

export type BotHandler = ((
	context: BotContext,
	match: string,
) => Promise<void>) & {
	adminOnly?: boolean;
};
