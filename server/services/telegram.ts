import TelegramBot from "node-telegram-bot-api";
import winston from "winston";

const token = process.env.TELEGRAM_TOKEN || "";
const chatId = process.env.TELEGRAM_CHAT_ID || "";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token);

const getTelegramLogger = (logger: winston.Logger): winston.Logger => {
  return logger.child({ service: "teleram" });
};

const verifyCredentials = () => {
  if (!token || !chatId) {
    throw new Error(
      "Please provider TELEGRAM_TOKEN and TELEGRAM_CHAT_ID environment variables"
    );
  }
};

export const sendToTelegram = async (
  logger: winston.Logger,
  message: string
): Promise<void> => {
  logger = getTelegramLogger(logger);
  const name = `Send message (starts with ${message.slice(0, 50)}...)`;
  try {
    verifyCredentials();
    logger.info(`${name} started`);
    await bot.sendMessage(chatId, message, {
      disable_web_page_preview: true,
    });
    logger.info(`${name} succeed`);
  } catch (error) {
    logger.error(`${name} failed`, error);
    throw error;
  }
};
