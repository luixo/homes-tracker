import type { DeleteResult, InsertOneResult } from "mongodb";

import type { ScrapedEntity } from "@/db/types";
import type { Logger } from "@/utils/logger";

import { withEntities } from "./collections";

export const init = async (logger: Logger): Promise<string[]> =>
	withEntities(logger, `Create indexes`, (collection) =>
		collection.createIndexes([
			{ key: { entityId: 2, scraperId: 1 } },
			{ key: { scrapedTimestamp: 1 } },
		]),
	);

export const deleteAllEntities = async (logger: Logger): Promise<boolean> =>
	withEntities(logger, `Wipe`, (collection) => collection.drop());

export const getEntitiesByIds = async (
	logger: Logger,
	ids: string[],
): Promise<ScrapedEntity[]> =>
	withEntities(logger, `Get by ids`, (collection) =>
		collection.find({ _id: { $in: ids } }).toArray(),
	);

export const getEntitiesIds = async (
	logger: Logger,
): Promise<Pick<ScrapedEntity, "entityId" | "scraperId">[]> =>
	withEntities(logger, `Get ids`, (collection) =>
		collection
			.find({}, { projection: { entityId: 1, scraperId: 1 } })
			.toArray(),
	);

export const getEntitiesWithScrapedTimestampGt =
	(timestamp: number) =>
	async (logger: Logger): Promise<ScrapedEntity[]> =>
		withEntities(logger, `Get greater than timestamp`, (collection) =>
			collection.find({ scrapedTimestamp: { $gte: timestamp } }).toArray(),
		);

export const removeEntitiesWithPostedTimestampLt =
	(timestamp: number) =>
	async (logger: Logger): Promise<number> =>
		withEntities(logger, `Get less than timestamp`, async (collection) => {
			const result = await collection.deleteMany({
				postedTimestamp: { $lte: timestamp },
			});
			return result.deletedCount;
		});

export const putEntity = async (
	logger: Logger,
	entity: ScrapedEntity,
): Promise<InsertOneResult<ScrapedEntity>> =>
	withEntities(logger, `Put id "${entity._id}"`, (collection) =>
		collection.insertOne(entity),
	);

export const removeEntity = async (
	logger: Logger,
	id: string,
): Promise<DeleteResult> =>
	withEntities(logger, `Remove id "${id}"`, (collection) =>
		collection.deleteOne({ _id: id }),
	);
