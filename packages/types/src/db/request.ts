import { z } from "zod";

import { filtersV1 } from "@/types/filters-v1";
import { filterStepValues } from "@/types/filters/values";
import { requestId } from "@/types/ids";
import { notifier } from "@/types/notifiers";

export const trackerRequestCity = z.literal("Tbilisi");
export type TrackerRequestCity = z.infer<typeof trackerRequestCity>;

const trackerRequestCommon = z.strictObject({
	_id: requestId,
	city: trackerRequestCity,
	enabled: z.boolean(),
	notifiedTimestamp: z.number(),
	notifiers: notifier.array(),
});
export const trackerRequestV1 = trackerRequestCommon.extend({
	filter: filtersV1,
	version: z.literal("v1"),
});
export type TrackerRequestV1 = z.infer<typeof trackerRequestV1>;
export const trackerRequestV2 = trackerRequestCommon.extend({
	filters: filterStepValues,
	version: z.literal("v2"),
});
export type TrackerRequestV2 = z.infer<typeof trackerRequestV2>;

export const trackerRequest = z.discriminatedUnion("version", [
	trackerRequestV1,
	trackerRequestV2,
]);
export type TrackerRequest = z.infer<typeof trackerRequest>;
