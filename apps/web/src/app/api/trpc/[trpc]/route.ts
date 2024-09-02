import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@/server/router";
import type { Context } from "@/server/trpc";
import { globalLogger } from "@/utils/logger";

const setCorsHeaders = (res: Response) => {
	res.headers.set("Access-Control-Allow-Origin", "*");
	res.headers.set("Access-Control-Request-Method", "*");
	res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
	res.headers.set("Access-Control-Allow-Headers", "*");
};

export const OPTIONS = () => {
	const response = new Response(null, {
		status: 204,
	});
	setCorsHeaders(response);
	return response;
};

const trpcLogger = globalLogger.child({ service: "trpc" });

const handler = async (req: Request) => {
	const response = await fetchRequestHandler({
		endpoint: "/api/trpc",
		router: appRouter,
		req,
		createContext: ({ req: { headers } }) => {
			const requestId = headers.get("x-request-id");
			const source = headers.get("x-trpc-source") as Context["source"] | null;
			return {
				logger: trpcLogger,
				auth: requestId ? { requestId } : null,
				source: source || "unknown",
			};
		},
		onError: trpcLogger.error,
	});

	setCorsHeaders(response);
	return response;
};

export { handler as GET, handler as POST };
