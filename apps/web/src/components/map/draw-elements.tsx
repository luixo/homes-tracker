import React from "react";

import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Button } from "@nextui-org/react";
import { useRerender } from "@react-hookz/web";
import simplify from "@turf/simplify";
// @ts-expect-error Freehand mode doesn't have types
import FreehandMode from "mapbox-gl-draw-freehand-mode";
import { GoTrash } from "react-icons/go";
import { useMap } from "react-map-gl";

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

import type { Polygon } from "@/types/geojson";
import { mapPolygonToFeature } from "@/utils/geojson";
import { DEFAULT_MODE, useMapDraw } from "@/web/hooks/use-map-draw";

import { DrawControl } from "./draw-control";
import { Events, NoEvents } from "./events";
import { PolygonControls } from "./polygon-controls";

// https://en.wikipedia.org/wiki/Ramer–Douglas–Peucker_algorithm
// Tolerance is marked as ε
const SIMPLIFY_TOLERANCE = 0.0008;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
FreehandMode.simplify = (
	polygon: GeoJSON.Feature<GeoJSON.Polygon>,
	// zoom: number
): GeoJSON.Feature<GeoJSON.Polygon> =>
	simplify(polygon, {
		mutate: true,
		tolerance: SIMPLIFY_TOLERANCE,
		highQuality: true,
	});

export type FixedDrawMode = Exclude<
	MapboxDraw.DrawMode,
	"direct_select" | "draw_line_string"
>;

type Props = {
	polygons: Polygon[];
	onUpdatePolygon: (polygon: Polygon) => void;
	onDeletePolygon: (id: string) => void;
	onDeleteAllPolygons: () => void;
};

type PolygonProps = {
	polygon: Polygon;
	isEditing: boolean;
	removePolygon: (id: string) => void;
	editPolygon: (id: string) => void;
	stopEditingPolygon: (id: string) => void;
};

const PolygonElement: React.FC<PolygonProps> = ({
	polygon,
	isEditing,
	removePolygon,
	editPolygon,
	stopEditingPolygon,
}) => {
	const onRemove = React.useCallback(
		() => removePolygon(polygon.id),
		[polygon.id, removePolygon],
	);
	const onEdit = React.useCallback(
		() => editPolygon(polygon.id),
		[polygon.id, editPolygon],
	);
	const onStopEdit = React.useCallback(
		() => stopEditingPolygon(polygon.id),
		[polygon.id, stopEditingPolygon],
	);
	return (
		<PolygonControls
			polygon={polygon}
			isEditing={isEditing}
			onRemove={onRemove}
			onEdit={onEdit}
			onStopEdit={onStopEdit}
		/>
	);
};

const getSelectedIds = (draw: ReturnType<typeof useMapDraw>): string[] => {
	try {
		return draw.getSelectedIds();
	} catch {
		return [];
	}
};

export const DrawElements: React.FC<Props> = ({
	polygons,
	onUpdatePolygon,
	onDeletePolygon,
	onDeleteAllPolygons,
}) => {
	const rerender = useRerender();
	const maps = useMap();
	const defaultMap = maps.default;
	const draw = useMapDraw(
		defaultMap,
		(polygon) => {
			onUpdatePolygon(polygon);
			setTimeout(rerender, 10);
		},
		(drawInstance) =>
			polygons.forEach((polygon) =>
				drawInstance.add(mapPolygonToFeature(polygon)),
			),
	);
	const [mode, setMode] = React.useState<MapboxDraw.DrawMode>(DEFAULT_MODE);

	const onDrawControlClick = React.useCallback(() => {
		const prevMode = draw.getMode();
		switch (prevMode) {
			case "draw_polygon":
			case "draw_line_string":
				draw.changeMode("draw_point");
				draw.changeMode("simple_select");
				setMode("simple_select");
				break;
			default:
				// We do change mode + set mode because changing mode via "changeMode"
				// function does not emit "draw.modechange" event on map (because of silent: true option)
				draw.changeMode("draw_polygon");
				setMode("draw_polygon");
		}
	}, [draw]);

	const removePolygonById = React.useCallback(
		(polygonId: string) => {
			draw.delete(polygonId);
			onDeletePolygon(polygonId);
		},
		[onDeletePolygon, draw],
	);
	const manualSelectRef = React.useRef(false);
	const editPolygonById = React.useCallback(
		(polygonId: string) => {
			manualSelectRef.current = true;
			draw.changeMode("simple_select", { featureIds: [polygonId] });
			// We need to update selectedIds
			rerender();
		},
		[draw, rerender],
	);
	const removeAllPolygons = React.useCallback(() => {
		draw.deleteAll();
		onDeleteAllPolygons();
	}, [onDeleteAllPolygons, draw]);

	React.useEffect(() => {
		if (!defaultMap) {
			return;
		}
		const handler = ({ mode: nextMode }: MapboxDraw.DrawModeChangeEvent) =>
			setMode(nextMode);
		defaultMap.on("draw.modechange", handler);
		return () => {
			defaultMap.off("draw.modechange", handler);
		};
	}, [defaultMap]);

	React.useEffect(() => {
		if (!defaultMap) {
			return;
		}
		const handler = (event: MapboxDraw.DrawSelectionChangeEvent) => {
			if (
				!manualSelectRef.current &&
				event.points.length === 0 &&
				event.features.length === 1
			) {
				// Disable select mode in case of polygon was clicked (but not in case of it being edited)
				setTimeout(() => draw.changeMode("simple_select"), 0);
			}
			manualSelectRef.current = false;
		};
		defaultMap.on("draw.selectionchange", handler);
		return () => {
			defaultMap.off("draw.selectionchange", handler);
		};
	}, [defaultMap, draw]);

	return (
		<NoEvents className="justify-end items-end gap-2">
			<DrawControl drawMode={mode} onClick={onDrawControlClick} />
			{polygons.length !== 0 ? (
				<Events>
					<Button onPress={removeAllPolygons} isIconOnly color="warning">
						<GoTrash size={24} />
					</Button>
				</Events>
			) : null}
			{polygons.map((polygon) => (
				<PolygonElement
					key={polygon.id}
					polygon={polygon}
					isEditing={getSelectedIds(draw).includes(polygon.id)}
					removePolygon={removePolygonById}
					editPolygon={editPolygonById}
					stopEditingPolygon={onDrawControlClick}
				/>
			))}
		</NoEvents>
	);
};
