import crypto from "node:crypto";
import type winston from "winston";

import type { TrackerRequest } from "../server/types/request";
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
    getTrackerRequestToChatLinkByChatId(chatId.toString())
  );
  if (!existingLink) {
    return null;
  }
  return withLogger(
    logger,
    `Fetching existing request for request id ${existingLink._id}`,
    getTrackerRequest(existingLink._id)
  );
};

export const createRequestByChatId = async (
  logger: winston.Logger,
  chatId: string
): Promise<string> => {
  const existingLink = await withLogger(
    logger,
    `Fetching existing link for chat id ${chatId}`,
    getTrackerRequestToChatLinkByChatId(chatId)
  );
  if (existingLink) {
    return existingLink._id;
  }
  const creationResponse = await withLogger(
    logger,
    `Creating link for chat id ${chatId}`,
    insertTrackerRequestToChatLink(crypto.randomUUID(), chatId)
  );
  if (!creationResponse) {
    throw new Error(`Cannot create link for chat id ${chatId}`);
  }
  return creationResponse.insertedId.toString();
};
