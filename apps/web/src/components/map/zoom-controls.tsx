import React from "react";

import { Button } from "@nextui-org/react";
import { useGeolocated } from "react-geolocated";
import { GoHorizontalRule, GoLocation, GoPlus } from "react-icons/go";
import { useMap } from "react-map-gl";

import { mapPositionToGeoPosition } from "@/utils/geojson";

import { Events } from "./events";

export const ZoomControls: React.FC<{ className?: string }> = ({
	className,
}) => {
	const maps = useMap();
	const onGeolocation = React.useCallback(
		(geolocation: GeolocationCoordinates) => {
			maps.default?.flyTo({
				center: mapPositionToGeoPosition({
					lon: geolocation.longitude,
					lat: geolocation.latitude,
				}),
			});
		},
		[maps.default],
	);
	const { coords, getPosition, positionError, isGeolocationAvailable } =
		useGeolocated({
			positionOptions: {
				enableHighAccuracy: false,
			},
			userDecisionTimeout: 5000,
			suppressLocationOnMount: true,
			onSuccess: (value) => onGeolocation(value.coords),
		});
	const zoomIn = React.useCallback(
		() => maps.default?.zoomIn(),
		[maps.default],
	);
	const zoomOut = React.useCallback(
		() => maps.default?.zoomOut(),
		[maps.default],
	);
	const geolocate = React.useCallback(() => {
		if (coords) {
			onGeolocation(coords);
		} else {
			getPosition();
		}
	}, [coords, onGeolocation, getPosition]);
	return (
		<Events
			className={["flex flex-col gap-3", className].filter(Boolean).join(" ")}
		>
			<Button onClick={zoomIn} isIconOnly>
				<GoPlus size={24} />
			</Button>
			<Button onClick={zoomOut} isIconOnly>
				<GoHorizontalRule size={24} />
			</Button>
			<Button
				onClick={geolocate}
				disabled={!isGeolocationAvailable || Boolean(positionError)}
				isIconOnly
			>
				<GoLocation size={24} />
			</Button>
		</Events>
	);
};
