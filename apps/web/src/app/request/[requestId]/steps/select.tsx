import type React from "react";

import type { SharedSelection } from "@nextui-org/react";
import { Select, SelectItem } from "@nextui-org/react";

import type { SelectStep as SelectStepType } from "@/types/filters/config";
import type { SelectOptionId } from "@/types/filters/ids";
import type { SelectStepValue } from "@/types/filters/values";

import type { UpdateState } from "./types";

type Props = {
	step: SelectStepType;
	data: SelectStepValue | undefined;
	updateState: UpdateState<SelectStepValue>;
};

export const SelectStep: React.FC<Props> = ({ step, data, updateState }) => {
	const setValue = (selection: SharedSelection) => {
		if (selection === "all") {
			return;
		}
		const nextSelected = [...selection.values()][0];
		if (!nextSelected) {
			updateState(undefined);
		} else {
			updateState({
				type: "select",
				optionId: nextSelected as SelectOptionId,
			});
		}
	};
	return (
		<Select
			label={step.title}
			isRequired={step.required}
			selectedKeys={data ? [data.optionId] : undefined}
			onSelectionChange={setValue}
			isInvalid={step.required && !data}
		>
			{step.filter.options.map((option) => (
				<SelectItem key={option.id}>{option.value}</SelectItem>
			))}
		</Select>
	);
};
