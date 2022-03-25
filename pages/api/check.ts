import type { NextApiRequest, NextApiResponse } from "next";
import { getS3Key, putS3Key } from "../../server/services/s3";
import {
  CheckData,
  getCheckerKey,
  getLastKeys,
  checkers,
} from "../../server/checkers";
import { sendToTelegram } from "../../server/services/telegram";
import { globalLogger } from "../../server/logger";

type Response =
  | {
      success: string;
    }
  | { error: string; stack?: string };

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const logger = globalLogger.child({ handler: "check" });
  try {
    const checkersValues = Object.values(checkers);
    logger.info(
      `Starting checks for ${checkers.length} checkers: ${checkersValues
        .map((checker) => checker.id)
        .join(", ")}`
    );
    const currentResults: CheckData<unknown> = await Promise.all(
      checkersValues.map((checker) => {
        return {
          id: checker.id,
          results: checker.checkFn(),
        };
      })
    );
    logger.info(`Got results from ${checkersValues.length} checkers`);
    const lastKeys = await getLastKeys(logger);
    if (lastKeys.length !== 0) {
      const prevResults = await getS3Key<CheckData<unknown>>(
        logger,
        lastKeys[0]
      );
      if (prevResults) {
        const messageGroups = currentResults.map((nextResult, index) => {
          const prevResult = prevResults.find(
            (result) => result.id === nextResult.id
          );
          if (!prevResult) {
            return;
          }
          const checker = checkers[nextResult.id];
          const newResults = checker.getNewResults(
            prevResult.results,
            nextResult.results
          );
          return {
            id: checker.id,
            messages: checker.getMessages(newResults),
          };
        });
        const formattedMessages = messageGroups
          .map((group) => {
            if (!group || group.messages.length === 0) {
              return;
            }
            return `On id ${group.id}:\n${group.messages.join("\n")}`;
          })
          .filter((x): x is string => Boolean(x));
        if (formattedMessages.length !== 0) {
          await sendToTelegram(logger, formattedMessages.join("\n\n"));
        } else {
          logger.info("No updates to send to telegram");
        }
      }
    }
    const nextKey = getCheckerKey(new Date().valueOf().toString());
    await putS3Key<CheckData<unknown>>(logger, nextKey, currentResults);
    res.status(200).send({
      success: `Successfully updated ${
        lastKeys ? "next" : "first"
      } data: ${nextKey}`,
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
