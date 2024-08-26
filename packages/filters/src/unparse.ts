import type {
	AddressFilter,
	AreaFilter,
	LocationFilter,
	PriceFilter,
	RoomsFilter,
	TrackerRequest,
} from "@/db/types";

const unparseRange = <T extends { min?: number; max?: number }>({
	min,
	max,
}: T): string => {
	if (min === undefined && max === undefined) {
		return "unknown";
	}
	if (min !== undefined && max !== undefined) {
		return `${min}-${max}`;
	}
	if (min !== undefined) {
		return `>${min}`;
	}
	if (max !== undefined) {
		return `<${max}`;
	}
	return "unknown";
};

const unparsePrice = (filter?: PriceFilter): string | undefined => {
	if (!filter) {
		return;
	}
	return `${filter.type}: ${unparseRange(filter)}`;
};

const unparseArea = (filter?: AreaFilter): string | undefined => {
	if (!filter) {
		return;
	}
	return `${filter.type}: ${unparseRange(filter)}`;
};

const unparseLocation = (filter?: LocationFilter): string | undefined => {
	if (!filter) {
		return;
	}
	switch (filter.type) {
		case "district":
			return `district: ${filter.districts.join(", ")}`;
		case "subdistrict":
			return `subdistrict: ${filter.subdistricts.join(", ")}`;
		case "polygon":
			return `polygon: ${filter.polygon.coordinates
				.map((polygon) =>
					polygon.map((coordinates) => coordinates.join(",")).join("/"),
				)
				.join("|")}`;
	}
};

const unparseRooms = (filter?: RoomsFilter): string | undefined => {
	if (!filter) {
		return;
	}
	return `${filter.type}: ${unparseRange(filter)}`;
};

const unparseAddress = (filter?: AddressFilter): string | undefined => {
	if (!filter) {
		return;
	}
	switch (filter.type) {
		case "regex":
			return `address: ${filter.regex}`;
	}
};

export const unparseRequest = (request: TrackerRequest): string | null => {
	if (!request.enabled) {
		return null;
	}
	return [
		unparsePrice(request.filter.price),
		unparseArea(request.filter.area),
		unparseLocation(request.filter.location),
		unparseRooms(request.filter.rooms),
		unparseAddress(request.filter.address),
	]
		.filter(Boolean)
		.join("; ");
};
