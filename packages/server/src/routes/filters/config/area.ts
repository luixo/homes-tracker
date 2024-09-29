import type { FilterStep } from "@/types/filters/config";
import { areaStepId, yardStepId } from "@/types/filters/ids";

import type { FiltersMatchers } from "./types";
import { inRange, validateStep } from "./validators";

export const getSteps = (): FilterStep[] => [
	{
		id: areaStepId,
		type: "range",
		title: "Area",
		filter: { placeholder: "50", endContent: "m²" },
	},
	{
		id: yardStepId,
		type: "range",
		title: "Yard area",
		filter: { placeholder: "150", endContent: "m²" },
		disabled: true,
	},
];

export const filterMatchers = {
	[areaStepId]: (entity, value) =>
		validateStep("range", value, ({ range: { min, max } }) =>
			inRange(entity.areaSize, min, max),
		),
	[yardStepId]: (entity, value) =>
		validateStep("range", value, ({ range: { min, max } }) =>
			entity.yardAreaSize === null
				? false
				: inRange(entity.yardAreaSize, min, max),
		),
} satisfies FiltersMatchers;
