import "server-only";

import { cache } from "react";

import { createHydrationHelpers } from "@trpc/react-query/rsc";

import type { RequestId } from "@/db/types";
import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";
import { globalLogger } from "@/utils/logger";
import { makeQueryClient } from "@/web/utils/query-client";

const getQueryClient = cache(makeQueryClient);

const rscLogger = globalLogger.child({ service: "trpc/rsc" });

const getRscCaller = (requestId?: RequestId) =>
	createCallerFactory(appRouter)(() => ({
		logger: rscLogger,
		auth: requestId ? { requestId } : null,
		source: "rsc",
	}));

export const generateHydrationHelpers = (requestId?: RequestId) =>
	createHydrationHelpers<typeof appRouter>(
		getRscCaller(requestId),
		getQueryClient,
	);
