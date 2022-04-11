import { CurrentTrackerRequest } from "./types";

const parseRange = (
  elements: string[]
): { min?: number; max?: number } | null => {
  const result = elements.reduce((acc, element) => {
    const [type, amount] = element.split(":");
    const numAmount = Number(amount);
    switch (type) {
      case "min":
        if (isNaN(numAmount)) {
          return acc;
        }
        return { ...acc, min: numAmount };
      case "max":
        if (isNaN(numAmount)) {
          return acc;
        }
        return { ...acc, max: numAmount };
      default:
        return acc;
    }
  }, {});
  if (Object.keys(result).length !== 0) {
    return result;
  }
  return null;
};

const parsePart = (
  type: string,
  rangeElements: string[]
): Partial<CurrentTrackerRequest["filter"]> | null => {
  const range = parseRange(rangeElements);
  if (!range) {
    return null;
  }
  switch (type) {
    case "price-total":
      return {
        price: {
          type: "total",
          ...range,
        },
      };
    case "price-per-meter":
      return {
        price: {
          type: "per-meter",
          ...range,
        },
      };
    case "price-per-room":
      return {
        price: {
          type: "per-room",
          ...range,
        },
      };
    case "price-per-bedroom":
      return {
        price: {
          type: "per-bedroom",
          ...range,
        },
      };
    case "area":
      return {
        area: {
          type: "area",
          ...range,
        },
      };
    case "rooms":
      return {
        rooms: {
          type: "rooms",
          ...range,
        },
      };
    case "bedrooms":
      return {
        rooms: {
          type: "bedrooms",
          ...range,
        },
      };
    default:
      return null;
  }
};

export const parseRequest = (
  message: string
): CurrentTrackerRequest | string[] => {
  let errors: string[] = [];
  const request = message
    .split(";")
    .map((x) => x.trim())
    .reduce<CurrentTrackerRequest["filter"]>((acc, part) => {
      const subparts = part.split(" ").map((x) => x.trim());
      const parsed = parsePart(subparts[0], subparts.slice(1));
      if (!parsed) {
        errors.push(part);
      }
      return { ...acc, ...parsed };
    }, {});
  if (errors.length !== 0) {
    return errors;
  }
  return {
    version: "v1",
    city: "Tbilisi",
    filter: request,
  };
};
