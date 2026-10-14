import type * as GeoJSON from "geojson";

import type { Polygon, Position } from "@/types/geojson";
import type { PolygonId } from "@/types/ids";

export const mapPositionToGeoPosition = (
	position: Position,
): [number, number] => [position.lon, position.lat];

const toFixed = (input: number, precision = 6) =>
	Number(input.toFixed(precision));

export const mapGeoPositionToPosition = (
	position: GeoJSON.Position,
	// oxlint-disable-next-line @typescript-eslint/no-non-null-assertion
): Position => ({ lat: toFixed(position[1]!), lon: toFixed(position[0]!) });

export const mapPolygonToFeature = (
	polygon: Polygon,
): GeoJSON.Feature<GeoJSON.Polygon> => ({
	geometry: {
		coordinates: polygon.rings.map((ring) =>
			ring.map(mapPositionToGeoPosition),
		),
		type: "Polygon",
	},
	id: polygon.id,
	properties: {},
	type: "Feature",
});

export const mapFeatureToPolygon = (feature: GeoJSON.Feature): Polygon => {
	const id = (feature.id?.toString() ??
		`unknown-${Math.random()}`) as PolygonId;
	if (feature.geometry.type !== "Polygon") {
		return {
			id,
			rings: [],
			type: "polygon",
		};
	}
	return {
		id,
		rings: feature.geometry.coordinates.map((ring) =>
			ring.map(mapGeoPositionToPosition),
		),
		type: "polygon",
	};
};
