import { router as routerFactory } from "@/server/trpc";

import { handler as edit } from "./edit";
import { handler as get } from "./get";
import { handler as getAll } from "./get-all";
import { handler as upsert } from "./upsert";

export const router = routerFactory({
	getAll,
	get,
	upsert,
	edit,
});
