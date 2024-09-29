import { z } from "zod";

import { position } from "../geojson";

import { condition } from "./conditions";
import { selectOptionId, stepId } from "./ids";
import { rangeValue } from "./values";

const baseConfig = z.strictObject({
	id: stepId,
	title: z.string(),
	required: z.boolean().optional(),
	showCondition: condition.optional(),
	disabled: z.boolean().optional(),
});

export const rangeConfig = z.strictObject({
	defaultValues: rangeValue.optional(),
	placeholder: z.string().optional(),
	startContent: z.string().optional(),
	endContent: z.string().optional(),
	minLabel: z.string().optional(),
	maxLabel: z.string().optional(),
});

const select = z.strictObject({
	id: selectOptionId,
	value: z.string(),
});

export const selectConfig = z.strictObject({
	defaultValue: selectOptionId.optional(),
	options: select.array(),
});

export const multiSelectConfig = z.strictObject({
	defaultValues: selectOptionId.array().optional(),
	options: select.array(),
});

export const mapConfig = z.strictObject({
	initialCenter: position,
	initialZoom: z.number(),
});

export const rangeStep = baseConfig.extend({
	type: z.literal("range"),
	filter: rangeConfig,
});
export type RangeStep = z.infer<typeof rangeStep>;
export const selectStep = baseConfig.extend({
	type: z.literal("select"),
	filter: selectConfig,
});
export type SelectStep = z.infer<typeof selectStep>;
export const multiSelectStep = baseConfig.extend({
	type: z.literal("multiselect"),
	filter: multiSelectConfig,
});
export type MultiSelectStep = z.infer<typeof multiSelectStep>;
export const mapStep = baseConfig.extend({
	type: z.literal("map"),
	filter: mapConfig,
});
export type MapStep = z.infer<typeof mapStep>;

export const filterStep = z.discriminatedUnion("type", [
	rangeStep,
	selectStep,
	multiSelectStep,
	mapStep,
]);
export type FilterStep = z.infer<typeof filterStep>;

export const filterSteps = z.array(filterStep);
export type FilterSteps = z.infer<typeof filterSteps>;
