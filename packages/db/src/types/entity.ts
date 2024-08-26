import type { Position } from "geojson";

export type CurrencySymbol = "$" | "₾" | "€" | "?";

export type RealtyType =
	| "apartment"
	| "house"
	| "commercial"
	| "land"
	| "hotel"
	| "unknown";

export type ScrapedEntityV1 = {
	version: "v1";
	_id: string;
	entityId: string;
	scraperId: string;
	postedTimestamp: number;
	scrapedTimestamp: number;
	price: number;
	currency: CurrencySymbol;
	realtyType: RealtyType;
	areaSize: number;
	yardAreaSize: number | null;
	rooms: number;
	bedrooms: number;
	location: {
		address: string;
		district: string | null;
		subdistrict: string | null;
		coordinates: Position | null;
	};
	images?: string[];
};

export type ScrapedEntity = ScrapedEntityV1;
