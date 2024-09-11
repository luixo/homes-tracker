import { TRPCError, initTRPC } from "@trpc/server";

import { getAdminIds } from "@/db/admins";
import type { ChatId } from "@/types/ids";
import type { Logger } from "@/utils/logger";
import { withLogger } from "@/utils/logger";

export type Context = {
	logger: Logger;
	auth: null | { chatId: ChatId };
	source: "ssr" | "csr" | "rsc" | "http" | "bot" | "unknown";
};

const t = initTRPC.context<Context>().create();

export const { router, createCallerFactory } = t;

export const procedure = t.procedure.use(async ({ path, type, next, ctx }) =>
	withLogger(ctx.logger, path, async (logger) => {
		const start = Date.now();
		const result = await next({ ctx: { logger } });
		const durationMs = Date.now() - start;
		if (result.ok) {
			logger.info("OK request timing:", { path, type, durationMs });
		} else {
			logger.error(result.error, "Non-OK request timing", {
				path,
				type,
				durationMs,
			});
		}
		return result;
	}),
);

export const clientProcedure = procedure.use(
	async ({ ctx: { auth, ...ctx }, next }) => {
		if (!auth) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "You should authorize by chat id or request id",
			});
		}
		return next({
			ctx: { ...ctx, chatId: auth.chatId },
		});
	},
);

export const adminProcedure = clientProcedure.use(async ({ ctx, next }) => {
	const adminIds = await getAdminIds(ctx.logger);
	if (!adminIds.includes(ctx.chatId)) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "You are not allowed here",
		});
	}
	return next();
});
