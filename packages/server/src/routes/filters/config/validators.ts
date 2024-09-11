import type { FilterStep } from "@/types/filters/config";
import type { FilterStepValue } from "@/types/filters/values";

export const validateStep = <T extends FilterStep["type"]>(
	type: T,
	value: FilterStepValue,
	validator: (value: Extract<FilterStepValue, { type: T }>) => boolean,
) => {
	if (value.type !== type) {
		throw new Error(
			`Expected to have type ${type}, got ${value.type} (id ${value.id})`,
		);
	}
	// TODO: proper validation
	return validator(value as Extract<FilterStepValue, { type: T }>);
};

export const inRange = (value: number, min?: number, max?: number): boolean => {
	if (min !== undefined && value < min) {
		return false;
	}
	if (max !== undefined && value > max) {
		return false;
	}
	return true;
};
