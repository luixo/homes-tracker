import { router as routerFactory } from "@/server/trpc";

import { handler as add } from "./add";
import { handler as remove } from "./remove";
import { handler as setStopSignal } from "./set-stop-signal";

export const router = routerFactory({
	setStopSignal,
	add,
	remove,
});
