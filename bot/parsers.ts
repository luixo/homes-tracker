import type { CurrentTrackerRequest } from "./types";

const parseRange = (input: string): { min?: number; max?: number } | null => {
  const rangeMatch = /(\d+)-(\d+)/.exec(input);
  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }
  const lessMatch = /<(\d+)/.exec(input) || /(\d+)>/.exec(input);
  if (lessMatch) {
    return { max: Number(lessMatch[1]) };
  }
  const moreMatch = />(\d+)/.exec(input) || /(\d+)</.exec(input);
  if (moreMatch) {
    return { min: Number(moreMatch[1]) };
  }
  return null;
};

const parsePart = (
  type: string,
  text: string
): Partial<CurrentTrackerRequest["filter"]> | null => {
  switch (type) {
    case "price-total": {
      const range = parseRange(text);
      if (!range) {
        return null;
      }
      return {
        price: {
          type: "total",
          ...range,
        },
      };
    }
    case "price-per-meter": {
      const range = parseRange(text);
      if (!range) {
        return null;
      }
      return {
        price: {
          type: "per-meter",
          ...range,
        },
      };
    }
    case "price-per-room": {
      const range = parseRange(text);
      if (!range) {
        return null;
      }
      return {
        price: {
          type: "per-room",
          ...range,
        },
      };
    }
    case "price-per-bedroom": {
      const range = parseRange(text);
      if (!range) {
        return null;
      }
      return {
        price: {
          type: "per-bedroom",
          ...range,
        },
      };
    }
    case "area": {
      const range = parseRange(text);
      if (!range) {
        return null;
      }
      return {
        area: {
          type: "area",
          ...range,
        },
      };
    }
    case "rooms": {
      const range = parseRange(text);
      if (!range) {
        return null;
      }
      return {
        rooms: {
          type: "rooms",
          ...range,
        },
      };
    }
    case "bedrooms": {
      const range = parseRange(text);
      if (!range) {
        return null;
      }
      return {
        rooms: {
          type: "bedrooms",
          ...range,
        },
      };
    }
    case "address": {
      if (!text) {
        return null;
      }
      return {
        address: {
          type: "regex",
          regex: text,
        },
      };
    }
    default:
      return null;
  }
};

export const parseRequest = (
  message: string
): CurrentTrackerRequest | string[] => {
  const errors: string[] = [];
  const request = message
    .split(";")
    .map((x) => x.trim())
    .reduce<CurrentTrackerRequest["filter"]>((acc, part) => {
      const subparts = part.trim().split(" ");
      const parsed = parsePart(
        subparts[0].trim(),
        subparts.slice(1).join(" ").trim()
      );
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
