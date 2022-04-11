import type { NextApiRequest, NextApiResponse } from "next";
import {
  getTrackerRequests,
  updateTrackerRequestWithTimestamp,
} from "../../server/utils/db/requests";
import { getEntitiesWithTimestamp } from "../../server/utils/db/entities";
import {
  notifyRequest,
  formatScrapedEntity,
} from "../../server/services/scrapers";
import { verifyEntityOverRequest as doesEntityMatchRequest } from "../../server/utils/filters";
import { putMatchedEntities } from "../../server/utils/db/request-matches";
import { createQueue, getHandlerLogger } from "../../server/utils";
import { withLogger } from "../../server/utils/logging";

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  try {
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
        (logger) => getEntitiesWithTimestamp(logger, minimalTimestamp),
        { onSuccess: (entities) => `${entities.length} entities fetched` }
      );
      const { add: addToQueue, getResolvePromise: getQueuePromise } =
        createQueue(100);
      for (const request of trackerRequests) {
        if (!request.enabled) {
          logger.info(`Request ${request._id} is disabled`);
          return false;
        }
        let matchedIds: string[] = [];
        for (const entity of entities) {
          if (entity.scrapedTimestamp < request.notifiedTimestamp) {
            continue;
          }
          const matches = doesEntityMatchRequest(entity, request);
          if (matches) {
            if (matchedIds.length < 10) {
              addToQueue(() =>
                notifyRequest(logger, formatScrapedEntity(entity), request)
              );
            } else if (matchedIds.length === 10) {
              addToQueue(() =>
                notifyRequest(
                  logger,
                  "У тебя больше 10 сообщений за одну проверку, кажется, надо сузить критерии",
                  request
                )
              );
            }
            matchedIds.push(entity._id);
          }
        }
        void withLogger(
          logger,
          `Put ${matchedIds.length} entities for request ${request._id}`,
          async () => {
            if (matchedIds.length !== 0) {
              return putMatchedEntities(logger, request._id, matchedIds);
            }
          }
        );
        void withLogger(
          logger,
          `Update request ${request._id} with current timestamp`,
          () => updateTrackerRequestWithTimestamp(logger, request._id)
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
