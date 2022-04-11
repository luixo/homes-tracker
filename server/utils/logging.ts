import winston from "winston";

export type ActionFn<T> = (logger: winston.Logger) => Promise<T>;
export type WithLoggerOptions<T> = {
  onSuccess: (result: T) => string | undefined;
  skipStart: boolean;
  skipSuccess: boolean;
  skipFail: boolean;
};
export const withLogger = async <T>(
  logger: winston.Logger,
  action: string,
  actionFn: ActionFn<T>,
  options: Partial<WithLoggerOptions<T>> = {}
): Promise<T> => {
  logger = logger.child({ action });
  try {
    if (!options.skipStart) {
      logger.info("", { status: ">" });
    }
    const result = await actionFn(logger);
    if (!options.skipSuccess) {
      const successMessage = options.onSuccess ? options.onSuccess(result) : "";
      logger.info(successMessage || "", {
        status: "<",
      });
    }
    return result;
  } catch (e) {
    if (!options.skipFail) {
      logger.error("", {
        status: "!",
        error: e,
      });
    }
    throw e;
  }
};
