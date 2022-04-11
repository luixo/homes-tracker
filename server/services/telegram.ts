import TelegramBot from "node-telegram-bot-api";
import winston from "winston";
import { withLogger } from "../utils/logging";

const token = process.env.TELEGRAM_TOKEN || "";

export const bot = new TelegramBot(token);

const verifyCredentials = () => {
  if (!token) {
    throw new Error("Please provider TELEGRAM_TOKEN environment variables");
  }
};

const MAX_TELEGRAM_CHARS = 4096;

export const sendToTelegram = async (
  logger: winston.Logger,
  chatId: string,
  message: string
): Promise<void> => {
  verifyCredentials();
  return withLogger(
    logger.child({ service: "teleram" }),
    `Send message (size ${message.length}) to ${chatId}`,
    async () => {
      while (message.length > 0) {
        await bot.sendMessage(chatId, message.slice(0, MAX_TELEGRAM_CHARS), {
          disable_web_page_preview: true,
        });
        message = message.slice(MAX_TELEGRAM_CHARS + 1);
      }
    }
  );
};
