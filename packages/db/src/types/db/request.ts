import { z } from "zod";

import { filters } from "../filters";
import { requestId } from "../ids";
import { notifier } from "../notifiers";

export const trackerRequestCity = z.literal("Tbilisi");
export type TrackerRequestCity = z.infer<typeof trackerRequestCity>;

export const trackerRequestV1 = z.strictObject({
	_id: requestId,
	version: z.literal("v1"),
	city: trackerRequestCity,
	enabled: z.boolean(),
	notifiers: notifier.array(),
	filter: filters,
	notifiedTimestamp: z.number(),
});
export type TrackerRequestV1 = z.infer<typeof trackerRequestV1>;

export const trackerRequest = trackerRequestV1;
export type TrackerRequest = z.infer<typeof trackerRequest>;
