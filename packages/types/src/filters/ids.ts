import { z } from "zod";

import type { Brand } from "@/types/brand";
import { branded } from "@/types/brand";

export const stepId = z.string().refine<Brand<string, "stepId">>(branded);
export type StepId = z.infer<typeof stepId>;
export const generateStepId = (id: string) => id as StepId;

export const selectOptionId = z
	.string()
	.refine<Brand<string, "selectOptionId">>(branded);
export type SelectOptionId = z.infer<typeof selectOptionId>;
export const generateSelectOptionId = (id: string) => id as SelectOptionId;

export const areaStepId = generateStepId("flat-area");
export const yardStepId = generateStepId("yard-area");
export const locationPolygonStepId = generateStepId("location-polygon");
export const priceSelectStepId = generateStepId("price-select");
export const priceSelectOptions = {
	perBedroom: generateSelectOptionId("per-bedroom"),
	perRoom: generateSelectOptionId("per-room"),
	perSqm: generateSelectOptionId("per-sqm"),
	total: generateSelectOptionId("total"),
};
export const priceStepIds = {
	perBedroom: generateStepId("price-per-bedroom"),
	perRoom: generateStepId("price-per-room"),
	perSqm: generateStepId("price-per-sqm"),
	total: generateStepId("price-total"),
};
export const roomStepId = generateStepId("rooms");
export const bedroomStepId = generateStepId("bedrooms");
export const roomSelectOptions = {
	"1": generateSelectOptionId("1"),
	"2": generateSelectOptionId("2"),
	"3": generateSelectOptionId("3"),
	"4": generateSelectOptionId("4"),
	"5": generateSelectOptionId("5"),
	"6plus": generateSelectOptionId("6+"),
	studio: generateSelectOptionId("studio"),
};
export const bedroomSelectOptions = {
	"1": generateSelectOptionId("1"),
	"2": generateSelectOptionId("2"),
	"3": generateSelectOptionId("3"),
	"4plus": generateSelectOptionId("4+"),
};
