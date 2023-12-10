import { NextApiRequest } from "next";
import Queue from "queue-promise";
import { globalLogger } from "./logger";

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const createQueue = (
  interval: number,
  concurrent = 1
): {
  add: (promiseFn: () => Promise<void>) => void;
  getResolvePromise: () => Promise<void>;
} => {
  const queue = new Queue({
    concurrent,
    interval,
  });
  return {
    add: (...args) => queue.enqueue(...args),
    getResolvePromise: () => new Promise((resolve) => queue.on("end", resolve)),
  };
};

export const timeout = <T>(
  promise: Promise<T>,
  ms: number
): Promise<T | void> => {
  return Promise.race<T | void>([promise, wait(ms)]);
};

let STOP_SIGNAL = false;
export const changeStopSignal = (nextSignal: boolean) => {
  STOP_SIGNAL = nextSignal;
};

export const getStopSignal = () => {
  return STOP_SIGNAL;
};

export const getHandlerLogger = (req: NextApiRequest) =>
  globalLogger.child({ handler: req.url?.replace("/api", "") });

export const nonNullishGuard = <T>(
  arg: T
): arg is Exclude<T, null | undefined> => arg !== null && arg !== undefined;
