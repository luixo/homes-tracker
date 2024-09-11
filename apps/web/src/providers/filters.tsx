import React from "react";

import type { FilterSteps } from "@/types/filters/config";
import type { FilterStepValues } from "@/types/filters/values";

export type FiltersContextType = {
	steps: FilterSteps;
	remoteValues: FilterStepValues;
	localValues: FilterStepValues;
	updateLocalValues: React.Dispatch<React.SetStateAction<FilterStepValues>>;
	disabled: boolean;
};

export const FiltersContext = React.createContext<
	FiltersContextType | undefined
>(undefined);
