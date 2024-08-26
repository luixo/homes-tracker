import Queue from "queue-promise";

export const wait = async (ms: number): Promise<undefined> => {
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

export const timeout = <T>(
	promise: Promise<T>,
	ms: number,
): Promise<T | undefined> => Promise.race<T | undefined>([promise, wait(ms)]);

export const createQueue = (
	interval: number,
	onReject: (err: unknown) => void,
	concurrent = 1,
): {
	add: (promiseFn: () => Promise<void>) => void;
	getResolvePromise: () => Promise<void>;
} => {
	const queue = new Queue({
		concurrent,
		interval,
	});
	queue.on("reject", (error) => onReject(error));
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
