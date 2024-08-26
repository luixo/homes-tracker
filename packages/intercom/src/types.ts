import type TelegramBot from "node-telegram-bot-api";

import type { Logger } from "@/utils/logger";

export type NotifiersContext = {
	logger: Logger;
	bot: TelegramBot;
};

export type Notifier = (input: {
	text: string;
	images?: string[];
}) => Promise<void>;
