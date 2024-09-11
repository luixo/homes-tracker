import type { FilterStep } from "@/types/filters/config";
import type { FilterStepValue } from "@/types/filters/values";

const isRequiredStepValid = (
	step: FilterStep,
	isStepVisible: boolean,
	matchedValue?: FilterStepValue,
) => !step.required || !isStepVisible || Boolean(matchedValue);

const isValidNumber = (input: number) =>
	!Number.isNaN(input) && Number.isFinite(input);

const isRangeStepValid = (step: FilterStep, matchedValue?: FilterStepValue) => {
	if (step.type !== "range") {
		return true;
	}
	if (!matchedValue || matchedValue.type !== "range") {
		return true;
	}
	return (
		isValidNumber(matchedValue.range.min) &&
		isValidNumber(matchedValue.range.max)
	);
};

export const isStepValid = (
	step: FilterStep,
	isStepVisible: boolean,
	matchedValue?: FilterStepValue,
) =>
	isRequiredStepValid(step, isStepVisible, matchedValue) &&
	isRangeStepValid(step, matchedValue);
