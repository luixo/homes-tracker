import { z } from "zod";

import { multiPolygon } from "./utils";

export const priceFilter = z.discriminatedUnion("type", [
	z.strictObject({
		type: z.literal("total"),
		min: z.number().int().optional(),
		max: z.number().int().optional(),
	}),
	z.strictObject({
		type: z.literal("per-meter"),
		min: z.number().int().optional(),
		max: z.number().int().optional(),
	}),
	z.strictObject({
		type: z.literal("per-room"),
		min: z.number().int().optional(),
		max: z.number().int().optional(),
	}),
	z.strictObject({
		type: z.literal("per-bedroom"),
		min: z.number().int().optional(),
		max: z.number().int().optional(),
	}),
]);
export type PriceFilter = z.infer<typeof priceFilter>;

export const locationFilter = z.discriminatedUnion("type", [
	z.strictObject({
		type: z.literal("district"),
		districts: z.string().array(),
	}),
	z.strictObject({
		type: z.literal("subdistrict"),
		subdistricts: z.string().array(),
	}),
	z.strictObject({
		type: z.literal("polygon"),
		polygon: multiPolygon,
	}),
]);
export type LocationFilter = z.infer<typeof locationFilter>;

export const areaFilter = z.discriminatedUnion("type", [
	z.strictObject({
		type: z.literal("area"),
		min: z.number().int().optional(),
		max: z.number().int().optional(),
	}),
]);
export type AreaFilter = z.infer<typeof areaFilter>;

export const roomsFilter = z.discriminatedUnion("type", [
	z.strictObject({
		type: z.literal("rooms"),
		min: z.number().int().optional(),
		max: z.number().int().optional(),
	}),
	z.strictObject({
		type: z.literal("bedrooms"),
		min: z.number().int().optional(),
		max: z.number().int().optional(),
	}),
]);
export type RoomsFilter = z.infer<typeof roomsFilter>;

export const regexFilter = z.strictObject({
	type: z.literal("regex"),
	regex: z.string(),
});
export type RegexFilter = z.infer<typeof regexFilter>;

export const addressFilter = regexFilter;
export type AddressFilter = z.infer<typeof addressFilter>;

export const filters = z
	.object({
		price: priceFilter,
		location: locationFilter,
		area: areaFilter,
		rooms: roomsFilter,
		address: addressFilter,
	})
	.partial();
export type Filters = z.infer<typeof filters>;
