import winston from "winston";
import crypto from "crypto";
import { TrackerRequest } from "../server/types/request";
import {
  getTrackerRequestToChatLinkByChatId,
  insertTrackerRequestToChatLink,
} from "../server/utils/db/request-chat-links";
import { getTrackerRequest } from "../server/utils/db/requests";
import { withLogger } from "../server/utils/logging";

export const getExistingRequestByChatId = async (
  logger: winston.Logger,
  chatId: string
): Promise<TrackerRequest | null> => {
  const existingLink = await withLogger(
    logger,
    `Fetching existing link for chat id ${chatId}`,
    async (logger) =>
      getTrackerRequestToChatLinkByChatId(logger, chatId.toString())
  );
  if (!existingLink) {
    return null;
  }
  return withLogger(
    logger,
    `Fetching existing request for request id ${existingLink._id}`,
    async (logger) => getTrackerRequest(logger, existingLink._id)
  );
};

export const createRequestByChatId = async (
  logger: winston.Logger,
  chatId: string
): Promise<string> => {
  const existingLink = await withLogger(
    logger,
    `Fetching existing link for chat id ${chatId}`,
    async (logger) => getTrackerRequestToChatLinkByChatId(logger, chatId)
  );
  if (existingLink) {
    return existingLink._id;
  }
  const creationResponse = await withLogger(
    logger,
    `Creating link for chat id ${chatId}`,
    async (logger) =>
      insertTrackerRequestToChatLink(logger, crypto.randomUUID(), chatId)
  );
  if (!creationResponse) {
    throw new Error(`Cannot create link for chat id ${chatId}`);
  }
  return creationResponse.insertedId.toString();
};
