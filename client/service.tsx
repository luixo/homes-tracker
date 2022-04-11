import axios, { AxiosResponse } from "axios";
import React from "react";
import * as ReactQuery from "react-query";
import { ScrapedEntity } from "../server/types/scraper";
import { Entity } from "./entity";
import { getQueryKeyEntities } from "./queries";
import { styled } from "./styles";

type Props = {
  trackerId: string;
};

type GetItemsResponse = {
  items: ScrapedEntity[];
};

type PageParam = {
  offset: number;
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
  const queryResult = ReactQuery.useInfiniteQuery<ScrapedEntity[]>(
    getQueryKeyEntities(),
    async (
      context: ReactQuery.QueryFunctionContext<ReactQuery.QueryKey, PageParam>
    ) => {
      const response: AxiosResponse<GetItemsResponse> = await axios(
        `/api/entities`,
        {
          params: {
            trackerId: props.trackerId,
            limit: ENTITIES_FETCH_AMOUNT,
            offset: context.pageParam?.offset,
          },
        }
      );
      return response.data.items;
    },
    {
      getNextPageParam: (
        _lastPage: ScrapedEntity[],
        allPages: ScrapedEntity[][]
      ): PageParam => ({
        offset: allPages.reduce((acc, page) => acc + page.length, 0),
      }),
    }
  );
  switch (queryResult.status) {
    case "idle":
    case "loading":
      return <div>Loading...</div>;
    case "error":
      return <div>Error</div>;
    case "success":
      const pages = queryResult.data.pages;
      const elements = pages.reduce<ScrapedEntity[]>(
        (acc, page) => [...acc, ...page],
        []
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
};
