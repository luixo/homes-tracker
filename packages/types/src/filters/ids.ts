import { z } from "zod";

import type { Brand } from "../brand";
import { branded } from "../brand";

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
	total: generateSelectOptionId("total"),
	perSqm: generateSelectOptionId("per-sqm"),
	perRoom: generateSelectOptionId("per-room"),
	perBedroom: generateSelectOptionId("per-bedroom"),
};
export const priceStepIds = {
	total: generateStepId("price-total"),
	perSqm: generateStepId("price-per-sqm"),
	perRoom: generateStepId("price-per-room"),
	perBedroom: generateStepId("price-per-bedroom"),
};
export const roomStepId = generateStepId("rooms");
export const bedroomStepId = generateStepId("bedrooms");
export const roomSelectOptions = {
	studio: generateSelectOptionId("studio"),
	"1": generateSelectOptionId("1"),
	"2": generateSelectOptionId("2"),
	"3": generateSelectOptionId("3"),
	"4": generateSelectOptionId("4"),
	"5": generateSelectOptionId("5"),
	"6plus": generateSelectOptionId("6+"),
};
export const bedroomSelectOptions = {
	"1": generateSelectOptionId("1"),
	"2": generateSelectOptionId("2"),
	"3": generateSelectOptionId("3"),
	"4plus": generateSelectOptionId("4+"),
};
