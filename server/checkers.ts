import winston from "winston";
import { listAllKeys } from "./services/s3";

export type GetNewResults<T> = (prevResult: T[], nextResult: T[]) => T[];

export type Checker<T> = {
  id: string;
  checkFn: () => Promise<T[]>;
  getNewResults: GetNewResults<T>;
  getMessages: (results: T[]) => string[];
};

export type CheckData<T> = {
  id: string;
  results: T[];
}[];

export const CHECKERS_PREFIX = "checkers/";

export const getCheckerKey = (postfix: string) => {
  return `${CHECKERS_PREFIX}${postfix}`;
};

export const extractTimestampFromKey = (key: string): string => {
  return key.split(CHECKERS_PREFIX).filter(Boolean)[0];
};

export const getLastKey = async (
  logger: winston.Logger
): Promise<string | undefined> => {
  logger.info("Fetching last key");
  const keys = await listAllKeys(logger, CHECKERS_PREFIX);
  const lastKeyTimestamp = keys
    .map(extractTimestampFromKey)
    .sort((a, b) => Number(a) - Number(b))[0];
  if (!lastKeyTimestamp) {
    logger.info(`Got no last key!`);
    return;
  }
  const lastKey = getCheckerKey(lastKeyTimestamp);
  logger.info(`Got last key: ${lastKey}`);
  return lastKey;
};
