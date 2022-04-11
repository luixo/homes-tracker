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
    if (
      !process.env.MONGO_USER ||
      !process.env.MONGO_PASSWORD ||
      !process.env.MONGO_DATABASE
    ) {
      throw new Error(
        "Env variables MONGO_USER, MONGO_PASSWORD and MONGO_DATABASE should be set"
      );
    }

    const url = util.format(
      "mongodb://%s:%s@%s/?replicaSet=%s&authSource=%s&ssl=true",
      process.env.MONGO_USER,
      process.env.MONGO_PASSWORD,
      ["rc1b-h3onmg2pozqsdzo0.mdb.yandexcloud.net:27018"].join(","),
      "rs01",
      process.env.MONGO_DATABASE
    );

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
  const db = mongoClient.db(process.env.MONGO_DATABASE);
  const result = await run(db);
  return result;
};
