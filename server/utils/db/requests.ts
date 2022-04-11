import { ModifyResult, UpdateResult } from "mongodb";
import winston from "winston";
import { TrackerRequest } from "../../types/request";
import { withTrackerRequests } from "../collections";

export const getTrackerRequests = async (
  logger: winston.Logger
): Promise<TrackerRequest[]> => {
  return withTrackerRequests(logger, `Fetch all`, (collection) =>
    collection.find({}).toArray()
  );
};

export const getTrackerRequest = async (
  logger: winston.Logger,
  requestId: string
): Promise<TrackerRequest | null> => {
  return withTrackerRequests(logger, `Fetch all`, (collection) =>
    collection.findOne({ _id: requestId })
  );
};

export const upsertTrackerRequest = async (
  logger: winston.Logger,
  request: TrackerRequest
): Promise<string> => {
  return withTrackerRequests(
    logger,
    `Upsert id ${request._id}`,
    async (collection) => {
      const matched = await collection.findOne({ _id: request._id });
      if (!matched) {
        const response = await collection.insertOne(request);
        return response.insertedId;
      } else {
        const response = await collection.replaceOne(
          { _id: request._id },
          request
        );
        return request._id;
      }
    }
  );
};

export const upsertTrackerRequestEnabledStatus = async (
  logger: winston.Logger,
  requestId: string,
  nextStatus: boolean
): Promise<UpdateResult> => {
  return withTrackerRequests(
    logger,
    `Update id ${requestId} enabled status`,
    (collection) =>
      collection.updateOne(
        { _id: requestId },
        { $set: { enabled: nextStatus } }
      )
  );
};

export const updateTrackerRequestWithTimestamp = async (
  logger: winston.Logger,
  id: string
): Promise<ModifyResult<TrackerRequest>> => {
  return withTrackerRequests(
    logger,
    `Update "${id}" with timestamp`,
    (collection) =>
      collection.findOneAndUpdate(
        { _id: id },
        { $set: { notifiedTimestamp: Date.now() } }
      )
  );
};
