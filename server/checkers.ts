import winston from "winston";
import { listAllKeys } from "./services/s3";

import { checker as myHomeChecker } from "./scraped/myhome";

export type GetNewResults<T> = (prevResult: T, nextResult: T) => T;

export type Checker<T> = {
  id: string;
  checkFn: () => Promise<T>;
  getNewResults: GetNewResults<T>;
  getMessages: (results: T) => {
    description: string;
    url: string;
  }[];
  isEmpty: (data: T) => boolean;
};

export type CheckData<T> = {
  id: string;
  results: T;
}[];

export const CHECKERS_PREFIX = "checkers/";

export const getCheckerKey = (postfix: string) => {
  return `${CHECKERS_PREFIX}${postfix}`;
};

export const extractTimestampFromKey = (key: string): string => {
  return key.split(CHECKERS_PREFIX).filter(Boolean)[0];
};

export const getLastKeys = async (
  logger: winston.Logger
): Promise<string[]> => {
  logger.info("Fetching last key");
  const keys = await listAllKeys(logger, CHECKERS_PREFIX);
  const lastKeysTimestamps = keys
    .map(extractTimestampFromKey)
    .sort((a, b) => Number(a) - Number(b));
  if (lastKeysTimestamps.length === 0) {
    logger.info(`Got no last key!`);
  } else {
    logger.info(`Got last key: ${getCheckerKey(lastKeysTimestamps[0])}`);
  }
  return lastKeysTimestamps.map(getCheckerKey).reverse();
};

export const checkers: Record<string, Checker<unknown>> = [
  myHomeChecker,
].reduce<Record<string, Checker<any>>>((acc, checker) => {
  acc[checker.id] = checker;
  return acc;
}, {});
