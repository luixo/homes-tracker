import type { NextApiRequest, NextApiResponse } from "next";
import TelegramBot from "node-telegram-bot-api";
import type winston from "winston";

import { notifyRequest } from "../../server/services/request";
import { formatScrapedEntity } from "../../server/services/scrapers";
import type { TelegramError } from "../../server/services/telegram";
import { createQueue, getHandlerLogger } from "../../server/utils";
import { getEntitiesWithScrapedTimestampGt } from "../../server/utils/db/entities";
import {
  getTrackerRequests,
  updateTrackerRequestWithTimestamp,
  upsertTrackerRequestEnabledStatus,
} from "../../server/utils/db/requests";
import { verifyEntityOverRequest as doesEntityMatchRequest } from "../../server/utils/filters";
import { withLogger } from "../../server/utils/logging";

const MAX_MATCHED_ENTITIES = 10;

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

const checkTelegramError = async (
  logger: winston.Logger,
  requestId: string,
  maybeError: TelegramError | undefined
) => {
  if (!maybeError) {
    return;
  }
  if (maybeError.message.includes("blocked by the user")) {
    logger.info(
      `Tracker request ${requestId} has been stopped because user blocked bot`
    );
    await upsertTrackerRequestEnabledStatus(logger, requestId, false);
  } else {
    logger.info(
      `Tracker request ${requestId} got telegram error: [${maybeError.code}]: ${maybeError.message}`
    );
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  try {
    const token = process.env.TELEGRAM_TOKEN || "";
    if (!token) {
      throw new Error("Please provider TELEGRAM_TOKEN environment variables");
    }

    const bot = new TelegramBot(token);
    await withLogger(getHandlerLogger(req), `Check handler`, async (logger) => {
      const trackerRequests = await withLogger(
        logger,
        `Fetching tracker requests`,
        (logger) => getTrackerRequests(logger),
        { onSuccess: (requests) => `${requests.length} requests fetched` }
      );
      const minimalTimestamp = trackerRequests.reduce(
        (minimalTimestamp, request) =>
          Math.min(minimalTimestamp, request.notifiedTimestamp),
        trackerRequests[0]?.notifiedTimestamp ?? 0
      );
      const entities = await withLogger(
        logger,
        `Fetching entities with minimal timestamp ${minimalTimestamp}`,
        (logger) => getEntitiesWithScrapedTimestampGt(logger, minimalTimestamp),
        { onSuccess: (entities) => `${entities.length} entities fetched` }
      );
      const { add: addToQueue, getResolvePromise: getQueuePromise } =
        createQueue(100);
      for (const request of trackerRequests) {
        if (!request.enabled) {
          logger.info(`Request ${request._id} is disabled`);
        } else {
          logger.info(
            `Looking up request ${request._id} with notified timestamp ${request.notifiedTimestamp}`
          );
          const matchedIds: string[] = [];
          for (const entity of entities) {
            if (entity.scrapedTimestamp < request.notifiedTimestamp) {
              continue;
            }
            const matches = doesEntityMatchRequest(entity, request);
            if (matches) {
              if (matchedIds.length < MAX_MATCHED_ENTITIES) {
                addToQueue(() =>
                  notifyRequest(
                    bot,
                    logger,
                    request,
                    formatScrapedEntity(entity),
                    entity.images?.slice(0, 3)
                  ).then((maybeError) =>
                    checkTelegramError(logger, request._id, maybeError)
                  )
                );
              } else if (matchedIds.length === MAX_MATCHED_ENTITIES) {
                addToQueue(() =>
                  notifyRequest(
                    bot,
                    logger,
                    request,
                    `У тебя больше ${MAX_MATCHED_ENTITIES} сообщений за одну проверку, кажется, надо сузить критерии`
                  ).then((maybeError) =>
                    checkTelegramError(logger, request._id, maybeError)
                  )
                );
              }
              matchedIds.push(entity._id);
            }
          }
          if (matchedIds.length === 0) {
            logger.info(`No new matched ids for request ${request._id}`);
          } else {
            void withLogger(
              logger,
              `Put ${matchedIds.length} entities for request ${request._id}`,
              async () => {
                if (matchedIds.length !== 0) {
                  // We used to put entities here, but it took too much CPU
                  // return putMatchedEntities(logger, request._id, matchedIds);
                }
              }
            ).catch((error) =>
              logger.error(
                `Error while putting ${matchedIds.length} entities for request ${request._id}: ${error}`
              )
            );
          }
        }
        void withLogger(
          logger,
          `Update request ${request._id} with current timestamp`,
          () => updateTrackerRequestWithTimestamp(logger, request._id)
        ).catch((error) =>
          logger.error(
            `Error while updating request ${request._id} with current timestamp: ${error}`
          )
        );
      }
      await getQueuePromise();
      res.status(200).send({ success: "Everything is verified" });
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
