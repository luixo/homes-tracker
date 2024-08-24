import winston from "winston";
import { TrackerRequest } from "../types/request";
import { sendToTelegram, TelegramError } from "./telegram";
import TelegramBot from "node-telegram-bot-api";

export const notifyRequest = async (
  bot: TelegramBot,
  logger: winston.Logger,
  request: TrackerRequest,
  message: string,
  images?: string[]
): Promise<TelegramError | undefined> => {
  for (const notifier of request.notifiers) {
    switch (notifier.type) {
      case "telegram":
        return sendToTelegram(bot, logger, notifier.chatId, message, images);
    }
  }
};
