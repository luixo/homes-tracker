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

export type TelegramError = {
  code: "ETELEGRAM";
  message: string;
};

export const sendToTelegram = async (
  logger: winston.Logger,
  chatId: string,
  message: string,
  images?: string[]
): Promise<TelegramError | undefined> => {
  verifyCredentials();
  const originalMessage = message;
  const hasImages = images && images.length !== 0;
  return withLogger(
    logger.child({ service: "teleram" }),
    `Send message (size ${message.length}${
      hasImages ? `, with ${images.length} images` : ""
    }) to ${chatId}`,
    async () => {
      try {
        while (message.length > 0) {
          const isFirstMessage = message === originalMessage;
          if (hasImages && isFirstMessage) {
            await bot.sendMediaGroup(
              chatId,
              images.map((image, index) => ({
                type: "photo",
                media: image,
                ...(index === 0
                  ? {
                      caption: message.slice(0, MAX_TELEGRAM_CHARS),
                      parse_mode: "MarkdownV2",
                    }
                  : undefined),
              }))
            );
          } else {
            await bot.sendMessage(
              chatId,
              message.slice(0, MAX_TELEGRAM_CHARS),
              {
                disable_web_page_preview: isFirstMessage,
                parse_mode: "MarkdownV2",
              }
            );
          }
          message = message.slice(MAX_TELEGRAM_CHARS + 1);
        }
      } catch (e) {
        return e as TelegramError;
      }
    }
  );
};
