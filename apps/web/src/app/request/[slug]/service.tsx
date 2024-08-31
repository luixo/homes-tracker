"use client";

import type React from "react";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import type { ScrapedEntity } from "@/db/types";
import { getQueryKeyEntities } from "@/web/utils/keys";

import { Entity } from "./entity";

type Props = {
	trackerId: string;
};

type GetItemsResponse = {
	items: ScrapedEntity[];
};

export const ENTITIES_FETCH_AMOUNT = 10;

export const Service: React.FC<Props> = ({ trackerId }) => {
	const queryResult = useSuspenseInfiniteQuery({
		queryKey: getQueryKeyEntities(),
		queryFn: async ({ pageParam }) => {
			const params = new URLSearchParams();
			for (const [key, value] of Object.entries({
				trackerId,
				limit: ENTITIES_FETCH_AMOUNT,
				offset: pageParam.offset,
			})) {
				params.set(key, value.toString());
			}
			const response = await fetch(`/api/entities?${params.toString()}`);
			const { items } = (await response.json()) as GetItemsResponse;
			return items;
		},
		initialPageParam: { offset: 0 },
		getNextPageParam: (_lastPage, allPages) => ({
			offset: allPages.reduce((acc, page) => acc + page.length, 0),
		}),
	});
	switch (queryResult.status) {
		case "error":
			return <div>Error</div>;
		case "success": {
			const { pages } = queryResult.data;
			const elements = pages.reduce<ScrapedEntity[]>(
				(acc, page) => [...acc, ...page],
				[],
			);
			const hasMore = pages[pages.length - 1]?.length === ENTITIES_FETCH_AMOUNT;
			return (
				<div>
					<h2>{trackerId}</h2>
					{elements.map((element) => (
						<Entity key={element._id} {...element} />
					))}
					{hasMore ? (
						<button
							className="br-1 border"
							onClick={() => queryResult.fetchNextPage()}
						>
							More
						</button>
					) : null}
				</div>
			);
		}
	}
};
