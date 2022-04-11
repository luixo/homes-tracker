import {
  AreaFilter,
  LocationFilter,
  PriceFilter,
  RoomsFilter,
  TrackerRequest,
} from "../types/request";
import { ScrapedEntity } from "../types/scraper";

const APPROXIMATE_LARI_RATE = 3.1;

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

const filterLocation = (
  entity: ScrapedEntity,
  filter?: LocationFilter
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
      } else {
        // TODO
        return true;
      }
    case "subdistrict":
      if (entity.location.subdistrict) {
        return filter.subdistricts.includes(entity.location.subdistrict);
      } else {
        // TODO
        return true;
      }
  }
};

export const verifyEntityOverRequest = (
  entity: ScrapedEntity,
  request: TrackerRequest
): boolean => {
  return (
    filterPrice(entity, request.filter.price) &&
    filterArea(entity, request.filter.area) &&
    filterRooms(entity, request.filter.rooms) &&
    filterLocation(entity, request.filter.location)
  );
};
