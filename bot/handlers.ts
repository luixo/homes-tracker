import TelegramBot from "node-telegram-bot-api";
import winston from "winston";
import { TrackerRequest } from "../server/types/request";
import { getTrackerRequestToChatLinkByChatId } from "../server/utils/db/request-chat-links";
import {
  getTrackerRequest,
  upsertTrackerRequest,
  upsertTrackerRequestEnabledStatus,
} from "../server/utils/db/requests";
import { withLogger } from "../server/utils/logging";
import { MINUTE } from "../server/utils/time";
import { formatRequest } from "./formatters";
import { parseRequest } from "./parsers";
import { createRequestByChatId, getExistingRequestByChatId } from "./utils";

export type BotContext = {
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
  "/request price-total min:200 max:300; area max:500; rooms min:5",
  "/request area min:100; bedrooms min:5",
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
  handler.adminOnly = true;
  return handler;
};

export const handlers: Record<string, BotHandler> = {
  help: async (context) => {
    context.respond(helpResponse);
  },
  start: async (context) => {
    const existingRequest = await getExistingRequestByChatId(
      context.logger,
      context.chatId
    );
    if (existingRequest) {
      context.respond(
        [
          `У нас уже есть твой запрос, он ${
            existingRequest.enabled ? "включен" : "выключен"
          }`,
          !existingRequest.enabled
            ? "Чтобы включить его - используй команду /enable"
            : `Чтобы поменять его - вызови команду /request`,
        ]
          .filter(Boolean)
          .join("\n")
      );
    } else {
      context.respond(
        `У тебя сейчас нет запроса, создай его с помощью команды /request`
      );
    }
  },
  stop: async (context) => {
    const existingRequest = await getExistingRequestByChatId(
      context.logger,
      context.chatId
    );
    if (!existingRequest || !existingRequest.enabled) {
      context.respond(`Пока!`);
      return;
    }
    await upsertTrackerRequestEnabledStatus(
      context.logger,
      existingRequest._id,
      false
    );
    context.respond(`Пока! Твой запрос пока выключаю`);
  },
  request: async (context, match) => {
    let existingRequest = await getExistingRequestByChatId(
      context.logger,
      context.chatId
    );
    if (!match) {
      if (existingRequest) {
        context.respond(
          [
            "Твой текущий запрос:",
            formatRequest(existingRequest),
            "",
            requestHelpResponse,
          ].join("\n")
        );
      } else {
        context.respond(
          ["У тебя нет запроса!", "", requestHelpResponse].join("\n")
        );
      }
      return;
    }
    const requestBody = parseRequest(match);
    if (Array.isArray(requestBody)) {
      context.respond(
        [
          "Я не понял твой запрос, а именно части:",
          ...requestBody,
          "",
          requestHelpResponse,
        ].join("\n")
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
      (logger) => upsertTrackerRequest(logger, nextRequest)
    );
    context.respond(
      `Твой запрос теперь:\n${formatRequest(nextRequest)}\nЖди уведомлений!`
    );
  },
  enable: async (context) => {
    const existingRequest = await getExistingRequestByChatId(
      context.logger,
      context.chatId
    );
    if (!existingRequest) {
      context.respond(
        `Невозможно включить запрос, его не существует. Создай запрос с помощью команды /request`
      );
      return;
    }
    if (existingRequest.enabled) {
      context.respond(`Запрос уже включен`);
      return;
    }
    await upsertTrackerRequestEnabledStatus(
      context.logger,
      existingRequest._id,
      true
    );
    context.respond(`Запрос теперь включен`);
  },
  disable: async (context) => {
    const existingRequest = await getExistingRequestByChatId(
      context.logger,
      context.chatId
    );
    if (!existingRequest) {
      context.respond(
        `Невозможно выключить запрос, его не существует. Создай запрос с помощью команды /request`
      );
      return;
    }
    if (!existingRequest.enabled) {
      context.respond(`Запрос уже выключен`);
      return;
    }
    await upsertTrackerRequestEnabledStatus(
      context.logger,
      existingRequest._id,
      false
    );
    context.respond(`Запрос теперь выключен`);
  },
  getUserRequest: restrictAdmin(async (context, lookupChatId) => {
    const maybeRequestLink = await getTrackerRequestToChatLinkByChatId(
      context.logger,
      lookupChatId
    );
    if (!maybeRequestLink) {
      context.respond(`Для пользователя ${lookupChatId} нет запроса`);
    } else {
      const request = await getTrackerRequest(
        context.logger,
        maybeRequestLink._id
      );
      if (!request) {
        context.respond(
          `Для пользователя обнаружена связь с запросом ${maybeRequestLink._id}, но сам запрос не обнаружен`
        );
      } else {
        context.respond(
          `Запрос пользователя ${lookupChatId} выглядит так:\n${formatRequest(
            request
          )}`
        );
      }
    }
    context.sendCard(lookupChatId);
  }),
};
