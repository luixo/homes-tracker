import React from "react";

import { Input } from "@nextui-org/react";

import type { RangeStep as RangeStepType } from "@/types/filters/config";
import type { RangeStepValue } from "@/types/filters/values";

import type { UpdateState } from "./types";

type Props = {
	step: RangeStepType;
	data: RangeStepValue | undefined;
	updateState: UpdateState<RangeStepValue>;
};

const parseNumber = (value: string): number | undefined => {
	const float = parseFloat(value);
	if (Number.isNaN(float)) {
		return;
	}
	return float;
};

const DEFAULT_VALUES = {
	min: 0,
	max: Infinity,
};

export const RangeStep: React.FC<Props> = ({ step, data, updateState }) => {
	const [min, setMin] = React.useState(data?.range.min.toString());
	const [max, setMax] = React.useState(data?.range.max.toString());
	const onChange = (type: "min" | "max") => (nextValue: string) => {
		const parsedNumber = parseNumber(nextValue);
		const nextNumber = parsedNumber ?? DEFAULT_VALUES[type];
		(type === "min" ? setMin : setMax)(nextValue);
		updateState((prevState) => {
			const inversedType = type === "min" ? "max" : "min";
			const prevStateValue = prevState
				? prevState.range
				: { [inversedType as "max"]: DEFAULT_VALUES[inversedType] };
			return {
				type: "range",
				range: {
					...prevStateValue,
					[type as "min"]: nextNumber,
				},
			};
		});
	};
	return (
		<div className="flex flex-col gap-2">
			<div>{step.title}</div>
			<div className="flex gap-2 items-center max-[480px]:flex-col">
				<Input
					label="Min"
					isRequired={step.required}
					value={min ?? ""}
					isInvalid={min !== data?.range.min.toString()}
					onValueChange={onChange("min")}
				/>
				<span className="max-[480px]:hidden">—</span>
				<Input
					label="Max"
					isRequired={step.required}
					value={max ?? ""}
					isInvalid={max !== data?.range.max.toString()}
					onValueChange={onChange("max")}
				/>
			</div>
		</div>
	);
};
