import type { NextApiRequest, NextApiResponse } from "next";
import { removeEntitiesWithPostedTimestampLt } from "../../server/utils/db/entities";
import { getHandlerLogger } from "../../server/utils";
import { withLogger } from "../../server/utils/logging";
import { DAY } from "../../server/utils/time";

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
  try {
    await withLogger(getHandlerLogger(req), `Cleanup handler`, async (logger) => {
      const today = Date.now();
      const maximumTimestamp = today - 30 * DAY;
      const entitiesRemoved = await withLogger(
        logger,
        `Fetching tracker requests`,
        (logger) => removeEntitiesWithPostedTimestampLt(logger, maximumTimestamp),
        { onSuccess: (entitiesRemoved) => `${entitiesRemoved} entities removed` }
      );
      res.status(200).send({ success: `${entitiesRemoved} entities removed` });
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
};

export default handler;
