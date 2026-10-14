import type { FilterStep } from "@/types/filters/config";
import { areaStepId, yardStepId } from "@/types/filters/ids";

import type { FiltersMatchers } from "./types";
import { inRange, validateStep } from "./validators";

export const getSteps = (): FilterStep[] => [
	{
		filter: { endContent: "m²", placeholder: "50" },
		id: areaStepId,
		title: "Area",
		type: "range",
	},
	{
		disabled: true,
		filter: { endContent: "m²", placeholder: "150" },
		id: yardStepId,
		title: "Yard area",
		type: "range",
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
