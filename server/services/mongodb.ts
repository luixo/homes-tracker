import * as mongo from "mongodb";
import path from "node:path";

const baseDir = path.join(__dirname, "../../");

let client: mongo.MongoClient | undefined;
const getClient = () => {
  if (client) {
    return client;
  }
  const url = process.env.MONGO_CONN_STRING;
  if (!url) {
    throw new Error("Env variable MONGO_CONN_STRING should be set");
  }

  client = new mongo.MongoClient(url, {
    tls: process.env.NODE_ENV === "production",
    tlsCAFile: path.join(baseDir, "./root.crt"),
  });
  return client;
};

export const withMongo = async <T>(
  run: (db: mongo.Db) => Promise<T>
): Promise<T> => {
  const mongoClient = getClient();
  await mongoClient.connect();
  const db = mongoClient.db();
  const result = await run(db);
  return result;
};
