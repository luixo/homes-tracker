import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { getChatLinkByRequestId } from "@/db/request-chat-links";
import { upsertTrackerRequest } from "@/db/requests";
import { procedure } from "@/server/trpc";
import { filterStepValues } from "@/types/filters/values";
import { requestId as requestIdType } from "@/types/ids";

export const handler = procedure
	.input(z.object({ requestId: requestIdType, filters: filterStepValues }))
	.mutation(async ({ input: { filters, requestId }, ctx }) => {
		const chatLink = await getChatLinkByRequestId(ctx.logger, requestId);
		if (!chatLink) {
			throw new TRPCError({
				code: "PRECONDITION_FAILED",
				message: `Expected to have chat link for request id ${requestId}`,
			});
		}
		await upsertTrackerRequest(ctx.logger, {
			version: "v2",
			city: "Tbilisi",
			filters,
			_id: requestId,
			enabled: true,
			notifiedTimestamp: Date.now(),
			notifiers: [
				{
					type: "telegram",
					chatId: chatLink.chatId,
				},
			],
		});
		return { id: requestId };
	});
