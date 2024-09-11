import "server-only";

import { cache } from "react";

import { createHydrationHelpers } from "@trpc/react-query/rsc";

import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";
import { globalLogger } from "@/utils/logger";
import { makeQueryClient } from "@/web/utils/query-client";

const getQueryClient = cache(makeQueryClient);

const rscLogger = globalLogger.child({ service: "trpc/rsc" });

const getRscCaller = cache(() =>
	createCallerFactory(appRouter)({
		logger: rscLogger,
		auth: null,
		source: "rsc",
	}),
);

export const generateHydrationHelpers = () =>
	createHydrationHelpers<typeof appRouter>(getRscCaller(), getQueryClient);
