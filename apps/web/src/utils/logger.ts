import type { NextApiRequest } from "next";

import { globalLogger } from "@/utils/logger";

export const getHandlerLogger = (req: NextApiRequest) =>
	globalLogger.child({ handler: req.url?.replace("/api", "") });
