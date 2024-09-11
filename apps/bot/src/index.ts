import { TRPCError } from "@trpc/server";
import type TelegramBot from "node-telegram-bot-api";

import { getClient } from "@/telegram/client";
import type { ChatId } from "@/types/ids";
import { globalLogger } from "@/utils/logger";

import { handlers } from "./handlers";
import { getCaller } from "./trpc";
import type { BotContext } from "./types";

const getContext = async (
	bot: TelegramBot,
	message: TelegramBot.Message,
): Promise<BotContext> => {
	const inChatId = message.chat.id.toString() as ChatId;
	if (Number(inChatId) < 0) {
		await bot.sendMessage(
			inChatId,
			"К сожалению, добавление бота в группы на данный момент недоступно",
		);
		throw new Error("Bot in group");
	}
	return {
		bot,
		respond: (outMessage) => bot.sendMessage(inChatId, outMessage),
		sendCard: async (outChatId) => {
			const chat = await bot.getChat(outChatId);
			return bot.sendContact(
				outChatId,
				chat.username || chat.title || "unknown",
				chat.first_name || "unknown",
				{
					last_name: chat.last_name,
				},
			);
		},
		logger: globalLogger.child({ service: "bot" }),
		chatId: inChatId,
		caller: getCaller(inChatId),
	};
};

const main = async () => {
	const bot = getClient({ polling: true });
	Object.entries(handlers).forEach(([key, handler]) => {
		bot.onText(new RegExp(`/${key} ?(.*)`, "ms"), async (message, match) => {
			const context = await getContext(bot, message);
			context.logger.info(
				`Got message with handler ${key} from ${context.chatId}`,
			);
			try {
				await handler(context, match?.[1] ?? "");
			} catch (e) {
				if (
					e instanceof TRPCError &&
					e.message === "You are not allowed here"
				) {
					await bot.sendMessage(
						context.chatId,
						"Это действие может делать только администратор!",
					);
					return;
				}
				context.logger.error(
					e,
					`Error happened on message with handler ${key} from ${
						context.chatId
					}:\n${message.text}`,
				);
			}
		});
	});
	const initLogger = globalLogger.child({ handler: "init" });
	initLogger.info(
		`Bot started with ${Object.keys(handlers).join(", ")} handlers connected`,
	);
};

void main();
