import { z } from "zod";

import { currencySymbol } from "../currency";
import { entityId, localEntityId, scraperId } from "../ids";
import { position } from "../utils";

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
	version: z.literal("v1"),
	_id: entityId,
	entityId: localEntityId,
	scraperId,
	postedTimestamp: z.number(),
	scrapedTimestamp: z.number(),
	price: z.number(),
	currency: currencySymbol,
	realtyType,
	areaSize: z.number(),
	yardAreaSize: z.number().or(z.null()),
	rooms: z.number(),
	bedrooms: z.number(),
	location: z.strictObject({
		address: z.string(),
		district: z.string().or(z.null()),
		subdistrict: z.string().or(z.null()),
		coordinates: position.or(z.null()),
	}),
	images: z.string().array().optional(),
});
export type ScrapedEntityV1 = z.infer<typeof scrapedEntityV1>;

export const scrapedEntity = scrapedEntityV1;
export type ScrapedEntity = z.infer<typeof scrapedEntity>;
