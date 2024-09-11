import React from "react";

import type { Polygon } from "@/types/geojson";

import { DrawElements } from "./draw-elements";

export type Props = {
	polygons: Polygon[];
	onPolygonsChange: React.Dispatch<React.SetStateAction<Polygon[] | undefined>>;
};

export const Polygons: React.FC<Props> = ({ polygons, onPolygonsChange }) => {
	const onUpdatePolygon = React.useCallback(
		(polygon: Polygon) => {
			onPolygonsChange((prevPolygons = []) => {
				const prevIndex = prevPolygons.findIndex(
					(lookupPolygon) => lookupPolygon.id === polygon.id,
				);
				if (prevIndex === -1) {
					return [...prevPolygons, polygon];
				}
				return [
					...prevPolygons.slice(0, prevIndex),
					polygon,
					...prevPolygons.slice(prevIndex + 1),
				];
			});
		},
		[onPolygonsChange],
	);
	const onDeletePolygon = React.useCallback(
		(id: string) => {
			onPolygonsChange((prevPolygons = []) =>
				prevPolygons.filter((polygon) => polygon.id !== id),
			);
		},
		[onPolygonsChange],
	);
	const onDeleteAllPolygons = React.useCallback(() => {
		onPolygonsChange(undefined);
	}, [onPolygonsChange]);
	return (
		<DrawElements
			polygons={polygons}
			onUpdatePolygon={onUpdatePolygon}
			onDeletePolygon={onDeletePolygon}
			onDeleteAllPolygons={onDeleteAllPolygons}
		/>
	);
};
