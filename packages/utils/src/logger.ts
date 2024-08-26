import winston from "winston";

export type Logger = winston.Logger;

const getMessagePrefix =
	<T = string>(prefix: string, transformer?: (value: T) => T) =>
	(info: winston.Logform.TransformableInfo) => {
		let messagePrefix: T | undefined;
		const rawInfo = info[prefix] as T | undefined;
		if (rawInfo) {
			messagePrefix = transformer ? transformer(rawInfo) : rawInfo;
			// eslint-disable-next-line no-param-reassign
			delete info[prefix];
		}
		return messagePrefix;
	};

const createFormat = winston.format((info) => {
	const prefixes = [
		getMessagePrefix("timestamp", (timestamp) =>
			new Date(timestamp).toISOString().slice(11, 23),
		),
		getMessagePrefix("handler"),
		getMessagePrefix("status"),
		getMessagePrefix("service"),
		getMessagePrefix("collection"),
		getMessagePrefix("scraper"),
	].map((prefixFn) => prefixFn(info));

	const actionMessagePrefix = getMessagePrefix("action")(info);
	const filteredPrefixes = prefixes
		.filter(Boolean)
		.map((prefix) => `[${prefix}]`)
		.join(" ");
	const message = [actionMessagePrefix, info.message]
		.filter(Boolean)
		.join(": ");
	return { ...info, message: `${filteredPrefixes} ${message}` };
});

export const globalLogger = winston.createLogger({
	level: "info",
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.timestamp(),
				createFormat(),
				winston.format.simple(),
			),
		}),
	],
});

type ActionFn<T> = (logger: Logger) => Promise<T>;
type WithLoggerOptions<T> = {
	onSuccess: (result: T) => string | undefined;
	skipStart: boolean;
	skipSuccess: boolean;
	skipFail: boolean;
};
export const withLogger = async <T>(
	logger: Logger,
	action: string,
	actionFn: ActionFn<T>,
	options: Partial<WithLoggerOptions<T>> = {},
): Promise<T> => {
	const nextLogger = logger.child({ action });
	try {
		if (!options.skipStart) {
			nextLogger.info("", { status: ">" });
		}
		const result = await actionFn(nextLogger);
		if (!options.skipSuccess) {
			const successMessage = options.onSuccess ? options.onSuccess(result) : "";
			nextLogger.info(successMessage || "", {
				status: "<",
			});
		}
		return result;
	} catch (e) {
		if (!options.skipFail) {
			nextLogger.error("", {
				status: "!",
				error: e,
			});
		}
		throw e;
	}
};
