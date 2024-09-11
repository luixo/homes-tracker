import type { Color } from "colorette";
import type { LogDescriptor } from "pino";
import { pino } from "pino";
import { PinoPretty } from "pino-pretty";

export type Logger = pino.Logger;

const getMessagePrefix = (
	log: LogDescriptor,
	prefix: string,
	parser: (message: string) => string,
	...colors: Color[]
) => {
	if (!log[prefix]) {
		return;
	}
	return colors.reduce(
		(acc, value) => value(acc),
		parser(log[prefix] as string),
	);
};

const prettyTransport = PinoPretty({
	messageFormat: (log, messageKey, levelLabel, { colors }) =>
		`${[
			getMessagePrefix(
				log,
				"handler",
				(message) => `[H | ${message}]`,
				colors.magenta,
			),
			getMessagePrefix(log, "status", (message) => `[${message}]`, colors.cyan),
			getMessagePrefix(log, "service", (message) => `[⚙️ | ${message}]`),
			getMessagePrefix(log, "collection", (message) => `[📚 > ${message}]`),
			getMessagePrefix(log, "scraper", (message) => `[📔 ${message}]`),
			getMessagePrefix(
				log,
				"action",
				(message) => message,
				colors.bgGreen,
				colors.white,
			),
		]
			.filter(Boolean)
			.join(" ")} ${log[messageKey] as string}`,
	ignore: "pid,hostname",
});

export const globalLogger = pino(
	{
		level: "info",
		formatters: {
			bindings: () => ({}),
		},
	},
	process.env.NODE_ENV === "production" ? undefined : prettyTransport,
);

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
			nextLogger.error(e, `Action ${action} failed`, { status: "!" });
		}
		throw e;
	}
};

process.on("uncaughtException", (err) => {
	globalLogger.error(err, "Uncaught exception detected");
});
