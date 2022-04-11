import winston from "winston";

const getMessagePrefix =
  <T>(prefix: string, transformer?: (value: T) => string) =>
  (info: winston.Logform.TransformableInfo) => {
    let messagePrefix;
    if (info[prefix]) {
      messagePrefix = transformer ? transformer(info[prefix]) : info[prefix];
      delete info[prefix];
    }
    return messagePrefix;
  };

const createFormat = winston.format((info) => {
  const prefixes = [
    getMessagePrefix<string>("timestamp", (timestamp) =>
      new Date(timestamp).toISOString().slice(11, 23)
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
  info.message = `${filteredPrefixes} ${message}`;
  return info;
});

export const globalLogger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        createFormat(),
        winston.format.simple()
      ),
    }),
  ],
});
