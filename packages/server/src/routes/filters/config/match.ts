import { TRPCError } from "@trpc/server";

import type { ScrapedEntity } from "@/types/db/entity";
import type { FilterStepValues } from "@/types/filters/values";

import { filterMatchers as areaMatchers } from "./area";
import { filterMatchers as locationMatchers } from "./location";
import { filterMatchers as priceMatchers } from "./price";
import { filterMatchers as roomsMatchers } from "./rooms";

const matchers = {
	...areaMatchers,
	...locationMatchers,
	...priceMatchers,
	...roomsMatchers,
};

export const doesMatch = (entity: ScrapedEntity, values: FilterStepValues) =>
	values.every((value) => {
		const matchedFilter = matchers[value.id];
		if (!matchedFilter) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: `Expected to have matcher for ${value.id}, but find none.`,
			});
		}
		return matchedFilter(entity, value);
	});
