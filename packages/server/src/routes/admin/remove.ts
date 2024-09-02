import { z } from "zod";

import { removeAdmin } from "@/db/admins";
import { chatId } from "@/db/types";
import { adminProcedure } from "@/server/trpc";

export const handler = adminProcedure
	.input(z.object({ chatId }))
	.mutation(async ({ ctx, input }) => {
		await removeAdmin(ctx.logger, input.chatId);
	});

export default handler;
