import winston from "winston";

export type Currency = "$" | "₾" | "?";

export type RealtyType =
  | "apartment"
  | "house"
  | "commercial"
  | "land"
  | "hotel"
  | "unknown";

type ScrapedEntityV1 = {
  version: "v1";
  _id: string;
  entityId: string;
  scraperId: string;
  postedTimestamp: number;
  scrapedTimestamp: number;
  price: number;
  currency: Currency;
  realtyType: RealtyType;
  areaSize: number;
  yardAreaSize: number | null;
  rooms: number;
  bedrooms: number;
  location: {
    address: string;
    district: string | null;
    subdistrict: string | null;
    coordinates: GeoJSON.Position | null;
  };
};

export type ScrapedEntity = ScrapedEntityV1;

export type Scraper<T, P> = {
  id: string;
  prepare: (logger: winston.Logger) => Promise<P>;
  pageFetchers: ((
    logger: winston.Logger,
    prepareResult: P,
    page: number
  ) => Promise<{ results: T[]; nonVipAdsFound: boolean }>)[];
  fetchEntity: (
    logger: winston.Logger,
    prepareResult: P,
    result: T
  ) => Promise<ScrapedEntity | null>;
  getEntityId: (result: T) => string;
  getUrl: (id: string) => string;
};

export type EntityIdentification = {
  entityId: string;
  scraperId: string;
};
