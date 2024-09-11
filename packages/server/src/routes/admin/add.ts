import { z } from "zod";

import { addAdmin } from "@/db/admins";
import { adminProcedure } from "@/server/trpc";
import { chatId } from "@/types/ids";

export const handler = adminProcedure
	.input(z.object({ chatId }))
	.mutation(async ({ ctx, input }) => {
		await addAdmin(ctx.logger, input.chatId);
	});

export default handler;
