import { procedure } from "@/server/trpc";

import { getSteps as getAreaSteps } from "./area";
import { getSteps as getLocationSteps } from "./location";
import { getSteps as getPriceSteps } from "./price";
import { getSteps as getRoomSteps } from "./rooms";

export const handler = procedure.query(() => [
	...getPriceSteps(),
	...getAreaSteps(),
	...getRoomSteps(),
	...getLocationSteps(),
]);
