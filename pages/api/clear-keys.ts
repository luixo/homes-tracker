import type { NextApiRequest, NextApiResponse } from "next";
import { listAllKeys, removeKeys } from "../../server/services/s3";
import { extractTimestampFromKey, getCheckerKey } from "../../server/checkers";
import { globalLogger } from "../../server/logger";

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

const KEYS_LEFT = 3;

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const logger = globalLogger.child({ handler: "clear-keys" });
  try {
    const allKeys = await listAllKeys(logger);
    const sortedKeys = allKeys
      .map((key) => extractTimestampFromKey(key))
      .sort((a, b) => Number(a) - Number(b));

    const keysToRemove = sortedKeys
      .slice(KEYS_LEFT)
      .map((key) => getCheckerKey(key));
    if (keysToRemove.length === 0) {
      logger.info("Nothing to remove");
    } else {
      await removeKeys(logger, keysToRemove);
    }

    res.status(200).send({
      success: `Successfully removed ${keysToRemove.length} keys`,
    });
    logger.info("Done, 200");
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
    logger.info("Done, 500");
  }
}
