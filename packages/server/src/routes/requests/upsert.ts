import type { inferProcedureBuilderResolverOptions } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getChatLinkByChatId, insertChatLink } from "@/db/request-chat-links";
import { getTrackerRequest, upsertTrackerRequest } from "@/db/requests";
import { filters, generateRequestId } from "@/db/types";
import { clientProcedure } from "@/server/trpc";
import { MINUTE } from "@/utils/time";

const requestSchema = z.object({
	version: z.literal("v1"),
	city: z.literal("Tbilisi"),
	filters,
});

const getPartialData = async (
	ctx: inferProcedureBuilderResolverOptions<typeof clientProcedure>["ctx"],
) => {
	const chatLink = await getChatLinkByChatId(ctx.logger, ctx.chatId);
	if (!chatLink) {
		const requestId = generateRequestId();
		await insertChatLink(ctx.logger, requestId, ctx.chatId);
		return {
			id: requestId,
			notifiedTimestamp: Date.now() - 10 * MINUTE,
		};
	}
	const request = await getTrackerRequest(ctx.logger, chatLink._id);
	if (!request) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: `Request for chat id ${ctx.chatId} does not exist, but should.`,
		});
	}
	return {
		id: request._id,
		notifiedTimestamp: request.notifiedTimestamp,
	};
};

export const handler = clientProcedure
	.input(z.object({ request: requestSchema }))
	.mutation(
		async ({
			input: {
				request: { filters: filter, ...request },
			},
			ctx,
		}) => {
			const { id, notifiedTimestamp } = await getPartialData(ctx);
			await upsertTrackerRequest(ctx.logger, {
				...request,
				filter,
				_id: id,
				enabled: true,
				notifiedTimestamp,
				notifiers: [
					{
						type: "telegram",
						chatId: ctx.chatId,
					},
				],
			});
			return { id, notifiedTimestamp };
		},
	);
