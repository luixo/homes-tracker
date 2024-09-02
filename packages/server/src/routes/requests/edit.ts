import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getChatLinkByChatId } from "@/db/request-chat-links";
import { upsertTrackerRequestEnabledStatus } from "@/db/requests";
import { clientProcedure } from "@/server/trpc";

export const handler = clientProcedure
	.input(
		z.object({
			enabled: z.boolean(),
		}),
	)
	.mutation(async ({ ctx, input: { enabled } }) => {
		const chatLink = await getChatLinkByChatId(ctx.logger, ctx.chatId);
		if (!chatLink) {
			throw new TRPCError({
				code: "PRECONDITION_FAILED",
				message: `Expected to have chat link for chat id ${ctx.chatId}`,
			});
		}
		await upsertTrackerRequestEnabledStatus(ctx.logger, chatLink._id, enabled);
	});
