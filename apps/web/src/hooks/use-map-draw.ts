import React from "react";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { unkinkPolygon } from "@turf/unkink-polygon";
import type {
	CircleLayerSpecification,
	FillLayerSpecification,
	LineLayerSpecification,
} from "mapbox-gl";
// @ts-expect-error Freehand mode doesn't have types
import FreehandMode from "mapbox-gl-draw-freehand-mode";
import type { MapRef } from "react-map-gl";

import type { Polygon } from "@/types/geojson";
import { mapFeatureToPolygon } from "@/utils/geojson";
import { clearPolygon } from "@/web/utils/map";

const colors = {
	darkActive: "#ff0000",
};

const getCirclePaint = (): CircleLayerSpecification["paint"] => ({
	"circle-color": colors.darkActive,
	"circle-radius": 3,
});
const getFillPaint = (): FillLayerSpecification["paint"] => ({
	"fill-color": colors.darkActive,
	"fill-opacity": 0.15,
});
const LINE_LAYOUT: LineLayerSpecification["layout"] = {
	"line-cap": "round",
	"line-join": "round",
};

const getLinePaint = (
	dasharray?: number[],
): LineLayerSpecification["paint"] => {
	const linePaint: NonNullable<LineLayerSpecification["paint"]> = {
		"line-color": colors.darkActive,
		"line-width": 2,
	};
	if (dasharray) {
		linePaint["line-dasharray"] = dasharray;
	}
	return linePaint;
};

const getStyles = () => [
	// Selected polygon vertex points
	{
		filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
		id: `mapbox_gl-draw-polygon-and-line-vertex-active`,
		paint: getCirclePaint(),
		type: "circle",
	},
	// Selected polygon midpoints
	{
		filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
		id: `mapbox_gl-draw-polygon-midpoint`,
		paint: getCirclePaint(),
		type: "circle",
	},

	// Selected polygon fill
	{
		filter: ["all", ["==", "$type", "Polygon"]],
		id: `mapbox_gl-draw-polygon-fill`,
		paint: getFillPaint(),
		type: "fill",
	},
	// Selected polygon outline stroke (first one for first edge, latter for the rest)
	{
		filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
		id: `mapbox_gl-draw-line`,
		layout: LINE_LAYOUT,
		paint: getLinePaint([0.2, 2]),
		type: "line",
	},
	{
		filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
		id: `mapbox_gl-draw-polygon-stroke-active`,
		layout: LINE_LAYOUT,
		paint: getLinePaint([0.2, 2]),
		type: "line",
	},
	// Not selected polygon outline
	{
		filter: ["all", ["==", "$type", "Polygon"], ["!=", "active", "true"]],
		id: `mapbox_gl-draw-polygon-stroke-static`,
		layout: LINE_LAYOUT,
		paint: getLinePaint(),
		type: "line",
	},
];

export const DEFAULT_MODE = "simple_select";

// see https://github.com/mapbox/mapbox-gl-draw/issues/667#issuecomment-418909342
const SimpleSelectNoDrag = {
	...MapboxDraw.modes.simple_select,
	dragMove() {
		/* Disable dragging in simple-select mode. */
	},
};

const createDraw = () =>
	new MapboxDraw({
		defaultMode: DEFAULT_MODE,
		displayControlsDefault: false,
		modes: {
			...MapboxDraw.modes,
			// oxlint-disable-next-line @typescript-eslint/no-unsafe-assignment
			draw_polygon: FreehandMode,
			simple_select: SimpleSelectNoDrag,
		},
		styles: getStyles(),
	});

export const useMapDraw = (
	map: MapRef | undefined,
	onUpdatePolygon: (polygon: Polygon) => void,
	onConnect?: (draw: MapboxDraw) => void,
	onDisconnect?: (draw: MapboxDraw) => void,
) => {
	const draw = React.useMemo(() => createDraw(), []);
	React.useEffect(() => {
		map?.addControl(draw);
		onConnect?.(draw);
		return () => {
			onDisconnect?.(draw);
			if (!map) {
				return;
			}
			// Sometimes map reference is removed from draw before (e.g. on map destruction)
			// And duplicate "removeControl" invocation causes exception
			if (map.hasControl(draw)) {
				map.removeControl(draw);
			}
		};
		// We want to run onConnect / onDisconnect effects only once
		// oxlint-disable-next-line react/rule-suppression
		// oxlint-disable-next-line react/exhaustive-deps
	}, [map, draw]);
	React.useEffect(() => {
		if (!map) {
			return;
		}
		const handler = (
			e: MapboxDraw.DrawCreateEvent | MapboxDraw.DrawUpdateEvent,
		) => {
			if (
				e.type === "draw.update" &&
				// oxlint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
				(e as any).triggerEvent === "onMouseOut"
			) {
				return;
			}
			const [drawnFeature] = e.features;
			if (!drawnFeature) {
				return;
			}
			const { geometry } = drawnFeature;
			if (geometry.type !== "Polygon") {
				return;
			}
			const unkinkedPolygon = unkinkPolygon(clearPolygon(geometry));
			if (unkinkedPolygon.features.length === 1) {
				onUpdatePolygon(
					mapFeatureToPolygon({
						// oxlint-disable-next-line @typescript-eslint/no-non-null-assertion
						...unkinkedPolygon.features[0]!,
						id: drawnFeature.id,
					}),
				);
			}
			if (draw.getSelectedIds().length === 0) {
				// Disable select mode in case of polygon just got drawn
				setTimeout(() => {
					draw.changeMode("simple_select");
				}, 0);
			}
		};
		map.on("draw.create", handler);
		map.on("draw.update", handler);
		return () => {
			map.off("draw.create", handler);
			map.off("draw.update", handler);
		};
	}, [map, onUpdatePolygon, draw]);
	return draw;
};
