import axios, { AxiosResponse } from "axios";
import React from "react";
import * as ReactQuery from "react-query";
import { DatabaseEntityElement } from "../server/service-helpers";
import { Entity } from "./entity";
import { getQueryKeyService } from "./queries";
import { styled } from "./styles";

type Props = {
  id: string;
};

type GetItemsResponse = {
  items: DatabaseEntityElement[];
};

type PageParam = {
  timestamp: number;
};

const Wrapper = styled("div", {});

const Header = styled("h2", {});

const Element = styled("div", {
  padding: 20,
});

const ElementTimestamp = styled("div", {
  paddingLeft: 16,
});

const ElementHeader = styled("div", {
  paddingTop: 16,
});

const NextButton = styled("button", {
  borderRadius: 4,
  background: "white",
  border: "1px solid black",
});

export const ENTITIES_FETCH_AMOUNT = 10;

export const Service: React.FC<Props> = (props) => {
  const queryResult = ReactQuery.useInfiniteQuery<DatabaseEntityElement[]>(
    getQueryKeyService(props.id),
    async (
      context: ReactQuery.QueryFunctionContext<ReactQuery.QueryKey, PageParam>
    ) => {
      const response: AxiosResponse<GetItemsResponse> = await axios(
        `/api/entity-ids`,
        {
          params: {
            timestamp: context.pageParam?.timestamp,
            id: props.id,
            amount: ENTITIES_FETCH_AMOUNT,
          },
        }
      );
      return response.data.items;
    },
    {
      getNextPageParam: (lastPage: DatabaseEntityElement[]): PageParam => ({
        timestamp: lastPage[lastPage.length - 1].timestamp,
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
      const elements = pages.reduce<DatabaseEntityElement[]>(
        (acc, page) => [...acc, ...page],
        []
      );
      const hasMore = pages[pages.length - 1].length === ENTITIES_FETCH_AMOUNT;
      return (
        <Wrapper>
          <Header>{props.id}</Header>
          {elements.map((element) => (
            <Entity
              key={element.id}
              serviceId={props.id}
              id={element.id}
              timestamp={element.timestamp}
            />
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
