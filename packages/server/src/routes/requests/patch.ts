import { TRPCError } from "@trpc/server";

import { getChatLinkByChatId } from "@/db/request-chat-links";
import { updateTrackerRequest } from "@/db/requests";
import { clientProcedure } from "@/server/trpc";
import { trackerRequestV2 } from "@/types/db/request";

export const handler = clientProcedure
	.input(trackerRequestV2.partial())
	.mutation(async ({ ctx, input: request }) => {
		const chatLink = await getChatLinkByChatId(ctx.logger, ctx.chatId);
		if (!chatLink) {
			throw new TRPCError({
				code: "PRECONDITION_FAILED",
				message: `Expected to have chat link for chat id ${ctx.chatId}`,
			});
		}
		await updateTrackerRequest(ctx.logger, chatLink._id, request);
	});
