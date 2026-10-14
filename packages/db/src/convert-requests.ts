import type { TrackerRequest } from "@/types/db/index";
import {
	areaStepId,
	bedroomSelectOptions,
	bedroomStepId,
	priceSelectOptions,
	priceSelectStepId,
	priceStepIds,
	roomSelectOptions,
	roomStepId,
} from "@/types/filters/ids";
import type { FilterStepValues } from "@/types/filters/values";

const convertRange = ({ min, max }: { min?: number; max?: number }) => ({
	max: max ?? 99_999,
	min: min ?? 0,
});

const convertPrice = (
	filter: Extract<TrackerRequest, { version: "v1" }>["filter"]["price"],
): FilterStepValues => {
	if (!filter) {
		return [];
	}
	switch (filter.type) {
		case "total": {
			return [
				{
					id: priceSelectStepId,
					optionId: priceSelectOptions.total,
					type: "select",
				},
				{ id: priceStepIds.total, range: convertRange(filter), type: "range" },
			];
		}
		case "per-meter": {
			return [
				{
					id: priceSelectStepId,
					optionId: priceSelectOptions.perSqm,
					type: "select",
				},
				{ id: priceStepIds.perSqm, range: convertRange(filter), type: "range" },
			];
		}
		case "per-room": {
			return [
				{
					id: priceSelectStepId,
					optionId: priceSelectOptions.perRoom,
					type: "select",
				},
				{
					id: priceStepIds.perRoom,
					range: convertRange(filter),
					type: "range",
				},
			];
		}
		case "per-bedroom": {
			return [
				{
					id: priceSelectStepId,
					optionId: priceSelectOptions.perBedroom,
					type: "select",
				},
				{
					id: priceStepIds.perBedroom,
					range: convertRange(filter),
					type: "range",
				},
			];
		}
	}
};

const convertArea = (
	filter: Extract<TrackerRequest, { version: "v1" }>["filter"]["area"],
): FilterStepValues => {
	if (!filter) {
		return [];
	}
	return [{ id: areaStepId, range: convertRange(filter), type: "range" }];
};

const convertBedroomOptions = (
	filter: Extract<
		Extract<TrackerRequest, { version: "v1" }>["filter"]["rooms"],
		{ type: "bedrooms" }
	>,
) => {
	const { min = 1, max = 999 } = filter;
	return [
		min > 1 || max < 1 ? undefined : bedroomSelectOptions[1],
		min > 2 || max < 2 ? undefined : bedroomSelectOptions[2],
		min > 3 || max < 3 ? undefined : bedroomSelectOptions[3],
		min > 4 || max < 4 ? undefined : bedroomSelectOptions["4plus"],
	].filter((value) => value !== undefined);
};

const convertRoomOptions = (
	filter: Extract<
		Extract<TrackerRequest, { version: "v1" }>["filter"]["rooms"],
		{ type: "rooms" }
	>,
) => {
	const { min = 0, max = 999 } = filter;
	return [
		min > 0 || max < 0 ? undefined : roomSelectOptions.studio,
		min > 1 || max < 1 ? undefined : roomSelectOptions[1],
		min > 2 || max < 2 ? undefined : roomSelectOptions[2],
		min > 3 || max < 3 ? undefined : roomSelectOptions[3],
		min > 4 || max < 4 ? undefined : roomSelectOptions[4],
		min > 5 || max < 5 ? undefined : roomSelectOptions[5],
		min > 6 || max < 6 ? undefined : roomSelectOptions["6plus"],
	].filter((value) => value !== undefined);
};

const convertRooms = (
	filter: Extract<TrackerRequest, { version: "v1" }>["filter"]["rooms"],
): FilterStepValues => {
	if (!filter) {
		return [];
	}
	switch (filter.type) {
		case "rooms": {
			return [
				{
					id: roomStepId,
					optionsIds: convertRoomOptions(filter),
					type: "multiselect",
				},
			];
		}
		case "bedrooms": {
			return [
				{
					id: bedroomStepId,
					optionsIds: convertBedroomOptions(filter),
					type: "multiselect",
				},
			];
		}
	}
};

export const convertRequestFilters = (
	filter: Extract<TrackerRequest, { version: "v1" }>["filter"],
): FilterStepValues => [
	...convertPrice(filter.price),
	...convertArea(filter.area),
	...convertRooms(filter.rooms),
];

export const convertToLastRequest = (
	request: TrackerRequest,
): Extract<TrackerRequest, { version: "v2" }> => {
	if (request.version === "v2") {
		return request;
	}
	const { _id, enabled, notifiers, notifiedTimestamp, city, filter } = request;
	return {
		_id,
		city,
		enabled,
		filters: convertRequestFilters(filter),
		notifiedTimestamp,
		notifiers,
		version: "v2",
	};
};
