import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { globalLogger } from "../server/logger";
import { BotContext, handlers } from "./handlers";

dotenv.config({ path: "./.env.local" });

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? "").split(",");

const getContext = (
  bot: TelegramBot,
  message: TelegramBot.Message
): BotContext => {
  const chatId = message.chat.id.toString();
  if (Number(chatId) < 0) {
    bot.sendMessage(
      chatId,
      "К сожалению, добавление бота в группы на данный момент недоступно"
    );
    throw new Error("Bot in group");
  }
  return {
    respond: (message) => bot.sendMessage(chatId, message),
    sendCard: async (chatId) => {
      const chat = await bot.getChat(chatId);
      return bot.sendContact(
        chatId,
        chat.username || chat.title || "unknown",
        chat.first_name || "unknown",
        {
          last_name: chat.last_name,
        }
      );
    },
    logger: globalLogger.child({ service: "bot" }),
    chatId,
  };
};

const main = async () => {
  const token = process.env.TELEGRAM_TOKEN || "";
  if (!token) {
    throw new Error("Please provider TELEGRAM_TOKEN environment variables");
  }

  const bot = new TelegramBot(token, { polling: true });

  Object.entries(handlers).forEach(([key, handler]) => {
    bot.onText(new RegExp(`/${key} ?(.*)`), (message, match) => {
      const context = getContext(bot, message);
      context.logger.info(
        `Got message with handler ${key} from ${context.chatId}`
      );
      try {
        if (handler.adminOnly && !ADMIN_USER_IDS.includes(context.chatId)) {
          bot.sendMessage(
            context.chatId,
            "Это действие может делать только администратор!"
          );
          return;
        }
        return handler(context, match ? match[1] : "");
      } catch (e) {
        context.logger.error(
          `Error happened on message with handler ${key} from ${context.chatId}:\n${message.text}\n${e}`
        );
      }
    });
  });
  const initLogger = globalLogger.child({ handler: "init" });
  initLogger.info(
    `Bot started with ${Object.keys(handlers).join(", ")} handlers connected`
  );
};

main();
