import React from "react";

import MapboxDraw from "@mapbox/mapbox-gl-draw";
import unkinkPolygon from "@turf/unkink-polygon";
import type { CirclePaint, FillPaint, LineLayout, LinePaint } from "mapbox-gl";
// @ts-expect-error Freehand mode doesn't have types
import FreehandMode from "mapbox-gl-draw-freehand-mode";
import type { MapRef } from "react-map-gl";

import type { Polygon } from "@/types/geojson";
import { mapFeatureToPolygon } from "@/utils/geojson";
import { clearPolygon } from "@/web/utils/map";

const colors = {
	darkActive: "#ff0000",
};

const getCirclePaint = (): CirclePaint => ({
	"circle-radius": 3,
	"circle-color": colors.darkActive,
});
const getFillPaint = (): FillPaint => ({
	"fill-color": colors.darkActive,
	"fill-opacity": 0.15,
});
const LINE_LAYOUT: LineLayout = {
	"line-cap": "round",
	"line-join": "round",
};

const getLinePaint = (dasharray?: number[]): LinePaint => {
	const linePaint: LinePaint = {
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
		id: `mapbox_gl-draw-polygon-and-line-vertex-active`,
		type: "circle",
		filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
		paint: getCirclePaint(),
	},
	// Selected polygon midpoints
	{
		id: `mapbox_gl-draw-polygon-midpoint`,
		type: "circle",
		filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
		paint: getCirclePaint(),
	},

	// Selected polygon fill
	{
		id: `mapbox_gl-draw-polygon-fill`,
		type: "fill",
		filter: ["all", ["==", "$type", "Polygon"]],
		paint: getFillPaint(),
	},
	// Selected polygon outline stroke (first one for first edge, latter for the rest)
	{
		id: `mapbox_gl-draw-line`,
		type: "line",
		filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
		layout: LINE_LAYOUT,
		paint: getLinePaint([0.2, 2]),
	},
	{
		id: `mapbox_gl-draw-polygon-stroke-active`,
		type: "line",
		filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
		layout: LINE_LAYOUT,
		paint: getLinePaint([0.2, 2]),
	},
	// Not selected polygon outline
	{
		id: `mapbox_gl-draw-polygon-stroke-static`,
		type: "line",
		filter: ["all", ["==", "$type", "Polygon"], ["!=", "active", "true"]],
		layout: LINE_LAYOUT,
		paint: getLinePaint(),
	},
];

export const DEFAULT_MODE = "simple_select";

// see https://github.com/mapbox/mapbox-gl-draw/issues/667#issuecomment-418909342
const SimpleSelectNoDrag = {
	...MapboxDraw.modes.simple_select,
	dragMove() {},
};

const createDraw = () =>
	new MapboxDraw({
		displayControlsDefault: false,
		defaultMode: DEFAULT_MODE,
		styles: getStyles(),
		modes: {
			...MapboxDraw.modes,
			simple_select: SimpleSelectNoDrag,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			draw_polygon: FreehandMode,
		},
	});

export const useMapDraw = (
	map: MapRef | undefined,
	onUpdatePolygon: (polygon: Polygon) => void,
	onConnect?: (draw: MapboxDraw) => void,
	onDisconnect?: (draw: MapboxDraw) => void,
) => {
	const [draw] = React.useState(createDraw);
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
				// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
				(e as any).triggerEvent === "onMouseOut"
			) {
				return;
			}
			const drawnFeature = e.features[0];
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
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						...unkinkedPolygon.features[0]!,
						id: drawnFeature.id,
					}),
				);
			}
			if (draw.getSelectedIds().length === 0) {
				// Disable select mode in case of polygon just got drawn
				setTimeout(() => draw.changeMode("simple_select"), 0);
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
