import { router as routerFactory } from "@/server/trpc";

import { router as admin } from "./admin";
import { router as cron } from "./cron";
import { router as requests } from "./requests";

export const router = routerFactory({
	cron,
	requests,
	admin,
});
