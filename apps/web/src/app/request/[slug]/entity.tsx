import type React from "react";

import type { ScrapedEntity } from "@/db/types";

type Props = ScrapedEntity;

export const Entity: React.FC<Props> = (props) => (
	<div>
		<h2>House #{props._id}</h2>
		<div className="pl-4">
			{new Date(Number(props.postedTimestamp)).toLocaleString()}
		</div>
		<a href={props._id} target="_blank" rel="noreferrer">
			{props.location.address}
		</a>
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
	</div>
);
