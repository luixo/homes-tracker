import { router as routerFactory } from "@/server/trpc";

import { handler as get } from "./get";

export const router = routerFactory({
	get,
});
