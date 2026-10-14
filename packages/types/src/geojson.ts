import { z } from "zod";

import { polygonId } from "./ids";

export const position = z.strictObject({
	lat: z.number().min(-90).max(90),
	lon: z.number().min(-180).max(180),
});
export type Position = z.infer<typeof position>;

const polygonRing = position.array();

export const polygon = z.strictObject({
	id: polygonId,
	rings: polygonRing.array(),
	type: z.literal("polygon"),
});
export type Polygon = z.infer<typeof polygon>;
