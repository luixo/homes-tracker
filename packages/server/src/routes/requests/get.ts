import { TRPCError } from "@trpc/server";

import { convertToLastRequest } from "@/db/convert-requests";
import { getChatLinkByChatId } from "@/db/request-chat-links";
import { getTrackerRequest } from "@/db/requests";
import { clientProcedure } from "@/server/trpc";

export const handler = clientProcedure.query(async ({ ctx }) => {
	const chatLink = await getChatLinkByChatId(ctx.logger, ctx.chatId);
	if (!chatLink) {
		throw new TRPCError({
			code: "PRECONDITION_FAILED",
			message: `Expected to have chat link for ${ctx.chatId}, find none.`,
		});
	}
	const unknownRequest = await getTrackerRequest(ctx.logger, chatLink._id);
	return unknownRequest ? convertToLastRequest(unknownRequest) : null;
});
