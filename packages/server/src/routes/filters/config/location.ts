import pointInPolygon from "@turf/boolean-point-in-polygon";

import type { FilterStep } from "@/types/filters/config";
import { locationPolygonStepId } from "@/types/filters/ids";
import { mapPolygonToFeature, mapPositionToGeoPosition } from "@/utils/geojson";

import type { FiltersMatchers } from "./types";
import { validateStep } from "./validators";

export const getSteps = (): FilterStep[] => [
	{
		id: locationPolygonStepId,
		type: "map",
		title: "Location",
		filter: {
			initialCenter: { lon: 44.801561, lat: 41.693083 },
			initialZoom: 14,
		},
	},
];

export const filterMatchers = {
	[locationPolygonStepId]: (entity, value) =>
		validateStep("map", value, ({ polygons }) => {
			if (!entity.location.coordinates) {
				return false;
			}
			const point = Array.isArray(entity.location.coordinates)
				? entity.location.coordinates
				: mapPositionToGeoPosition(entity.location.coordinates);
			return polygons.some((polygon) =>
				pointInPolygon(point, mapPolygonToFeature(polygon)),
			);
		}),
} satisfies FiltersMatchers;
