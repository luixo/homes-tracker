import { router as routerFactory } from "@/server/trpc";

import { handler as check } from "./check";
import { handler as cleanup } from "./cleanup";
import { handler as updateDb } from "./update-db";

export const router = routerFactory({
	check,
	cleanup,
	updateDb,
});
