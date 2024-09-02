import type { Collection, Document } from "mongodb";
import * as mongo from "mongodb";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type {
	Admin,
	RequestChatLink,
	ScrapedEntity,
	TrackerRequest,
} from "@/db/types";
import type { Logger } from "@/utils/logger";
import { withLogger } from "@/utils/logger";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.join(dirname, "../../../../");

let client: mongo.MongoClient | undefined;
const getClient = () => {
	if (client) {
		return client;
	}
	const url = process.env.MONGO_CONN_STRING;
	if (!url) {
		throw new Error("Env variable MONGO_CONN_STRING should be set");
	}

	const options =
		process.env.NODE_ENV === "production"
			? {
					tls: true,
					tlsCAFile: path.join(baseDir, "./root.crt"),
				}
			: {
					tlsInsecure: true,
				};
	client = new mongo.MongoClient(url, options);
	return client;
};

export const withMongo = async <T>(
	run: (db: mongo.Db) => Promise<T>,
): Promise<T> => {
	const mongoClient = getClient();
	await mongoClient.connect();
	const db = mongoClient.db();
	const result = await run(db);
	return result;
};

const withCollection =
	<C extends Document>(collectionName: string) =>
	async <T>(
		logger: Logger,
		action: string,
		run: (collection: Collection<C>, logger: Logger) => Promise<T>,
	): Promise<T> =>
		withLogger(
			logger.child({ service: "mongodb", collection: collectionName }),
			action,
			(innerLogger) =>
				withMongo((db) => run(db.collection<C>(collectionName), innerLogger)),
		);

export const withEntities = withCollection<ScrapedEntity>("entities");
export const withTrackerRequests = withCollection<TrackerRequest>("requests");
export const withChatRequestLinks =
	withCollection<RequestChatLink>("request-links");
export const withAdmins = withCollection<Admin>("admins");
