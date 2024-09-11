import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { convertToLastRequest } from "@/db/convert-requests";
import { getChatLinkByRequestId } from "@/db/request-chat-links";
import { getTrackerRequest } from "@/db/requests";
import { procedure } from "@/server/trpc";
import { requestId as requestIdType } from "@/types/ids";

export const handler = procedure
	.input(z.object({ requestId: requestIdType }))
	.query(async ({ ctx, input: { requestId } }) => {
		const chatLink = await getChatLinkByRequestId(ctx.logger, requestId);
		if (!chatLink) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: `Request id ${requestId} not found`,
			});
		}
		const request = await getTrackerRequest(ctx.logger, requestId);
		if (!request) {
			return [];
		}
		return convertToLastRequest(request).filters;
	});
