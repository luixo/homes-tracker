import { router as routerFactory } from "@/server/trpc";

import { handler as get } from "./get";
import { handler as getAll } from "./get-all";
import { handler as patch } from "./patch";

export const router = routerFactory({
	getAll,
	get,
	patch,
});
