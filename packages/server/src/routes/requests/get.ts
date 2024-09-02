import { getChatLinkByChatId } from "@/db/request-chat-links";
import { getTrackerRequest } from "@/db/requests";
import { clientProcedure } from "@/server/trpc";

export const handler = clientProcedure.query(async ({ ctx }) => {
	const chatLink = await getChatLinkByChatId(ctx.logger, ctx.chatId);
	if (!chatLink) {
		return null;
	}
	return getTrackerRequest(ctx.logger, chatLink._id);
});
