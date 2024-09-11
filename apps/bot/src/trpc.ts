import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";
import type { ChatId } from "@/types/ids";
import { globalLogger } from "@/utils/logger";

const botLogger = globalLogger.child({ service: "trpc/bot" });

const createCaller = createCallerFactory(appRouter);
export const getCaller = (chatId: ChatId) =>
	createCaller({ logger: botLogger, auth: { chatId }, source: "bot" });
