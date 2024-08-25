import type { NextApiHandler } from "next";
import crypto from "node:crypto";

import { getHandlerLogger } from "../../server/utils";
import {
  getTrackerRequestToChatLinkByChatId,
  insertTrackerRequestToChatLink,
} from "../../server/utils/db/request-chat-links";
import { withLogger } from "../../server/utils/logging";

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

const handler: NextApiHandler<Response> = async (req, res) => {
  const logger = getHandlerLogger(req);
  const { chatId } = req.query;
  if (!chatId || Array.isArray(chatId)) {
    return res.status(400).send({
      error: 'No "chatId" in query or wrong format',
    });
  }
  try {
    const existingId = await withLogger(
      logger,
      `Get existing request id with ${chatId} chat id`,
      getTrackerRequestToChatLinkByChatId(chatId)
    );
    if (existingId) {
      return res.status(400).send({
        error: `There is already a request id "${existingId._id}" for chat id "${chatId}"`,
      });
    }
    const chatLinkResult = await withLogger(
      logger,
      `Create request id for chat id "${chatId}"`,
      insertTrackerRequestToChatLink(crypto.randomUUID(), chatId)
    );
    res.status(200).send({
      success: `Chat link for chat "${chatId}" created: "${chatLinkResult.insertedId}"`,
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
