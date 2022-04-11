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

export type Scraper = {
  id: string;
  pageFetchers: ((
    logger: winston.Logger,
    page: number
  ) => Promise<{ ids: string[]; nonVipAdsFound: boolean }>)[];
  fetchEntity: (
    logger: winston.Logger,
    id: string
  ) => Promise<ScrapedEntity | null>;
  getUrl: (id: string) => string;
};

export type EntityIdentification = {
  entityId: string;
  scraperId: string;
};
