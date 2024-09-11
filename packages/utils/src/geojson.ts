import type { Polygon, Position } from "@/types/geojson";
import type { PolygonId } from "@/types/ids";

export const mapPositionToGeoPosition = (
	position: Position,
): [number, number] => [position.lon, position.lat];

const toFixed = (input: number, precision = 6) =>
	Number(input.toFixed(precision));

export const mapGeoPositionToPosition = (
	position: GeoJSON.Position,
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
): Position => ({ lon: toFixed(position[0]!), lat: toFixed(position[1]!) });

export const mapPolygonToFeature = (
	polygon: Polygon,
): GeoJSON.Feature<GeoJSON.Polygon> => ({
	type: "Feature",
	id: polygon.id,
	geometry: {
		type: "Polygon",
		coordinates: polygon.rings.map((ring) =>
			ring.map(mapPositionToGeoPosition),
		),
	},
	properties: {},
});

export const mapFeatureToPolygon = (feature: GeoJSON.Feature): Polygon => {
	const id = (feature.id?.toString() ??
		`unknown-${Math.random()}`) as PolygonId;
	if (feature.geometry.type !== "Polygon") {
		return {
			type: "polygon",
			id,
			rings: [],
		};
	}
	return {
		type: "polygon",
		id,
		rings: feature.geometry.coordinates.map((ring) =>
			ring.map(mapGeoPositionToPosition),
		),
	};
};
