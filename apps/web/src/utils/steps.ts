import type { FilterStep, RangeStep } from "@/types/filters/config";
import type { FilterStepValue, RangeStepValue } from "@/types/filters/values";

const isValidNumber = (input: number) =>
	!Number.isNaN(input) && Number.isFinite(input);

const isRangeStepValid = (step: RangeStep, matchedValue: RangeStepValue) =>
	isValidNumber(matchedValue.range.min) &&
	isValidNumber(matchedValue.range.max) &&
	matchedValue.range.min <= matchedValue.range.max;

export const isStepValid = (
	step: FilterStep,
	isStepVisible: boolean,
	matchedValue?: FilterStepValue,
) => {
	// Step is invalid if required & visible, but has no value
	if (!matchedValue) {
		return !step.required || !isStepVisible;
	}
	switch (step.type) {
		case "range": {
			if (matchedValue.type !== "range") {
				throw new Error(
					`Type mismatch, expected: range, got: ${matchedValue.type}`,
				);
			}
			return isRangeStepValid(step, matchedValue);
		}
		default:
			return true;
	}
};
