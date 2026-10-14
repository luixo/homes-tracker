import { z } from "zod";

import { currencySymbol } from "@/types/currency";
import { position } from "@/types/geojson";
import { entityId, localEntityId, scraperId } from "@/types/ids";

export const realtyType = z.union([
	z.literal("apartment"),
	z.literal("house"),
	z.literal("commercial"),
	z.literal("land"),
	z.literal("hotel"),
	z.literal("unknown"),
]);
export type RealtyType = z.infer<typeof realtyType>;

export const scrapedEntityV1 = z.strictObject({
	_id: entityId,
	areaSize: z.number(),
	bedrooms: z.number(),
	currency: currencySymbol,
	entityId: localEntityId,
	images: z.string().array().optional(),
	location: z.strictObject({
		address: z.string(),
		coordinates: position.or(z.tuple([z.number(), z.number()])).or(z.null()),
		district: z.string().or(z.null()),
		subdistrict: z.string().or(z.null()),
	}),
	postedTimestamp: z.number(),
	price: z.number(),
	realtyType,
	rooms: z.number(),
	scrapedTimestamp: z.number(),
	scraperId,
	version: z.literal("v1"),
	yardAreaSize: z.number().or(z.null()),
});
export type ScrapedEntityV1 = z.infer<typeof scrapedEntityV1>;

export const scrapedEntity = scrapedEntityV1;
export type ScrapedEntity = z.infer<typeof scrapedEntity>;
