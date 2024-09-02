import { z } from "zod";

import { addAdmin } from "@/db/admins";
import { chatId } from "@/db/types";
import { adminProcedure } from "@/server/trpc";

export const handler = adminProcedure
	.input(z.object({ chatId }))
	.mutation(async ({ ctx, input }) => {
		await addAdmin(ctx.logger, input.chatId);
	});

export default handler;
