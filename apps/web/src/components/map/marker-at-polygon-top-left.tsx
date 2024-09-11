import React from "react";

import bbox from "@turf/bbox";
import { Marker } from "react-map-gl";

import type { Polygon, Position } from "@/types/geojson";
import { mapGeoPositionToPosition, mapPolygonToFeature } from "@/utils/geojson";
import { getClosestPolygonPointToPoint } from "@/web/utils/map";

type Props = React.PropsWithChildren<{
	polygon: Polygon;
	onClick?: () => void;
}> &
	Omit<React.ComponentProps<typeof Marker>, "longitude" | "latitude">;

export const MarkerAtPolygonTopLeft: React.FC<Props> = ({
	polygon,
	onClick,
	children,
	className,
	...props
}) => {
	const geoCenter = React.useMemo<Position | null>(() => {
		if (polygon.rings.length === 0) {
			return null;
		}
		const polygonBbox = bbox(mapPolygonToFeature(polygon));
		return mapGeoPositionToPosition(
			getClosestPolygonPointToPoint(polygon, {
				lat: polygonBbox[0],
				lon: polygonBbox[3],
			}).geometry.coordinates,
		);
	}, [polygon]);
	if (!geoCenter) {
		return null;
	}
	return (
		<Marker
			longitude={geoCenter.lon}
			latitude={geoCenter.lat}
			onClick={onClick}
			{...props}
			className={["absolute top-0 left-0", className].filter(Boolean).join(" ")}
		>
			{children}
		</Marker>
	);
};
