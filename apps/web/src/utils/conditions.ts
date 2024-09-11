import type {
	Condition,
	SelectCondition,
	StaticCondition,
} from "@/types/filters/conditions";
import type { FilterStepValue, FilterStepValues } from "@/types/filters/values";

const getSelectedValues = (value?: FilterStepValue) => {
	if (!value) {
		return [];
	}
	if (value.type === "select") {
		return [value.optionId];
	}
	if (value.type === "multiselect") {
		return value.optionsIds;
	}
	return [];
};

const runSelectCondition = (
	condition: SelectCondition,
	value?: FilterStepValue,
): boolean => {
	const selected = getSelectedValues(value);
	const { blackListValues, whiteListValues } = condition;
	if (blackListValues) {
		return selected.every((option) =>
			blackListValues.every((blackListValue) => blackListValue !== option),
		);
	}
	if (whiteListValues) {
		return selected.some((option) =>
			whiteListValues.some((whiteListValue) => whiteListValue === option),
		);
	}
	return false;
};

const runStepCondition = (
	condition: SelectCondition,
	value?: FilterStepValue,
): boolean => {
	switch (condition.type) {
		case "select":
			return runSelectCondition(condition, value);
	}
};

const runStaticCondition = (condition: StaticCondition) => condition.value;

const runOrCondition = <T>(conditions: T[], fn: (condition: T) => boolean) =>
	conditions.some((subcondition) => fn(subcondition));

const runAndCondition = <T>(conditions: T[], fn: (condition: T) => boolean) =>
	conditions.every((subcondition) => fn(subcondition));

export const runCondition = (
	condition: Condition,
	values: FilterStepValues,
): boolean => {
	switch (condition.type) {
		case "other-step":
			return runStepCondition(
				condition.condition,
				values.find((step) => step.id === condition.stepId),
			);
		case "static":
			return runStaticCondition(condition);
		case "or":
			return runOrCondition(condition.conditions, (subcondition) =>
				runCondition(subcondition, values),
			);
		case "and":
			return runAndCondition(condition.conditions, (subcondition) =>
				runCondition(subcondition, values),
			);
	}
	return true;
};
