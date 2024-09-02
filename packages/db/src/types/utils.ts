import { z } from "zod";

export const position = z.number().array().min(2).max(3);

export const multiPolygon = z.strictObject({
	type: z.literal("MultiPolygon"),
	coordinates: position.array().array().array(),
});
