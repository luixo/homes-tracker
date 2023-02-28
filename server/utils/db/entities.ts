import { DeleteResult, InsertOneResult } from "mongodb";
import winston from "winston";
import { EntityIdentification, ScrapedEntity } from "../../types/scraper";
import { withEntities } from "../collections";

export const init = async (logger: winston.Logger): Promise<string[]> => {
  return withEntities(logger, `Create indexes`, (collection) =>
    collection.createIndexes([
      { key: { entityId: 2, scraperId: 1 } },
      { key: { scrapedTimestamp: 1 } },
    ])
  );
};

export const deleteAllEntities = async (
  logger: winston.Logger
): Promise<boolean> => {
  return withEntities(logger, `Wipe`, (collection) => collection.drop());
};

export const getEntitiesByIds = async (
  logger: winston.Logger,
  ids: string[]
): Promise<ScrapedEntity[]> => {
  return withEntities(logger, `Get by ids`, (collection) =>
    collection.find({ _id: { $in: ids } }).toArray()
  );
};

export const getEntitiesIds = async (
  logger: winston.Logger
): Promise<EntityIdentification[]> => {
  return withEntities(logger, `Get ids`, (collection) =>
    collection.find({}, { projection: { entityId: 1, scraperId: 1 } }).toArray()
  );
};

export const getEntitiesWithScrapedTimestampGt = async (
  logger: winston.Logger,
  timestamp: number
): Promise<ScrapedEntity[]> => {
  return withEntities(logger, `Get greater than timestamp`, (collection) =>
    collection.find({ scrapedTimestamp: { $gte: timestamp } }).toArray()
  );
};

export const removeEntitiesWithPostedTimestampLt = async (
  logger: winston.Logger,
  timestamp: number
): Promise<number> => {
  return withEntities(logger, `Get less than timestamp`, async (collection) => {
    const result = await collection.deleteMany({ postedTimestamp: { $lte: timestamp } })
    return result.deletedCount;
  });
};

export const putEntity = async (
  logger: winston.Logger,
  entity: ScrapedEntity
): Promise<InsertOneResult<ScrapedEntity>> => {
  return withEntities(logger, `Put id "${entity._id}"`, (collection) =>
    collection.insertOne(entity)
  );
};

export const removeEntity = async (
  logger: winston.Logger,
  id: string
): Promise<DeleteResult> => {
  return withEntities(logger, `Remove id "${id}"`, (collection) =>
    collection.deleteOne({ _id: id })
  );
};
