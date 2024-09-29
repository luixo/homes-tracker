import React from "react";

import { useRafState, useWindowSize } from "@react-hookz/web";
import type { ViewState, ViewStateChangeEvent } from "react-map-gl";
import { MapProvider, Map as ReactMap, useMap } from "react-map-gl";

import type { Polygon, Position } from "@/types/geojson";
import { getBoundingBox } from "@/web/utils/map";

import { Events, NoEvents } from "./events";
import { Polygons } from "./polygons";
import { ZoomControls } from "./zoom-controls";

type Props = {
	polygons: Polygon[];
	onPolygonsUpdate: React.Dispatch<React.SetStateAction<Polygon[] | undefined>>;
	initialCenter: Position;
	initialZoom: number;
	children?: React.ReactNode;
};

// see https://docs.mapbox.com/help/glossary/zoom-level/
const MAX_MAP_ZOOM = 22;

const MapInner: React.FC<Props> = ({
	polygons,
	onPolygonsUpdate,
	initialCenter,
	initialZoom,
	children,
}) => {
	const map = useMap();
	const [viewport, setViewport] = React.useState<Partial<ViewState>>(() => {
		if (polygons.length === 0) {
			return {
				latitude: initialCenter.lat,
				longitude: initialCenter.lon,
				zoom: initialZoom,
			};
		}
		return {
			bounds: getBoundingBox(...polygons),
			fitBoundsOptions: {
				padding: 16,
			},
		};
	});
	const onMove = React.useCallback(
		(event: ViewStateChangeEvent) => setViewport(event.viewState),
		[setViewport],
	);
	const { width, height } = useWindowSize(
		useRafState,
		typeof window === "undefined",
	);
	React.useEffect(() => {
		map.current?.resize();
	}, [map, width, height]);
	return (
		<div className="size-full">
			<style
				// Overriding defaults for mapbox
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={{
					__html: `
          .mapboxgl-map { font-family: inherit; font-size: inherit; line-height: inherit; }
          .mapboxgl-popup-tip { display: none; }
          .mapboxgl-popup-content { padding: 0; background: transparent; }
          div[mapboxgl-children] { width: 100%; height: 100%; }
          `,
				}}
			/>
			<ReactMap
				{...viewport}
				dragRotate={false}
				attributionControl={false}
				mapStyle="mapbox://styles/mapbox/streets-v11"
				onMove={onMove}
				mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_KEY}
				pitchWithRotate={false}
				maxZoom={MAX_MAP_ZOOM}
			>
				<NoEvents className="justify-end">
					<ZoomControls className="self-center" />
				</NoEvents>
				<Polygons polygons={polygons} onPolygonsChange={onPolygonsUpdate} />
				<NoEvents className="justify-start">
					<Events className="self-end">{children}</Events>
				</NoEvents>
			</ReactMap>
		</div>
	);
};

export const Map: React.FC<Props> = (props) => (
	<MapProvider>
		<MapInner {...props} />
	</MapProvider>
);
