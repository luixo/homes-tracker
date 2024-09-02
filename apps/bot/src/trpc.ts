import type { ChatId } from "@/db/types";
import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";
import { globalLogger } from "@/utils/logger";

const botLogger = globalLogger.child({ service: "trpc/bot" });

const createCaller = createCallerFactory(appRouter);
export const getCaller = (chatId: ChatId) =>
	createCaller({ logger: botLogger, auth: { chatId }, source: "bot" });
