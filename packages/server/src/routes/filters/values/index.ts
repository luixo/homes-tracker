import { router as routerFactory } from "@/server/trpc";

import { handler as get } from "./get";
import { handler as put } from "./put";

export const router = routerFactory({
	get,
	put,
});
