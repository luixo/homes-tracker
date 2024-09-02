import { getTrackerRequests } from "@/db/requests";
import { adminProcedure } from "@/server/trpc";

export const handler = adminProcedure.query(async ({ ctx }) => {
	const requests = await getTrackerRequests(ctx.logger);
	ctx.logger.info(`${requests.length} requests fetched`);
	return requests;
});
