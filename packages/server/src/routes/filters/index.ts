import { router as routerFactory } from "@/server/trpc";

import { router as config } from "./config/index";
import { router as values } from "./values/index";

export const router = routerFactory({
	config,
	values,
});
