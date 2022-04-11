import { InsertOneResult, UpdateResult } from "mongodb";
import winston from "winston";
import { withRequestMatches } from "../collections";

export const putMatchedEntities = async (
  logger: winston.Logger,
  requestId: string,
  ids: string[]
): Promise<UpdateResult | InsertOneResult> => {
  return withRequestMatches(
    logger,
    `Put match ids (${ids.length})`,
    async (collection) => {
      const match = await collection.findOne({ _id: requestId });
      if (match) {
        const nextIds = Array.from(new Set([...match.matchIds, ...ids]));
        return collection.updateOne(
          { _id: requestId },
          { $set: { matchIds: nextIds } }
        );
      } else {
        return collection.insertOne({ _id: requestId, matchIds: ids });
      }
    }
  );
};

export const getMatchedEntities = async (
  logger: winston.Logger,
  requestId: string
): Promise<string[]> => {
  return withRequestMatches(
    logger,
    `Get match ids for "${requestId}"`,
    async (collection) => {
      const result = await collection.findOne({ _id: requestId });
      return result ? result.matchIds : [];
    }
  );
};
