import type { NextApiRequest, NextApiResponse } from "next";
import {
  getEntitiesDatabase,
  DatabaseEntityElement,
  sortEntities,
} from "../../server/service-helpers";
import { globalLogger } from "../../server/logger";
import { ENTITIES_FETCH_AMOUNT } from "../../client/service";

type Response =
  | {
      items: DatabaseEntityElement[];
    }
  | { error: string; stack?: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  const logger = globalLogger.child({ handler: req.url });
  const numberedTimestamp = Number(req.query.timestamp);
  const timestamp = isNaN(numberedTimestamp) ? Infinity : numberedTimestamp;
  if (!req.query.id || Array.isArray(req.query.id)) {
    return res.status(400).send({
      error: 'No "id" in query or wrong format',
    });
  }
  const numberedAmount = Number(req.query.amount);
  const amount = isNaN(numberedAmount) ? ENTITIES_FETCH_AMOUNT : numberedAmount;
  try {
    logger.info(`DB fetch: started`);
    const currentDb = await getEntitiesDatabase(logger);
    logger.info(`DB fetch: succeed`);
    const currentServiceElements = currentDb.services[req.query.id];
    if (!currentServiceElements) {
      return res.status(400).send({
        error: `Service "${req.query.id}" not found`,
      });
    }
    const sortedServiceElements = sortEntities(currentServiceElements);
    const cursorEntityIndex = sortedServiceElements.findIndex(
      (element) => element.timestamp < timestamp
    );
    const offsettedEntities =
      cursorEntityIndex === -1
        ? []
        : sortedServiceElements.slice(
            cursorEntityIndex,
            cursorEntityIndex + amount
          );
    res.status(200).send({
      items: offsettedEntities,
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
