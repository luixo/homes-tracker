import type TelegramBot from "node-telegram-bot-api";
import type winston from "winston";

import { notifyRequest } from "../server/services/request";
import type { TrackerRequest } from "../server/types/request";
import { createQueue } from "../server/utils";
import { getTrackerRequestToChatLinkByChatId } from "../server/utils/db/request-chat-links";
import {
	getTrackerRequest,
	getTrackerRequests,
	upsertTrackerRequest,
	upsertTrackerRequestEnabledStatus,
} from "../server/utils/db/requests";
import { withLogger } from "../server/utils/logging";
import { MINUTE } from "../server/utils/time";

import { formatRequest } from "./formatters";
import { parseRequest } from "./parsers";
import { unparseRequest } from "./unparsers";
import { createRequestByChatId, getExistingRequestByChatId } from "./utils";

export type BotContext = {
	bot: TelegramBot;
	respond: (message: string) => Promise<TelegramBot.Message>;
	sendCard: (chatId: string) => Promise<TelegramBot.Message>;
	logger: winston.Logger;
	chatId: string;
};

type BotHandler = ((context: BotContext, match: string) => Promise<void>) & {
	adminOnly?: boolean;
};

const requestHelpResponse = [
	'Чтобы создать или изменить запрос - напиши его в виде фильтров разделенных символом ";", например:',
	"/request price-total 200-300; area <500; rooms >5",
	"/request area >100; bedrooms >5",
	"/request area >100; address Vake",
	"",
	"Какие есть фильтры?",
	"- По цене (можно выбрать один):",
	"-- По цене за всё: price-total",
	"-- По цене за м2: price-per-meter",
	"-- По цене за комнату: price-per-room",
	"-- По цене за спальню: price-per-bedroom",
	"- По площади: area",
	"- По количеству комнат или спален (ожно выбрать один):",
	"-- По количеству комнат: rooms",
	"-- По количеству спален: bedrooms",
	"- По адресу: address",
	"-- Используй регулярное выражение: (Vake|Saburtalo)",
	"",
	"Для каждого запроса можно указать min и max",
	"В запросах с ценами цена указывается в долларах, площадь указывается в квадратных метрах, комнаты - в штуках :)",
].join("\n");

const helpResponse = [
	"Что я умею:",
	"/start - начать взаимодействие",
	"/stop - остановить взаимодействие",
	"/request - поменять запрос на поиск",
	"/disable - отключить уведомления",
	"/enable - включить уведомления",
	"/help - эта подсказка",
].join("\n");

const restrictAdmin = (handler: BotHandler): BotHandler => {
	// The simplest way to restrict handlers for admins
	// eslint-disable-next-line no-param-reassign
	handler.adminOnly = true;
	return handler;
};

