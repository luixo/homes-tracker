import { removeEntitiesWithPostedTimestampLt } from "@/db/entities";
import { procedure } from "@/server/trpc";
import { DAY } from "@/utils/time";

export const handler = procedure.mutation(async ({ ctx }) => {
	const today = Date.now();
	const maximumTimestamp = today - 30 * DAY;
	const entitiesRemoved = await removeEntitiesWithPostedTimestampLt(
		ctx.logger,
		maximumTimestamp,
	);
	ctx.logger.info(`${entitiesRemoved} entities removed`);
	return { entitiesRemoved };
});
