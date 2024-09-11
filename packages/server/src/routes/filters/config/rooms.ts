import type { FilterStep } from "@/types/filters/config";
import type { SelectOptionId } from "@/types/filters/ids";
import {
	bedroomSelectOptions,
	bedroomStepId,
	roomSelectOptions,
	roomStepId,
} from "@/types/filters/ids";

import type { FiltersMatchers } from "./types";
import { validateStep } from "./validators";

export const getSteps = (): FilterStep[] => [
	{
		id: roomStepId,
		type: "multiselect",
		title: "Rooms",
		filter: {
			defaultValues: [roomSelectOptions[1], roomSelectOptions[2]],
			options: [
				{
					id: roomSelectOptions.studio,
					value: "Studio",
				},
				{
					id: roomSelectOptions[1],
					value: "1",
				},
				{
					id: roomSelectOptions[2],
					value: "2",
				},
				{
					id: roomSelectOptions[3],
					value: "3",
				},
				{
					id: roomSelectOptions[4],
					value: "4",
				},
				{
					id: roomSelectOptions[5],
					value: "5",
				},
				{
					id: roomSelectOptions["6plus"],
					value: "6+",
				},
			],
		},
	},
	{
		id: bedroomStepId,
		type: "multiselect",
		title: "Bedroooms",
		filter: {
			options: [
				{
					id: bedroomSelectOptions[1],
					value: "1",
				},
				{
					id: bedroomSelectOptions[2],
					value: "2",
				},
				{
					id: bedroomSelectOptions[3],
					value: "3",
				},
				{
					id: bedroomSelectOptions["4plus"],
					value: "4+",
				},
			],
		},
	},
];

export const filterMatchers = {
	[roomStepId]: (entity, value) =>
		validateStep("multiselect", value, ({ optionsIds }) => {
			const actualRooms = entity.rooms;
			return (
				optionsIds.includes(actualRooms.toString() as SelectOptionId) ||
				(optionsIds.includes(roomSelectOptions.studio) && actualRooms === 0) ||
				(optionsIds.includes(roomSelectOptions["6plus"]) && actualRooms >= 6)
			);
		}),
	[bedroomStepId]: (entity, value) =>
		validateStep("multiselect", value, ({ optionsIds }) => {
			const actualBedRooms = entity.bedrooms;
			return (
				optionsIds.includes(actualBedRooms.toString() as SelectOptionId) ||
				(optionsIds.includes(bedroomSelectOptions["4plus"]) &&
					actualBedRooms >= 4)
			);
		}),
} satisfies FiltersMatchers;
