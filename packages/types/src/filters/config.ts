import { z } from "zod";

import { position } from "@/types/geojson";

import { condition } from "./conditions";
import { selectOptionId, stepId } from "./ids";
import { rangeValue } from "./values";

const baseConfig = z.strictObject({
	disabled: z.boolean().optional(),
	id: stepId,
	required: z.boolean().optional(),
	showCondition: condition.optional(),
	title: z.string(),
});

export const rangeConfig = z.strictObject({
	defaultValues: rangeValue.optional(),
	endContent: z.string().optional(),
	maxLabel: z.string().optional(),
	minLabel: z.string().optional(),
	placeholder: z.string().optional(),
	startContent: z.string().optional(),
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
	filter: rangeConfig,
	type: z.literal("range"),
});
export type RangeStep = z.infer<typeof rangeStep>;
export const selectStep = baseConfig.extend({
	filter: selectConfig,
	type: z.literal("select"),
});
export type SelectStep = z.infer<typeof selectStep>;
export const multiSelectStep = baseConfig.extend({
	filter: multiSelectConfig,
	type: z.literal("multiselect"),
});
export type MultiSelectStep = z.infer<typeof multiSelectStep>;
export const mapStep = baseConfig.extend({
	filter: mapConfig,
	type: z.literal("map"),
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
