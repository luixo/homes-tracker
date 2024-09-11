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
	min: min ?? 0,
	max: max ?? 99999,
});

const convertPrice = (
	filter: Extract<TrackerRequest, { version: "v1" }>["filter"]["price"],
): FilterStepValues => {
	if (!filter) {
		return [];
	}
	switch (filter.type) {
		case "total":
			return [
				{
					type: "select",
					id: priceSelectStepId,
					optionId: priceSelectOptions.total,
				},
				{ type: "range", id: priceStepIds.total, range: convertRange(filter) },
			];
		case "per-meter":
			return [
				{
					type: "select",
					id: priceSelectStepId,
					optionId: priceSelectOptions.perSqm,
				},
				{ type: "range", id: priceStepIds.perSqm, range: convertRange(filter) },
			];
		case "per-room":
			return [
				{
					type: "select",
					id: priceSelectStepId,
					optionId: priceSelectOptions.perRoom,
				},
				{
					type: "range",
					id: priceStepIds.perRoom,
					range: convertRange(filter),
				},
			];
		case "per-bedroom":
			return [
				{
					type: "select",
					id: priceSelectStepId,
					optionId: priceSelectOptions.perBedroom,
				},
				{
					type: "range",
					id: priceStepIds.perBedroom,
					range: convertRange(filter),
				},
			];
	}
};

const convertArea = (
	filter: Extract<TrackerRequest, { version: "v1" }>["filter"]["area"],
): FilterStepValues => {
	if (!filter) {
		return [];
	}
	switch (filter.type) {
		case "area":
			return [{ type: "range", id: areaStepId, range: convertRange(filter) }];
	}
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
		case "rooms":
			return [
				{
					type: "multiselect",
					id: roomStepId,
					optionsIds: convertRoomOptions(filter),
				},
			];
		case "bedrooms":
			return [
				{
					type: "multiselect",
					id: bedroomStepId,
					optionsIds: convertBedroomOptions(filter),
				},
			];
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
	const {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		_id,
		enabled,
		notifiers,
		notifiedTimestamp,
		city,
		filter,
	} = request;
	return {
		_id,
		enabled,
		notifiers,
		notifiedTimestamp,
		city,
		version: "v2",
		filters: convertRequestFilters(filter),
	};
};
