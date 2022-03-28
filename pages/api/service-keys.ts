import type { NextApiRequest, NextApiResponse } from "next";
import { getEntitiesDatabase } from "../../server/service-helpers";
import { globalLogger } from "../../server/logger";

type Response =
  | {
      keys: string[];
    }
  | { error: string; stack?: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  const logger = globalLogger.child({ handler: req.url });
  try {
    logger.info(`DB fetch: started`);
    const database = await getEntitiesDatabase(logger);
    logger.info(`DB fetch: succeed`);
    res.status(200).send({
      keys: Object.keys(database.services),
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
