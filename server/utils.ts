import type { NextApiRequest } from "next";
import Queue from "queue-promise";

import { globalLogger } from "./logger";

export const wait = async (ms: number): Promise<undefined> => {
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

export const createQueue = (
	interval: number,
	concurrent = 1,
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
		getResolvePromise: () =>
			new Promise((resolve) => {
				if (queue.size === 0) {
					resolve();
				} else {
					queue.on("end", resolve);
				}
			}),
	};
};

export const timeout = <T>(
	promise: Promise<T>,
	ms: number,
): Promise<T | undefined> => Promise.race<T | undefined>([promise, wait(ms)]);

let STOP_SIGNAL = false;
export const changeStopSignal = (nextSignal: boolean) => {
	STOP_SIGNAL = nextSignal;
};

export const getStopSignal = () => STOP_SIGNAL;

export const getHandlerLogger = (req: NextApiRequest) =>
	globalLogger.child({ handler: req.url?.replace("/api", "") });

export const nonNullishGuard = <T>(
	arg: T,
): arg is Exclude<T, null | undefined> => arg !== null && arg !== undefined;
