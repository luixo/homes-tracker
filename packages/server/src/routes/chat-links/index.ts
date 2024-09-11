import { router as routerFactory } from "@/server/trpc";

import { handler as upsert } from "./upsert";

export const router = routerFactory({
	upsert,
});
