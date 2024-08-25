import type winston from "winston";

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
