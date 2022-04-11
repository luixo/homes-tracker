import {
  AreaFilter,
  LocationFilter,
  PriceFilter,
  RoomsFilter,
  TrackerRequest,
} from "../server/types/request";

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

export const formatRequest = (request: TrackerRequest): string => {
  if (!request.enabled) {
    return `отключен`;
  }
  return [
    formatPrice(request.filter.price),
    formatArea(request.filter.area),
    formatLocation(request.filter.location),
    formatRooms(request.filter.rooms),
  ]
    .filter(Boolean)
    .join("; ");
};
