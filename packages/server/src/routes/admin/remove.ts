import { z } from "zod";

import { removeAdmin } from "@/db/admins";
import { adminProcedure } from "@/server/trpc";
import { chatId } from "@/types/ids";

export const handler = adminProcedure
	.input(z.object({ chatId }))
	.mutation(async ({ ctx, input }) => {
		await removeAdmin(ctx.logger, input.chatId);
	});

export default handler;
