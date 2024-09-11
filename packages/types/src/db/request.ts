import { z } from "zod";

import { filterStepValues } from "../filters/values";
import { filtersV1 } from "../filters-v1";
import { requestId } from "../ids";
import { notifier } from "../notifiers";

export const trackerRequestCity = z.literal("Tbilisi");
export type TrackerRequestCity = z.infer<typeof trackerRequestCity>;

const trackerRequestCommon = z.strictObject({
	_id: requestId,
	enabled: z.boolean(),
	notifiers: notifier.array(),
	notifiedTimestamp: z.number(),
	city: trackerRequestCity,
});
export const trackerRequestV1 = trackerRequestCommon.extend({
	version: z.literal("v1"),
	filter: filtersV1,
});
export type TrackerRequestV1 = z.infer<typeof trackerRequestV1>;
export const trackerRequestV2 = trackerRequestCommon.extend({
	version: z.literal("v2"),
	filters: filterStepValues,
});
export type TrackerRequestV2 = z.infer<typeof trackerRequestV2>;

export const trackerRequest = z.discriminatedUnion("version", [
	trackerRequestV1,
	trackerRequestV2,
]);
export type TrackerRequest = z.infer<typeof trackerRequest>;
