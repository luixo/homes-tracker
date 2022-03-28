import axios, { AxiosResponse } from "axios";
import React from "react";
import * as ReactQuery from "react-query";
import { CommonEntityDescription } from "../server/service-helpers";
import { getQueryKeyEntity } from "./queries";
import { styled } from "./styles";

type Props = {
  serviceId: string;
  id: string;
  timestamp: number;
};

type GetEntityResponse = {
  entity: Omit<CommonEntityDescription, "timestamp">;
};

const Wrapper = styled("div", {});

const Header = styled("h2", {});

const ElementTimestamp = styled("div", {
  paddingLeft: 16,
});

const Link = styled("a", {
  textDecoration: "underline",
});

export const Entity: React.FC<Props> = (props) => {
  const queryResult = ReactQuery.useQuery(
    getQueryKeyEntity(props.serviceId, props.id),
    async () => {
      const response: AxiosResponse<GetEntityResponse> = await axios(
        `/api/entity`,
        {
          params: {
            serviceId: props.serviceId,
            id: props.id,
          },
        }
      );
      return response.data;
    }
  );
  switch (queryResult.status) {
    case "idle":
    case "loading":
      return <div>Loading...</div>;
    case "error":
      return <div>Error</div>;
    case "success":
      const entity = queryResult.data.entity;
      return (
        <Wrapper>
          <Header>House #{props.id}</Header>
          <ElementTimestamp>
            {new Date(Number(props.timestamp)).toLocaleString()}
          </ElementTimestamp>
          <Link href={entity.url} target="_blank">
            {entity.address}
          </Link>
          <div>
            {entity.price ?? "unknown"}$ | {entity.pricePerBedroom ?? "unknown"}
            $/bedroom | {entity.pricePerMeter ?? "unknown"}$/m2
          </div>
          <div>
            {entity.rooms} rooms | {entity.bedrooms} bedrooms
          </div>
          <div>
            area {entity.areaSize}m2 | yard {entity.yardSize}m2
          </div>
        </Wrapper>
      );
  }
};
