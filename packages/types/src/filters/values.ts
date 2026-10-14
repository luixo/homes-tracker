import { z } from "zod";

import { polygon } from "@/types/geojson";

import { selectOptionId, stepId } from "./ids";

export const rangeValue = z.strictObject({
	max: z.number().int(),
	min: z.number().int(),
});

const commonFilterValue = z.strictObject({
	id: stepId,
});

export const rangeStepValue = commonFilterValue.extend({
	range: rangeValue,
	type: z.literal("range"),
});
export type RangeStepValue = z.infer<typeof rangeStepValue>;
export const selectStepValue = commonFilterValue.extend({
	optionId: selectOptionId,
	type: z.literal("select"),
});
export type SelectStepValue = z.infer<typeof selectStepValue>;
export const multiSelectStepValue = commonFilterValue.extend({
	optionsIds: selectOptionId.array(),
	type: z.literal("multiselect"),
});
export type MultiSelectStepValue = z.infer<typeof multiSelectStepValue>;
export const mapStepValue = commonFilterValue.extend({
	polygons: polygon.array(),
	type: z.literal("map"),
});
export type MapStepValue = z.infer<typeof mapStepValue>;

export const filterStepValue = z.discriminatedUnion("type", [
	rangeStepValue,
	selectStepValue,
	multiSelectStepValue,
	mapStepValue,
]);
export type FilterStepValue = z.infer<typeof filterStepValue>;

export const filterStepValues = z.array(filterStepValue);
export type FilterStepValues = z.infer<typeof filterStepValues>;
