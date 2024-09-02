import { z } from "zod";

export const currencySymbol = z.union([
	z.literal("$"),
	z.literal("₾"),
	z.literal("€"),
	z.literal("?"),
]);
export type CurrencySymbol = z.infer<typeof currencySymbol>;
