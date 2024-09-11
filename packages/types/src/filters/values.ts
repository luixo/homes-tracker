import { z } from "zod";

import { polygon } from "../geojson";

import { selectOptionId, stepId } from "./ids";

export const rangeValue = z.strictObject({
	min: z.number().int(),
	max: z.number().int(),
});

const commonFilterValue = z.strictObject({
	id: stepId,
});

export const rangeStepValue = commonFilterValue.extend({
	type: z.literal("range"),
	range: rangeValue,
});
export type RangeStepValue = z.infer<typeof rangeStepValue>;
export const selectStepValue = commonFilterValue.extend({
	type: z.literal("select"),
	optionId: selectOptionId,
});
export type SelectStepValue = z.infer<typeof selectStepValue>;
export const multiSelectStepValue = commonFilterValue.extend({
	type: z.literal("multiselect"),
	optionsIds: selectOptionId.array(),
});
export type MultiSelectStepValue = z.infer<typeof multiSelectStepValue>;
export const mapStepValue = commonFilterValue.extend({
	type: z.literal("map"),
	polygons: polygon.array(),
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
