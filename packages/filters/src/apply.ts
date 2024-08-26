import type {
	AddressFilter,
	AreaFilter,
	LocationFilter,
	PriceFilter,
	RegexFilter,
	RoomsFilter,
	ScrapedEntity,
	TrackerRequest,
} from "@/db/types";

const APPROXIMATE_LARI_RATE = 2.7;

const inRange = (value: number, min?: number, max?: number): boolean => {
	if (min !== undefined && value < min) {
		return false;
	}
	if (max !== undefined && value > max) {
		return false;
	}
	return true;
};

const filterPrice = (entity: ScrapedEntity, filter?: PriceFilter): boolean => {
	if (!filter) {
		return true;
	}
	const priceInUsd =
		entity.currency === "$"
			? entity.price
			: entity.price * APPROXIMATE_LARI_RATE;
	switch (filter.type) {
		case "total":
			return inRange(priceInUsd, filter.min, filter.max);
		case "per-meter":
			return inRange(priceInUsd / entity.areaSize, filter.min, filter.max);
		case "per-room":
			return inRange(priceInUsd / entity.rooms, filter.min, filter.max);
		case "per-bedroom":
			return inRange(priceInUsd / entity.bedrooms, filter.min, filter.max);
	}
};

const filterArea = (entity: ScrapedEntity, filter?: AreaFilter): boolean => {
	if (!filter) {
		return true;
	}
	switch (filter.type) {
		case "area":
			return inRange(entity.areaSize, filter.min, filter.max);
	}
};

const filterRooms = (entity: ScrapedEntity, filter?: RoomsFilter): boolean => {
	if (!filter) {
		return true;
	}
	switch (filter.type) {
		case "rooms":
			return inRange(entity.rooms, filter.min, filter.max);
		case "bedrooms":
			return inRange(entity.bedrooms, filter.min, filter.max);
	}
};

const filterRegex = (input: string, filter: RegexFilter): boolean =>
	new RegExp(filter.regex).test(input);

const filterAddress = (
	entity: ScrapedEntity,
	filter?: AddressFilter,
): boolean => {
	if (!filter) {
		return true;
	}
	switch (filter.type) {
		case "regex":
			return [
				entity.location.address,
				entity.location.district,
				entity.location.subdistrict,
			]
				.filter((value) => value !== null)
				.some((value) => filterRegex(value, filter));
	}
};

const filterLocation = (
	entity: ScrapedEntity,
	filter?: LocationFilter,
): boolean => {
	if (!filter) {
		return true;
	}
	switch (filter.type) {
		case "polygon":
			// TODO
			return true;
		case "district":
			if (entity.location.district) {
				return filter.districts.includes(entity.location.district);
			}
			// TODO
			return true;

		case "subdistrict":
			if (entity.location.subdistrict) {
				return filter.subdistricts.includes(entity.location.subdistrict);
			}
			// TODO
			return true;
	}
};

export const applyFilters = (
	entity: ScrapedEntity,
	request: TrackerRequest,
): boolean =>
	filterPrice(entity, request.filter.price) &&
	filterArea(entity, request.filter.area) &&
	filterRooms(entity, request.filter.rooms) &&
	filterLocation(entity, request.filter.location) &&
	filterAddress(entity, request.filter.address);
