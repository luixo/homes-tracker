import React from "react";
import { ScrapedEntity } from "../server/types/scraper";
import { styled } from "./styles";

type Props = ScrapedEntity;

const Wrapper = styled("div", {});

const Header = styled("h2", {});

const ElementTimestamp = styled("div", {
  paddingLeft: 16,
});

const Link = styled("a", {
  textDecoration: "underline",
});

export const Entity: React.FC<Props> = (props) => {
  return (
    <Wrapper>
      <Header>House #{props._id}</Header>
      <ElementTimestamp>
        {new Date(Number(props.postedTimestamp)).toLocaleString()}
      </ElementTimestamp>
      <Link href={props._id} target="_blank">
        {props.location.address}
      </Link>
      <div>
        {props.price}
        {props.currency}
      </div>
      <div>
        {props.rooms} rooms | {props.bedrooms} bedrooms
      </div>
      <div>
        area {props.areaSize}m2 | yard {props.yardAreaSize}m2
      </div>
    </Wrapper>
  );
};
