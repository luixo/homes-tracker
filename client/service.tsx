import type React from "react";

import * as ReactQuery from "@tanstack/react-query";

import type { ScrapedEntity } from "../server/types/scraper";

import { Entity } from "./entity";
import { getQueryKeyEntities } from "./queries";
import { styled } from "./styles";

type Props = {
	trackerId: string;
};

type GetItemsResponse = {
	items: ScrapedEntity[];
};

const Wrapper = styled("div", {});

const Header = styled("h2", {});

const NextButton = styled("button", {
	borderRadius: 4,
	background: "white",
	border: "1px solid black",
});

export const ENTITIES_FETCH_AMOUNT = 10;

export const Service: React.FC<Props> = (props) => {
	const queryResult = ReactQuery.useInfiniteQuery({
		queryKey: getQueryKeyEntities(),
		queryFn: async ({ pageParam }) => {
			const params = new URLSearchParams();
			for (const [key, value] of Object.entries({
				trackerId: props.trackerId,
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
		case "pending":
			return <div>Loading...</div>;
		case "error":
			return <div>Error</div>;
		case "success": {
			const { pages } = queryResult.data;
			const elements = pages.reduce<ScrapedEntity[]>(
				(acc, page) => [...acc, ...page],
				[],
			);
			const hasMore = pages[pages.length - 1].length === ENTITIES_FETCH_AMOUNT;
			return (
				<Wrapper>
					<Header>{props.trackerId}</Header>
					{elements.map((element) => (
						<Entity key={element._id} {...element} />
					))}
					{hasMore ? (
						<NextButton onClick={() => queryResult.fetchNextPage()}>
							More
						</NextButton>
					) : null}
				</Wrapper>
			);
		}
	}
};
