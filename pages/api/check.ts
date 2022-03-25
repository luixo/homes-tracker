import type { NextApiRequest, NextApiResponse } from "next";
import winston from "winston";
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

const updateS3IfExist = async (
  logger: winston.Logger,
  checkData: CheckData<unknown>
): Promise<string | undefined> => {
  const nextKey = getCheckerKey(new Date().valueOf().toString());
  const updatedResults = checkData.filter((checkerData) => {
    const checkerDefintion = checkers[checkerData.id];
    return !checkerDefintion.isEmpty(checkerData.results);
  });
  if (updatedResults.length === 0) {
    return;
  }
  await putS3Key<CheckData<unknown>>(logger, nextKey, checkData);
  return nextKey;
};

const updateResults = async (
  logger: winston.Logger,
  prevKey: string,
  nextResults: CheckData<unknown>
): Promise<string | undefined> => {
  const prevResults = (await getS3Key<CheckData<unknown>>(logger, prevKey))!;
  const newResults = nextResults
    .map((nextResult) => {
      const matchedPrevResult = prevResults.find(
        (prevResult) => prevResult.id === nextResult.id
      );
      if (!matchedPrevResult) {
        return;
      }
      const checker = checkers[nextResult.id];
      return {
        id: checker.id,
        messages: checker.getNewResults(
          matchedPrevResult.results,
          nextResult.results
        ) as typeof nextResult.results,
      };
    })
    .filter((x): x is { id: string; messages: unknown } => Boolean(x));
  const messageGroups = newResults.map((result) => ({
    id: result.id,
    messages: checkers[result.id].getMessages(result.messages),
  }));
  const formattedMessages = messageGroups
    .map((group) => {
      if (group.messages.length === 0) {
        return;
      }
      return `${group.id}:\n${group.messages
        .map((message) => `${message.description}: ${message.url}`)
        .join("\n")}`;
    })
    .filter((x): x is string => Boolean(x));
  if (formattedMessages.length === 0) {
    logger.info("No updates to send to telegram");
    return;
  }
  await sendToTelegram(logger, formattedMessages.join("\n\n"));
  return updateS3IfExist(logger, nextResults);
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  const logger = globalLogger.child({ handler: "check" });
  try {
    const checkersValues = Object.values(checkers);
    logger.info(
      `Starting checks for ${checkersValues.length} checkers: ${checkersValues
        .map((checker) => checker.id)
        .join(", ")}`
    );
    const currentResults: CheckData<unknown> = await Promise.all(
      checkersValues.map(async (checker) => {
        return {
          id: checker.id,
          results: await checker.checkFn(logger),
        };
      })
    );
    logger.info(`Got results from ${checkersValues.length} checkers`);
    const lastKeys = await getLastKeys(logger);
    const nextKey =
      lastKeys.length === 0
        ? await updateS3IfExist(logger, currentResults)
        : await updateResults(logger, lastKeys[0], currentResults);
    res.status(200).send({
      success: nextKey
        ? `Successfully updated ${
            lastKeys.length !== 0 ? "next" : "first"
          } data: ${nextKey}`
        : `Nothing to update`,
    });
  } catch (e) {
    res.status(500).send({
      error: String(e),
      stack: e instanceof Error ? e.stack : undefined,
    });
  }
}
