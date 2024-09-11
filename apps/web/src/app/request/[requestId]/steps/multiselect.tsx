import type React from "react";

import type { SharedSelection } from "@nextui-org/react";
import { Button, Select, SelectItem } from "@nextui-org/react";

import type { MultiSelectStep as MultiSelectStepType } from "@/types/filters/config";
import type { SelectOptionId } from "@/types/filters/ids";
import type { MultiSelectStepValue } from "@/types/filters/values";

import type { UpdateState } from "./types";

type Props = {
	step: MultiSelectStepType;
	data: MultiSelectStepValue | undefined;
	updateState: UpdateState<MultiSelectStepValue>;
};

export const MultiSelectStep: React.FC<Props> = ({
	step,
	data,
	updateState,
}) => {
	const onSelectionChange = (selection: SharedSelection) => {
		if (selection === "all") {
			return;
		}
		const nextSelected = [...selection.values()];
		if (nextSelected.length === 0) {
			updateState(undefined);
		} else {
			updateState({
				type: "multiselect",
				optionsIds: nextSelected as SelectOptionId[],
			});
		}
	};
	const onItemClick = (optionId: SelectOptionId) => {
		updateState((prevState) => {
			if (!prevState) {
				return { type: "multiselect", optionsIds: [optionId] };
			}
			if (prevState.optionsIds.includes(optionId)) {
				const nextOptionIds = prevState.optionsIds.filter(
					(lookupId) => lookupId !== optionId,
				);
				if (nextOptionIds.length === 0) {
					return undefined;
				}
				return {
					...prevState,
					optionsIds: nextOptionIds,
				};
			}
			return { ...prevState, optionsIds: [...prevState.optionsIds, optionId] };
		});
	};
	const isInvalid = step.required && !data;
	if (step.filter.options.length < 10) {
		return (
			<div className="flex flex-col gap-2">
				<div className={isInvalid ? "text-danger" : undefined}>
					{step.title}
					{step.required ? <span>*</span> : null}
				</div>
				<div className="flex flex-wrap gap-2">
					{step.filter.options.map((option) => (
						<Button
							key={option.id}
							onClick={() => onItemClick(option.id)}
							className="cursor-pointer"
							radius="full"
							color={
								data?.optionsIds.includes(option.id) ? "primary" : undefined
							}
						>
							{option.value}
						</Button>
					))}
				</div>
			</div>
		);
	}
	return (
		<Select
			label={step.title}
			isRequired={step.required}
			selectedKeys={data ? data.optionsIds : undefined}
			selectionMode="multiple"
			onSelectionChange={onSelectionChange}
			isInvalid={isInvalid}
		>
			{step.filter.options.map((option) => (
				<SelectItem key={option.id}>{option.value}</SelectItem>
			))}
		</Select>
	);
};
