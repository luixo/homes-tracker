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
		id: priceSelectStepId,
		required: true,
		title: "Price type",
		type: "select",
	},
	{
		filter: {
			placeholder: "500",
			startContent: "$",
		},
		id: priceStepIds.total,
		required: true,
		showCondition: {
			condition: {
				type: "select",
				whiteListValues: [priceSelectOptions.total],
			},
			stepId: priceSelectStepId,
			type: "other-step",
		},
		title: "Price",
		type: "range",
	},
	{
		filter: {
			placeholder: "10",
			startContent: "$",
		},
		id: priceStepIds.perSqm,
		required: true,
		showCondition: {
			condition: {
				type: "select",
				whiteListValues: [priceSelectOptions.perSqm],
			},
			stepId: priceSelectStepId,
			type: "other-step",
		},
		title: "Price per m2",
		type: "range",
	},
	{
		filter: {
			placeholder: "200",
			startContent: "$",
		},
		id: priceStepIds.perRoom,
		required: true,
		showCondition: {
			condition: {
				type: "select",
				whiteListValues: [priceSelectOptions.perRoom],
			},
			stepId: priceSelectStepId,
			type: "other-step",
		},
		title: "Price per room",
		type: "range",
	},
	{
		filter: {
			placeholder: "200",
			startContent: "$",
		},
		id: priceStepIds.perSqm,
		required: true,
		showCondition: {
			condition: {
				type: "select",
				whiteListValues: [priceSelectOptions.perBedroom],
			},
			stepId: priceSelectStepId,
			type: "other-step",
		},
		title: "Price per bedroom",
		type: "range",
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
