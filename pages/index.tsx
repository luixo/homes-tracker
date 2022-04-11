import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import * as ReactQuery from "react-query";
import { getQueryKeyEntities } from "../client/queries";
import { ENTITIES_FETCH_AMOUNT, Service } from "../client/service";
import { styled } from "../client/styles";
import { getMatchedEntities } from "../server/utils/db/request-matches";
import { getEntitiesByIds } from "../server/utils/db/entities";
import { ScrapedEntity } from "../server/types/scraper";
import { globalLogger } from "../server/logger";

const Wrapper = styled("div", {
  padding: "0 1rem",
});

const Main = styled("main", {
  minHeight: "100vh",
  flex: 1,
  display: "flex",
  flexDirection: "column",
});

const Header = styled("h1");

type Props = {
  trackerId: string;
  error?: string;
};

const Home: NextPage<Props> = (props) => {
  return (
    <Wrapper>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Main>
        <Header>Homes tracker</Header>
        <Service trackerId={props.trackerId} />
        {props.error ? (
          <>
            <div>Error:</div>
            <div>{props.error}</div>
          </>
        ) : null}
      </Main>
    </Wrapper>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const logger = globalLogger.child({ handler: "/index" });
  const trackerId = context.query.trackerId;
  if (Array.isArray(trackerId) || !trackerId) {
    return {
      notFound: true,
    };
  }
  try {
    const entityIds = await getMatchedEntities(logger, trackerId);
    const queryClient = new ReactQuery.QueryClient({
      defaultOptions: {
        queries: {
          retry: 0,
        },
      },
    });
    const entities = await getEntitiesByIds(
      logger,
      entityIds.reverse().slice(0, ENTITIES_FETCH_AMOUNT)
    );
    const queryData: ReactQuery.InfiniteData<ScrapedEntity[]> = {
      pages: [entities],
      pageParams: [
        {
          offset: 20,
        },
      ],
    };
    queryClient.setQueryData(getQueryKeyEntities(), queryData);
    return {
      props: {
        trackerId,
        dehydratedState: ReactQuery.dehydrate(queryClient),
      },
    };
  } catch (e) {
    return {
      props: {
        trackerId,
        error: String(e),
      },
    };
  }
};

export default Home;
