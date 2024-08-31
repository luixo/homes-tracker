import type React from "react";

import {
	HydrationBoundary,
	QueryClient,
	dehydrate,
} from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { getEntitiesByIds } from "@/db/entities";
import { globalLogger } from "@/utils/logger";
import { getQueryKeyEntities } from "@/web/utils/keys";

import { ENTITIES_FETCH_AMOUNT, Service } from "./service";

const Page: React.FC<{ params: { slug: string } }> = async ({
	params: { slug: trackerId },
}) => {
	const queryClient = new QueryClient();

	if (Array.isArray(trackerId) || !trackerId) {
		return notFound();
	}
	const logger = globalLogger.child({ handler: `/request/${trackerId}` });
	const entityIds: string[] = [];
	const entities = await getEntitiesByIds(
		logger,
		entityIds.reverse().slice(0, ENTITIES_FETCH_AMOUNT),
	);
	queryClient.setQueryData(getQueryKeyEntities(), {
		pages: [entities],
		pageParams: [
			{
				offset: 20,
			},
		],
	});

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<div className="px-4">
				<main className="flex flex-col flex-1 min-h-screen">
					<h1>Homes tracker</h1>
					<Service trackerId={trackerId} />
				</main>
			</div>
		</HydrationBoundary>
	);
};

export default Page;