export const handlers: Record<string, BotHandler> = {
	help: async (context) => {
		await context.respond(helpResponse);
	},
	start: async (context) => {
		const existingRequest = await getExistingRequestByChatId(
			context.logger,
			context.chatId,
		);
		if (existingRequest) {
			await context.respond(
				[
					`У нас уже есть твой запрос, он ${
						existingRequest.enabled ? "включен" : "выключен"
					}`,
					!existingRequest.enabled
						? "Чтобы включить его - используй команду /enable"
						: `Чтобы поменять его - вызови команду /request`,
				]
					.filter(Boolean)
					.join("\n"),
			);
		} else {
			await context.respond(
				`У тебя сейчас нет запроса, создай его с помощью команды /request`,
			);
		}
	},
	stop: async (context) => {
		const existingRequest = await getExistingRequestByChatId(
			context.logger,
			context.chatId,
		);
		if (!existingRequest?.enabled) {
			await context.respond(`Пока!`);
			return;
		}
		await upsertTrackerRequestEnabledStatus(
			context.logger,
			existingRequest._id,
			false,
		);
		await context.respond(`Пока! Твой запрос пока выключаю`);
	},
	request: async (context, match) => {
		const existingRequest = await getExistingRequestByChatId(
			context.logger,
			context.chatId,
		);
		if (!match) {
			if (existingRequest) {
				await context.respond(
					[
						"Твой текущий запрос:",
						formatRequest(existingRequest),
						`(${unparseRequest(existingRequest)})`,
						"",
						requestHelpResponse,
					].join("\n"),
				);
			} else {
				await context.respond(
					["У тебя нет запроса!", "", requestHelpResponse].join("\n"),
				);
			}
			return;
		}
		const requestBody = parseRequest(match);
		if (Array.isArray(requestBody)) {
			await context.respond(
				[
					"Я не понял твой запрос, а именно части:",
					...requestBody,
					"",
					requestHelpResponse,
				].join("\n"),
			);
			return;
		}
		let requestId = existingRequest ? existingRequest._id : null;
		if (!requestId) {
			requestId = await createRequestByChatId(context.logger, context.chatId);
		}
		const nextRequest: TrackerRequest = {
			...requestBody,
			_id: requestId,
			enabled: true,
			notifiedTimestamp: existingRequest
				? existingRequest.notifiedTimestamp
				: Date.now() - 10 * MINUTE,
			notifiers: [
				{
					type: "telegram",
					chatId: context.chatId,
				},
			],
		};
		await withLogger(
			context.logger,
			`Updating tracker request ${requestId}`,
			(logger) => upsertTrackerRequest(logger, nextRequest),
		);
		await context.respond(
			`Твой запрос теперь:\n${formatRequest(nextRequest)}\nЖди уведомлений!`,
		);
	},
	enable: async (context) => {
		const existingRequest = await getExistingRequestByChatId(
			context.logger,
			context.chatId,
		);
		if (!existingRequest) {
			await context.respond(
				`Невозможно включить запрос, его не существует. Создай запрос с помощью команды /request`,
			);
			return;
		}
		if (existingRequest.enabled) {
			await context.respond(`Запрос уже включен`);
			return;
		}
		await upsertTrackerRequestEnabledStatus(
			context.logger,
			existingRequest._id,
			true,
		);
		await context.respond(`Запрос теперь включен`);
	},
	disable: async (context) => {
		const existingRequest = await getExistingRequestByChatId(
			context.logger,
			context.chatId,
		);
		if (!existingRequest) {
			await context.respond(
				`Невозможно выключить запрос, его не существует. Создай запрос с помощью команды /request`,
			);
			return;
		}
		if (!existingRequest.enabled) {
			await context.respond(`Запрос уже выключен`);
			return;
		}
		await upsertTrackerRequestEnabledStatus(
			context.logger,
			existingRequest._id,
			false,
		);
		await context.respond(`Запрос теперь выключен`);
	},
	getUserRequest: restrictAdmin(async (context, lookupChatId) => {
		const maybeRequestLink = await getTrackerRequestToChatLinkByChatId(
			lookupChatId,
		)(context.logger);
		if (!maybeRequestLink) {
			await context.respond(`Для пользователя ${lookupChatId} нет запроса`);
		} else {
			const request = await getTrackerRequest(maybeRequestLink._id)(
				context.logger,
			);
			if (!request) {
				await context.respond(
					`Для пользователя обнаружена связь с запросом ${maybeRequestLink._id}, но сам запрос не обнаружен`,
				);
			} else {
				await context.respond(
					`Запрос пользователя ${lookupChatId} выглядит так:\n${formatRequest(
						request,
					)}`,
				);
			}
		}
		await context.sendCard(lookupChatId);
	}),
	announce: restrictAdmin(async (context, match) => {
		const trackerRequests = await withLogger(
			context.logger,
			`Fetching tracker requests`,
			getTrackerRequests,
			{ onSuccess: (requests) => `${requests.length} requests fetched` },
		);
		const { add: addToQueue, getResolvePromise: getQueuePromise } =
			createQueue(100);
		const enabledRequests = trackerRequests.filter(
			(request) => request.enabled,
		);
		for (const request of enabledRequests) {
			addToQueue(async () => {
				const error = await notifyRequest(
					context.bot,
					context.logger,
					request,
					match,
				);
				if (error) {
					context.logger.warn(
						`Tracker request ${request._id} got telegram error: [${error.code}]: ${error.message}`,
					);
				}
			});
		}
		await getQueuePromise();
		await context.respond(
			`Отправил сообщение "${match}" ${enabledRequests.length} пользователям!`,
		);
	}),
};
