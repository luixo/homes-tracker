import type { ScrapedEntity } from "@/types/db/index";
import type { EntityId } from "@/types/ids";
import type { Logger } from "@/utils/logger";

import { withEntities } from "./collections";

export const init = async (logger: Logger) =>
	withEntities(logger, `Create entities indexes`, async (collection, db) => {
		await db.createCollection("entities");
		await collection.createIndexes([
			{ key: { entityId: 2, scraperId: 1 } },
			{ key: { scrapedTimestamp: 1 } },
		]);
	});

export const deleteAllEntities = async (logger: Logger) =>
	withEntities(logger, `Wipe entities`, async (collection) => {
		await collection.drop();
		await init(logger);
	});

export const getEntitiesByIds = async (logger: Logger, ids: EntityId[]) =>
	withEntities(logger, `Get entity by ids`, (collection) =>
		collection.find({ _id: { $in: ids } }).toArray(),
	);

export const getEntitiesIds = async (logger: Logger) =>
	withEntities(logger, `Get entity ids`, (collection) =>
		collection
			.find<
				Pick<ScrapedEntity, "entityId" | "scraperId">
			>({}, { projection: { entityId: 1, scraperId: 1 } })
			.toArray(),
	);

export const getEntitiesWithScrapedTimestampGt = async (
	logger: Logger,
	timestamp: number,
) =>
	withEntities(logger, `Get greater than timestamp entity`, (collection) =>
		collection.find({ scrapedTimestamp: { $gte: timestamp } }).toArray(),
	);

export const removeEntitiesWithPostedTimestampLt = async (
	logger: Logger,
	timestamp: number,
) =>
	withEntities(logger, `Get less than timestamp entity`, async (collection) => {
		const result = await collection.deleteMany({
			postedTimestamp: { $lte: timestamp },
		});
		return result.deletedCount;
	});

export const putEntity = async (logger: Logger, entity: ScrapedEntity) =>
	withEntities(logger, `Put entity id "${entity._id}"`, (collection) =>
		collection.insertOne(entity),
	);
