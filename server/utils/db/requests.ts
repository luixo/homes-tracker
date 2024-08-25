import type { UpdateResult, WithId } from "mongodb";
import type winston from "winston";

import type { TrackerRequest } from "../../types/request";
import { withTrackerRequests } from "../collections";

export const getTrackerRequests = async (
  logger: winston.Logger
): Promise<TrackerRequest[]> =>
  withTrackerRequests(logger, `Fetch all`, (collection) =>
    collection.find({}).toArray()
  );

export const getTrackerRequest =
  (requestId: string) =>
  async (logger: winston.Logger): Promise<TrackerRequest | null> =>
    withTrackerRequests(logger, `Fetch all`, (collection) =>
      collection.findOne({ _id: requestId })
    );

export const upsertTrackerRequest = async (
  logger: winston.Logger,
  request: TrackerRequest
): Promise<string> =>
  withTrackerRequests(
    logger,
    `Upsert id ${request._id}`,
    async (collection) => {
      const matched = await collection.findOne({ _id: request._id });
      if (!matched) {
        const response = await collection.insertOne(request);
        return response.insertedId;
      }
      const response = await collection.replaceOne(
        { _id: request._id },
        request
      );
      return request._id;
    }
  );

export const upsertTrackerRequestEnabledStatus = async (
  logger: winston.Logger,
  requestId: string,
  nextStatus: boolean
): Promise<UpdateResult> =>
  withTrackerRequests(
    logger,
    `Update id ${requestId} enabled status`,
    (collection) =>
      collection.updateOne(
        { _id: requestId },
        { $set: { enabled: nextStatus } }
      )
  );

export const updateTrackerRequestWithTimestamp =
  (id: string) =>
  async (logger: winston.Logger): Promise<WithId<TrackerRequest> | null> =>
    withTrackerRequests(logger, `Update "${id}" with timestamp`, (collection) =>
      collection.findOneAndUpdate(
        { _id: id },
        { $set: { notifiedTimestamp: Date.now() } }
      )
    );
