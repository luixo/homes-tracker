import util from "util";
import path from "path";
import * as mongo from "mongodb";
import { init as entitiesInit } from "../utils/db/entities";
import { init as requestLinksInit } from "../utils/db/request-chat-links";
import { globalLogger } from "../logger";

const baseDir = path.join(__dirname, "../../");

let client: mongo.MongoClient;
const getClient = () => {
  if (!client) {
    const url = process.env.MONGO_CONN_STRING;
    if (!url) {
      throw new Error("Env variable MONGO_CONN_STRING should be set");
    }

    client = new mongo.MongoClient(url, {
      sslCA:
        process.env.NODE_ENV === "production"
          ? path.join(baseDir, "./root.crt")
          : undefined,
      rejectUnauthorized: process.env.NODE_ENV === "production",
    });
  }
  return client;
};

let initialized = false;
export const withMongo = async <T>(
  run: (db: mongo.Db) => Promise<T>
): Promise<T> => {
  if (!initialized) {
    initialized = true;
    const initLogger = globalLogger.child({ handler: "init" });
    await Promise.all(
      [entitiesInit, requestLinksInit].map((init) => init(initLogger))
    );
  }
  const mongoClient = getClient();
  await mongoClient.connect();
  const db = mongoClient.db();
  const result = await run(db);
  return result;
};
