import { getOrUpsertChatLinkByChatId } from "@/db/request-chat-links";
import { clientProcedure } from "@/server/trpc";

export const handler = clientProcedure.query(async ({ ctx }) =>
	getOrUpsertChatLinkByChatId(ctx.logger, ctx.chatId),
);
