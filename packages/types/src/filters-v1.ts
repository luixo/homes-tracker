import { z } from "zod";

import { polygon } from "./geojson";

export const priceFilter = z.discriminatedUnion("type", [
	z.strictObject({
		max: z.number().int().optional(),
		min: z.number().int().optional(),
		type: z.literal("total"),
	}),
	z.strictObject({
		max: z.number().int().optional(),
		min: z.number().int().optional(),
		type: z.literal("per-meter"),
	}),
	z.strictObject({
		max: z.number().int().optional(),
		min: z.number().int().optional(),
		type: z.literal("per-room"),
	}),
	z.strictObject({
		max: z.number().int().optional(),
		min: z.number().int().optional(),
		type: z.literal("per-bedroom"),
	}),
]);
export type PriceFilter = z.infer<typeof priceFilter>;

export const locationFilter = z.discriminatedUnion("type", [
	z.strictObject({
		districts: z.string().array(),
		type: z.literal("district"),
	}),
	z.strictObject({
		subdistricts: z.string().array(),
		type: z.literal("subdistrict"),
	}),
	z.strictObject({
		polygon,
		type: z.literal("polygon"),
	}),
]);
export type LocationFilter = z.infer<typeof locationFilter>;

export const areaFilter = z.discriminatedUnion("type", [
	z.strictObject({
		max: z.number().int().optional(),
		min: z.number().int().optional(),
		type: z.literal("area"),
	}),
]);
export type AreaFilter = z.infer<typeof areaFilter>;

export const roomsFilter = z.discriminatedUnion("type", [
	z.strictObject({
		max: z.number().int().optional(),
		min: z.number().int().optional(),
		type: z.literal("rooms"),
	}),
	z.strictObject({
		max: z.number().int().optional(),
		min: z.number().int().optional(),
		type: z.literal("bedrooms"),
	}),
]);
export type RoomsFilter = z.infer<typeof roomsFilter>;

export const regexFilter = z.strictObject({
	regex: z.string(),
	type: z.literal("regex"),
});
export type RegexFilter = z.infer<typeof regexFilter>;

export const addressFilter = regexFilter;
export type AddressFilter = z.infer<typeof addressFilter>;

export const filtersV1 = z
	.object({
		address: addressFilter,
		area: areaFilter,
		location: locationFilter,
		price: priceFilter,
		rooms: roomsFilter,
	})
	.partial();
export type FiltersV1 = z.infer<typeof filtersV1>;
