"use client";

import React from "react";

import { Button } from "@nextui-org/react";

import type { FilterStepValues } from "@/types/filters/values";
import type { RequestId } from "@/types/ids";
import { FiltersContext } from "@/web/providers/filters";
import { runCondition } from "@/web/utils/conditions";
import { isStepValid } from "@/web/utils/steps";
import { trpc } from "@/web/utils/trpc/client";

import { Steps } from "./steps";

type Props = {
	requestId: RequestId;
};

export const Filters: React.FC<Props> = ({ requestId }) => {
	const trpcUtils = trpc.useUtils();
	const [values] = trpc.filters.values.get.useSuspenseQuery({ requestId });
	const [steps] = trpc.filters.config.get.useSuspenseQuery();
	const [localValues, setLocalValues] = React.useState<FilterStepValues>(
		() => values,
	);
	const saveMutation = trpc.filters.values.put.useMutation({
		onSuccess: () => {
			trpcUtils.filters.values.get.setData({ requestId }, localValues);
		},
	});
	const saveValues = () => {
		saveMutation.mutate({ requestId, filters: localValues });
	};
	const isValid = steps.every((step) =>
		isStepValid(
			step,
			!step.showCondition || runCondition(step.showCondition, values),
			localValues.find((value) => value.id === step.id),
		),
	);
	return (
		<FiltersContext
			value={{
				steps,
				remoteValues: values,
				localValues,
				updateLocalValues: setLocalValues,
				disabled: saveMutation.isPending,
			}}
		>
			<Steps />
			<Button
				onClick={saveValues}
				isLoading={saveMutation.isPending}
				color="primary"
				isDisabled={!isValid}
			>
				Save filters
			</Button>
		</FiltersContext>
	);
};
