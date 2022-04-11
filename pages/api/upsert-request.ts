import type { NextApiHandler } from "next";
import { TrackerRequest } from "../../server/types/request";
import { upsertTrackerRequest } from "../../server/utils/db/requests";
import { getTrackerRequestToChatLinkByRequestId } from "../../server/utils/db/request-chat-links";
import { DAY, MINUTE } from "../../server/utils/time";
import { withLogger } from "../../server/utils/logging";
import { getHandlerLogger } from "../../server/utils";

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

type CurrentTrackerRequest = Omit<
  TrackerRequest,
  "_id" | "notifiers" | "notifiedTimestamp" | "enabled"
>;

const handler: NextApiHandler<Response> = async (req, res) => {
  const method = req.method || "GET";
  if (method.toUpperCase() !== "POST") {
    return res.status(405).send({
      error: `Method ${method} not allowed`,
    });
  }
  const requestId = req.query.requestId;
  if (!requestId || Array.isArray(requestId)) {
    return res.status(400).send({
      error: 'No "requestId" in query or wrong format',
    });
  }
  const body = req.body as CurrentTrackerRequest;
  try {
    const id = await withLogger(
      getHandlerLogger(req),
      `Upsert tracker request for request id "${requestId}"`,
      async (logger) => {
        const chatTrackerLink = await getTrackerRequestToChatLinkByRequestId(
          logger,
          requestId
        );
        if (!chatTrackerLink) {
          return null;
        }
        const now = Date.now();
        return upsertTrackerRequest(logger, {
          ...body,
          _id: chatTrackerLink._id,
          enabled: true,
          notifiedTimestamp: now - 10 * MINUTE,
          notifiers: [
            {
              type: "telegram",
              chatId: chatTrackerLink.chatId,
            },
          ],
        });
      }
    );
    if (!id) {
      return res.status(400).send({
        error: `There is no tracker request "${requestId}"`,
      });
    }
    res.status(200).send({
      success: `Tracker request for chat ${id} updated`,
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
