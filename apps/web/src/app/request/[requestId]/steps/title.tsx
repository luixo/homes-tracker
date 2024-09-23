import type React from "react";

import type { FilterSteps } from "@/types/filters/config";

type Props = { step: FilterSteps[number]; isInvalid?: boolean };

export const StepTitle: React.FC<Props> = ({ step, isInvalid }) => (
	<div className={isInvalid ? "text-danger" : undefined}>
		{step.title}
		{step.required ? <span className="text-danger ml-0.5">*</span> : undefined}
	</div>
);
