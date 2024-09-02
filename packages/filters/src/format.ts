import type {
	AddressFilter,
	AreaFilter,
	Filters,
	LocationFilter,
	PriceFilter,
	RoomsFilter,
} from "@/db/types";

const formatRange = <T extends { min?: number; max?: number }>({
	min,
	max,
}: T): string => {
	if (min === undefined && max === undefined) {
		return "без ограничений";
	}
	if (min !== undefined && max !== undefined) {
		return `от ${min} до ${max}`;
	}
	if (min !== undefined) {
		return `от ${min}`;
	}
	if (max !== undefined) {
		return `до ${max}`;
	}
	return "неизвестно";
};

const formatPrice = (filter?: PriceFilter): string | undefined => {
	if (!filter) {
		return;
	}
	switch (filter.type) {
		case "total":
			return `${formatRange(filter)} за всё`;
		case "per-bedroom":
			return `${formatRange(filter)} за спальню`;
		case "per-meter":
			return `${formatRange(filter)} за м2`;
		case "per-room":
			return `${formatRange(filter)} за комнату`;
	}
};

const formatArea = (filter?: AreaFilter): string | undefined => {
	if (!filter) {
		return;
	}
	switch (filter.type) {
		case "area":
			return `${formatRange(filter)}м2`;
	}
};

const formatLocation = (filter?: LocationFilter): string | undefined => {
	if (!filter) {
		return;
	}
	switch (filter.type) {
		case "district":
			return `в районах ${filter.districts.join(", ")}`;
		case "subdistrict":
			return `в микрорайонах ${filter.subdistricts.join(", ")}`;
		case "polygon":
			return `в полигоне с ${filter.polygon.coordinates.length} координатами`;
	}
};

const formatRooms = (filter?: RoomsFilter): string | undefined => {
	if (!filter) {
		return;
	}
	switch (filter.type) {
		case "rooms":
			return `${formatRange(filter)} комнат`;
		case "bedrooms":
			return `${formatRange(filter)} спален`;
	}
};

const formatAddress = (filter?: AddressFilter): string | undefined => {
	if (!filter) {
		return;
	}
	switch (filter.type) {
		case "regex":
			return `поиск по адресу: /${filter.regex}/`;
	}
};

export const formatRequest = (filters: Filters): string =>
	[
		formatPrice(filters.price),
		formatArea(filters.area),
		formatLocation(filters.location),
		formatRooms(filters.rooms),
		formatAddress(filters.address),
	]
		.filter(Boolean)
		.join("; ");
