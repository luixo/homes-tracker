import type TelegramBot from "node-telegram-bot-api";
import type winston from "winston";

import type { TrackerRequest } from "../types/request";

import type { TelegramError } from "./telegram";
import { sendToTelegram } from "./telegram";

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
