import { z } from "zod";

import { adminProcedure } from "@/server/trpc";
import { changeStopSignal } from "@/utils/signals";

export const handler = adminProcedure
	.input(z.object({ nextSignal: z.boolean() }))
	.mutation(({ input }) => {
		changeStopSignal(input.nextSignal);
	});

export default handler;
