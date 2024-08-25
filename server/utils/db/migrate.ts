import { globalLogger } from "../../logger";

import { init as entitiesInit } from "./entities";
import { init as requestLinksInit } from "./request-chat-links";

export const migrate = async () => {
  const initLogger = globalLogger.child({ handler: "init" });
  await Promise.all(
    [entitiesInit, requestLinksInit].map((init) => init(initLogger))
  );
};

void migrate();
