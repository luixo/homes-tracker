import type { NextApiRequest, NextApiResponse } from "next";

import { removeEntitiesWithPostedTimestampLt } from "@/db/entities";
import { withLogger } from "@/utils/logger";
import { DAY } from "@/utils/time";
import { getHandlerLogger } from "@/web/utils/logger";

type Response =
	| {
			success: string;
	  }
	| { error: string; stack?: string };

const handler = async (req: NextApiRequest, res: NextApiResponse<Response>) => {
	try {
		await withLogger(
			getHandlerLogger(req),
			`Cleanup handler`,
			async (logger) => {
				const today = Date.now();
				const maximumTimestamp = today - 30 * DAY;
				const entitiesRemoved = await withLogger(
					logger,
					`Fetching tracker requests`,
					removeEntitiesWithPostedTimestampLt(maximumTimestamp),
					{
						onSuccess: (result) => `${result} entities removed`,
					},
				);
				res
					.status(200)
					.send({ success: `${entitiesRemoved} entities removed` });
			},
		);
	} catch (e) {
		res.status(500).send({
			error: String(e),
			stack: e instanceof Error ? e.stack : undefined,
		});
	}
};

export default handler;
