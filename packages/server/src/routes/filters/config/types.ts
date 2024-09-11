import type { ScrapedEntity } from "@/types/db/entity";
import type { StepId } from "@/types/filters/ids";
import type { FilterStepValue } from "@/types/filters/values";

export type FiltersMatchers<K extends StepId = StepId> = Record<
	K,
	(entity: ScrapedEntity, value: FilterStepValue) => boolean
>;
