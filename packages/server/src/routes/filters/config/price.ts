import type { ScrapedEntity } from "@/types/db/entity";
import type { FilterStep } from "@/types/filters/config";
import {
	priceSelectOptions,
	priceSelectStepId,
	priceStepIds,
} from "@/types/filters/ids";

import type { FiltersMatchers } from "./types";
import { inRange, validateStep } from "./validators";

export const getSteps = (): FilterStep[] => [
	{
		id: priceSelectStepId,
		type: "select",
		title: "Price type",
		required: true,
		filter: {
			defaultValue: priceSelectOptions.total,
			options: [
				{
					id: priceSelectOptions.total,
					value: "Total",
				},
				{
					id: priceSelectOptions.perSqm,
					value: "Per m2",
				},
				{
					id: priceSelectOptions.perRoom,
					value: "Per room",
				},
				{
					id: priceSelectOptions.perBedroom,
					value: "Per bedroom",
				},
			],
		},
	},
	{
		id: priceStepIds.total,
		type: "range",
		title: "Price",
		required: true,
		showCondition: {
			type: "other-step",
			stepId: priceSelectStepId,
			condition: {
				type: "select",
				whiteListValues: [priceSelectOptions.total],
			},
		},
		filter: {
			placeholder: "$",
		},
	},
	{
		id: priceStepIds.perSqm,
		type: "range",
		title: "Price per m2",
		required: true,
		showCondition: {
			type: "other-step",
			stepId: priceSelectStepId,
			condition: {
				type: "select",
				whiteListValues: [priceSelectOptions.perSqm],
			},
		},
		filter: {
			placeholder: "$",
		},
	},
	{
		id: priceStepIds.perRoom,
		type: "range",
		title: "Price per room",
		required: true,
		showCondition: {
			type: "other-step",
			stepId: priceSelectStepId,
			condition: {
				type: "select",
				whiteListValues: [priceSelectOptions.perRoom],
			},
		},
		filter: {
			placeholder: "$",
		},
	},
	{
		id: priceStepIds.perSqm,
		type: "range",
		title: "Price per bedroom",
		required: true,
		showCondition: {
			type: "other-step",
			stepId: priceSelectStepId,
			condition: {
				type: "select",
				whiteListValues: [priceSelectOptions.perBedroom],
			},
		},
		filter: {
			placeholder: "$",
		},
	},
];

// TODO: fetch this
const APPROXIMATE_LARI_RATE = 2.7;
const getPriceInUsd = (entity: ScrapedEntity) =>
	entity.currency === "$" ? entity.price : entity.price * APPROXIMATE_LARI_RATE;

export const filterMatchers = {
	[priceSelectStepId]: (_, value) => validateStep("select", value, () => true),
	[priceStepIds.total]: (entity, value) =>
		validateStep("range", value, ({ range: { min, max } }) =>
			inRange(getPriceInUsd(entity), min, max),
		),
	[priceStepIds.perSqm]: (entity, value) =>
		validateStep("range", value, ({ range: { min, max } }) =>
			inRange(getPriceInUsd(entity) / entity.areaSize, min, max),
		),
	[priceStepIds.perRoom]: (entity, value) =>
		validateStep("range", value, ({ range: { min, max } }) =>
			inRange(getPriceInUsd(entity) / entity.rooms, min, max),
		),
	[priceStepIds.perBedroom]: (entity, value) =>
		validateStep("range", value, ({ range: { min, max } }) =>
			inRange(getPriceInUsd(entity) / entity.bedrooms, min, max),
		),
} satisfies FiltersMatchers;
