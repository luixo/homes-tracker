import type React from "react";

import { Button, Modal, ModalContent, useDisclosure } from "@nextui-org/react";
import { GoCheckCircle, GoMilestone } from "react-icons/go";

import type { MapStep as MapStepType } from "@/types/filters/config";
import type { MapStepValue } from "@/types/filters/values";
import type { Polygon } from "@/types/geojson";
import { Map } from "@/web/components/map/map";

import { StepTitle } from "./title";
import type { UpdateState } from "./types";

type Props = {
	step: MapStepType;
	data: MapStepValue | undefined;
	updateState: UpdateState<MapStepValue>;
};

export const MapStep: React.FC<Props> = ({ step, data, updateState }) => {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const onPolygonsUpdate = (
		setStateAction: React.SetStateAction<Polygon[] | undefined>,
	) => {
		updateState((prevValue) => {
			const nextValue =
				typeof setStateAction === "function"
					? setStateAction(prevValue?.polygons)
					: setStateAction;
			if (!nextValue || nextValue.length === 0) {
				return;
			}
			return {
				type: "map",
				polygons: nextValue,
			};
		});
	};
	const isInvalid = step.required && !data;
	return (
		<div className="flex flex-col gap-2">
			<StepTitle step={step} />
			<Button
				onClick={onOpen}
				color={isInvalid ? "danger" : "secondary"}
				startContent={<GoMilestone size={24} />}
			>
				Open map
			</Button>
			<Modal
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				classNames={{ base: "flex-1 mt-4", wrapper: "flex-col items-center" }}
			>
				<ModalContent>
					{(onClose) => (
						<Map
							polygons={data?.polygons ?? []}
							onPolygonsUpdate={onPolygonsUpdate}
							initialCenter={step.filter.initialCenter}
							initialZoom={step.filter.initialZoom}
						>
							<Button isIconOnly onClick={onClose} color="success">
								<GoCheckCircle className="text-white" size={24} />
							</Button>
						</Map>
					)}
				</ModalContent>
			</Modal>
		</div>
	);
};
