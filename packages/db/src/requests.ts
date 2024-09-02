import type { TrackerRequest } from "@/db/types";
import type { Logger } from "@/utils/logger";

import { withTrackerRequests } from "./collections";
import type { RequestId } from "./types/ids";

export const getTrackerRequests = async (logger: Logger) =>
	withTrackerRequests(logger, `Fetch all requests`, (collection) =>
		collection.find({}).toArray(),
	);

export const getTrackerRequest = async (logger: Logger, requestId: RequestId) =>
	withTrackerRequests(logger, `Fetch request id "${requestId}"`, (collection) =>
		collection.findOne({ _id: requestId }),
	);

export const upsertTrackerRequest = async (
	logger: Logger,
	request: TrackerRequest,
) =>
	withTrackerRequests(
		logger,
		`Upsert request id "${request._id}"`,
		async (collection) => {
			const matched = await collection.findOne({ _id: request._id });
			if (!matched) {
				const response = await collection.insertOne(request);
				return response.insertedId;
			}
			await collection.replaceOne({ _id: request._id }, request);
			return request._id;
		},
	);

export const upsertTrackerRequestEnabledStatus = async (
	logger: Logger,
	requestId: RequestId,
	nextStatus: boolean,
) =>
	withTrackerRequests(
		logger,
		`Update request id "${requestId}" enabled status`,
		(collection) =>
			collection.updateOne(
				{ _id: requestId },
				{ $set: { enabled: nextStatus } },
			),
	);

export const updateTrackerRequestWithTimestamp = async (
	logger: Logger,
	id: RequestId,
) =>
	withTrackerRequests(
		logger,
		`Update request "${id}" with timestamp`,
		(collection) =>
			collection.findOneAndUpdate(
				{ _id: id },
				{ $set: { notifiedTimestamp: Date.now() } },
			),
	);
