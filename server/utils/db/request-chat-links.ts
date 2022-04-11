import { InsertOneResult } from "mongodb";
import winston from "winston";
import { RequestChatLink } from "../../types/request";
import { withChatRequestLinks } from "../collections";

export const init = async (logger: winston.Logger): Promise<string[]> => {
  return withChatRequestLinks(logger, "Create indexes", (collection) =>
    collection.createIndexes([{ key: { chatId: 1 } }])
  );
};

export const insertTrackerRequestToChatLink = async (
  logger: winston.Logger,
  requestId: string,
  chatId: string
): Promise<InsertOneResult> => {
  return withChatRequestLinks(
    logger,
    `Insert "${requestId}" to chat "${chatId}"`,
    async (collection) => collection.insertOne({ _id: requestId, chatId })
  );
};

export const getTrackerRequestToChatLinkByChatId = async (
  logger: winston.Logger,
  chatId: string
): Promise<RequestChatLink | null> => {
  return withChatRequestLinks(
    logger,
    `Insert by chat "${chatId}" chat id`,
    (collection) => collection.findOne({ chatId })
  );
};

export const getTrackerRequestToChatLinkByRequestId = async (
  logger: winston.Logger,
  requestId: string
): Promise<RequestChatLink | null> => {
  return withChatRequestLinks(
    logger,
    `Insert by chat "${requestId}" request id`,
    (collection) => collection.findOne({ _id: requestId })
  );
};
