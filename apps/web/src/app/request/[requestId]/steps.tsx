import React from "react";

import type { StepId } from "@/types/filters/ids";
import type { FilterStepValue } from "@/types/filters/values";
import { Paranja } from "@/web/components/paranja";
import { FiltersContext } from "@/web/providers/filters";
import { runCondition } from "@/web/utils/conditions";

import { MapStep } from "./steps/map";
import { MultiSelectStep } from "./steps/multiselect";
import { RangeStep } from "./steps/range";
import { SelectStep } from "./steps/select";

const coerceUpdateState = <T extends FilterStepValue>(
	updateState: React.Dispatch<
		React.SetStateAction<Omit<FilterStepValue, "id"> | undefined>
	>,
): React.Dispatch<React.SetStateAction<Omit<T, "id"> | undefined>> =>
	updateState as React.Dispatch<
		React.SetStateAction<Omit<T, "id"> | undefined>
	>;

export const Steps: React.FC = () => {
	const filtersContext = React.use(FiltersContext);
	if (!filtersContext) {
		throw new Error("Expected to have filters context!");
	}
	const { updateLocalValues, localValues, steps, disabled } = filtersContext;
	const setStepValue =
		(
			stepId: StepId,
		): React.Dispatch<
			React.SetStateAction<Omit<FilterStepValue, "id"> | undefined>
		> =>
		(value) => {
			updateLocalValues((prevValues) => {
				const index = prevValues.findIndex(({ id }) => id === stepId);
				const nextValue =
					typeof value === "function" ? value(prevValues[index]) : value;
				const fullNextValue = { id: stepId, ...nextValue } as FilterStepValue;
				if (index === -1) {
					if (!nextValue) {
						return prevValues;
					}
					return [...prevValues, fullNextValue];
				}
				if (!nextValue) {
					return [
						...prevValues.slice(0, index),
						...prevValues.slice(index + 1),
					];
				}
				return [
					...prevValues.slice(0, index),
					fullNextValue,
					...prevValues.slice(index + 1),
				];
			});
		};
	const visibleSteps = steps.filter((step) => {
		if (!step.showCondition) {
			return true;
		}
		return runCondition(step.showCondition, localValues);
	});
	const stepsElements = (
		<div className="flex flex-col gap-4">
			{visibleSteps.map((step) => {
				const matchedValue = localValues.find(({ id }) => id === step.id);
				switch (step.type) {
					case "select": {
						return (
							<SelectStep
								key={step.id}
								step={step}
								data={
									matchedValue?.type === "select" ? matchedValue : undefined
								}
								updateState={coerceUpdateState(setStepValue(step.id))}
							/>
						);
					}
					case "range":
						return (
							<RangeStep
								key={step.id}
								step={step}
								data={matchedValue?.type === "range" ? matchedValue : undefined}
								updateState={coerceUpdateState(setStepValue(step.id))}
							/>
						);
					case "multiselect":
						return (
							<MultiSelectStep
								key={step.id}
								step={step}
								data={
									matchedValue?.type === "multiselect"
										? matchedValue
										: undefined
								}
								updateState={coerceUpdateState(setStepValue(step.id))}
							/>
						);
					case "map":
						return (
							<MapStep
								key={step.id}
								step={step}
								data={matchedValue?.type === "map" ? matchedValue : undefined}
								updateState={coerceUpdateState(setStepValue(step.id))}
							/>
						);
					default:
						return null;
				}
			})}
		</div>
	);
	if (disabled) {
		return <Paranja>{stepsElements}</Paranja>;
	}
	return <>{stepsElements}</>;
};
