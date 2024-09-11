import React from "react";

import { Button } from "@nextui-org/react";
import { GoPencil, GoX } from "react-icons/go";

import { Events } from "./events";

type Props = {
	drawMode: MapboxDraw.DrawMode;
	onClick: () => void;
};

export const DrawControl: React.FC<Props> = ({
	onClick: onClickRaw,
	drawMode,
}) => {
	const onClick = React.useCallback<React.MouseEventHandler>(
		(e) => {
			onClickRaw();
			e.stopPropagation();
		},
		[onClickRaw],
	);
	return (
		<Events>
			<Button onClick={onClick} isIconOnly>
				{drawMode === "draw_polygon" ? (
					<GoX size={24} />
				) : (
					<GoPencil size={24} />
				)}
			</Button>
		</Events>
	);
};
