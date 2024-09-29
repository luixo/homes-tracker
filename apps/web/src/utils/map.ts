import bbox from "@turf/bbox";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import polygonToLine from "@turf/polygon-to-line";
import union from "@turf/union";

import type { Polygon, Position } from "@/types/geojson";
import type { PolygonId } from "@/types/ids";
import { mapPolygonToFeature, mapPositionToGeoPosition } from "@/utils/geojson";

type NearestPointOnLine = ReturnType<typeof nearestPointOnLine>;

const getDistance = (point: NearestPointOnLine): number =>
	point.properties.dist || 0;

// @see https://github.com/kachkaev/tooling-for-how-old-is-this-house/blob/1ec724ac219882fb13184c9ca84f741a6419def5/src/shared/helpersForGeometry.ts#L113-L189
export const getClosestPolygonPointToPoint = (
	polygon: Polygon,
	coordinates: Position,
): NearestPointOnLine => {
	if (polygon.rings.length > 1) {
		// Has holes
		const [exteriorRingPoint, ...interiorRingPoints] = polygon.rings.map(
			(ring) =>
				getClosestPolygonPointToPoint(
					{ type: "polygon", rings: [ring], id: "" as PolygonId },
					coordinates,
				),
		) as [NearestPointOnLine, ...NearestPointOnLine[]];
		if (getDistance(exteriorRingPoint) < 0) {
			// point is inside the exterior polygon shape
			const closestInteriorRingPoint = interiorRingPoints.reduce(
				(smallest, current) =>
					getDistance(current) < getDistance(smallest) ? current : smallest,
			);
			if (getDistance(closestInteriorRingPoint) < 0) {
				// point is inside one of the holes (therefore not actually inside this shape)
				return closestInteriorRingPoint;
			}
			// find which is closer, the distance to the hole or the distance to the edge of the exterior, and set that as the inner distance.
			return getDistance(closestInteriorRingPoint) <
				getDistance(exteriorRingPoint)
				? closestInteriorRingPoint
				: exteriorRingPoint;
		}
		return exteriorRingPoint;
	}
	const lineString = polygonToLine({
		type: "Feature",
		geometry: mapPolygonToFeature(polygon).geometry,
		properties: null,
	});
	if (lineString.type !== "Feature") {
		throw new Error(
			`Expected lineString.type to be Feature, got ${lineString.type}`,
		);
	}

	const lineStringGeometry = lineString.geometry;
	if (lineStringGeometry.type !== "LineString") {
		throw new Error(
			`Expected lineStringGeometry.type to be LineString, got ${lineStringGeometry.type}`,
		);
	}

	// The actual distance operation - on a normal, hole-less polygon (converted to meters)
	return nearestPointOnLine(
		lineStringGeometry,
		{
			type: "Feature",
			geometry: {
				type: "Point",
				coordinates: mapPositionToGeoPosition(coordinates),
			},
			properties: null,
		},
		{},
	);
};
const arePositionsEqual = (a: GeoJSON.Position, b: GeoJSON.Position): boolean =>
	a.length === b.length && a.every((element, index) => element === b[index]);

export const removeDuplicates = (
	positions: GeoJSON.Position[],
): GeoJSON.Position[] =>
	positions.reduce(
		(acc, position) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			if (arePositionsEqual(acc[acc.length - 1]!, position)) {
				return acc;
			}
			return [...acc, position];
		},
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		[positions[0]!],
	);

export const clearPolygon = <T extends GeoJSON.Polygon | GeoJSON.MultiPolygon>(
	polygon: T,
): T => {
	if (polygon.type === "Polygon") {
		return {
			...polygon,
			coordinates: polygon.coordinates.map(removeDuplicates),
		};
	}
	return {
		...polygon,
		coordinates: polygon.coordinates.map((ring) => ring.map(removeDuplicates)),
	};
};

export const getBoundingBox = (
	...polygons: Polygon[]
): ReturnType<typeof bbox> => {
	if (polygons.length === 1) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		return bbox(mapPolygonToFeature(polygons[0]!));
	}
	const unitedPolygons = union({
		type: "FeatureCollection",
		features: polygons.map(mapPolygonToFeature),
	});
	if (!unitedPolygons) {
		throw new Error("Uniting polygons crash");
	}
	return bbox(unitedPolygons);
};
