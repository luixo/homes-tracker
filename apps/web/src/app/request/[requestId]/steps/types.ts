import type { FilterStepValue } from "@/types/filters/values";

export type UpdateState<T extends FilterStepValue> = React.Dispatch<
	React.SetStateAction<Omit<T, "id"> | undefined>
>;
