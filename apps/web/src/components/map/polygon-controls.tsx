import type React from "react";

import { Button, ButtonGroup } from "@nextui-org/react";
import { GoPencil, GoSkip, GoTrash } from "react-icons/go";

import type { Polygon } from "@/types/geojson";

import { MarkerAtPolygonTopLeft } from "./marker-at-polygon-top-left";

type Props = {
	isEditing: boolean;
	polygon: Polygon;
	onRemove: () => void;
	onEdit: () => void;
	onStopEdit: () => void;
};

export const PolygonControls: React.FC<Props> = ({
	isEditing,
	polygon,
	onRemove,
	onEdit,
	onStopEdit,
}) => (
	<MarkerAtPolygonTopLeft polygon={polygon}>
		{isEditing ? (
			<Button size="sm" onClick={onStopEdit} isIconOnly>
				<GoSkip size={16} />
			</Button>
		) : (
			<ButtonGroup>
				<Button size="sm" onClick={onEdit} isIconOnly>
					<GoPencil size={16} />
				</Button>
				<Button size="sm" onClick={onRemove} isIconOnly>
					<GoTrash size={16} />
				</Button>
			</ButtonGroup>
		)}
	</MarkerAtPolygonTopLeft>
);
