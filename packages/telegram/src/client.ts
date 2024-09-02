import TelegramBot from "node-telegram-bot-api";

export const getClient = (opts: TelegramBot.ConstructorOptions = {}) => {
	const token = process.env.TELEGRAM_TOKEN || "";
	if (!token) {
		throw new Error("Please provider TELEGRAM_TOKEN environment variables");
	}

	return new TelegramBot(token, opts);
};
