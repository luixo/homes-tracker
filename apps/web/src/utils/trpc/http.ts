import "server-only";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";
import { globalLogger } from "@/utils/logger";

const httpLogger = globalLogger.child({ service: "trpc/http" });

const createCaller = createCallerFactory(appRouter);
const httpCaller = createCaller({
	auth: null,
	logger: httpLogger,
	source: "http",
});

type HandlerOptions = {
	caller: typeof httpCaller;
	req: NextRequest;
};

export const wrapHttpHandler =
	(handler: (options: HandlerOptions) => Promise<unknown>) =>
	async (req: NextRequest) => {
		try {
			const data = await handler({ caller: httpCaller, req });
			return NextResponse.json({ data });
		} catch (error) {
			if (error instanceof TRPCError) {
				const httpStatusCode = getHTTPStatusCodeFromError(error);

				return NextResponse.json(
					{ error: { message: error.message } },
					{ status: httpStatusCode },
				);
			}

			return NextResponse.json(
				{ error: { error, message: `Unknown error` } },
				{ status: 500 },
			);
		}
	};
