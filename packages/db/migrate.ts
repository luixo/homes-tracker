import { init as entitiesInit } from "@/db/entities";
import { init as requestLinksInit } from "@/db/request-chat-links";
import { globalLogger } from "@/utils/logger";

export const migrate = async () => {
	const initLogger = globalLogger.child({ handler: "init" });
	await Promise.all(
		[entitiesInit, requestLinksInit].map((init) => init(initLogger)),
	);
};

void migrate();
