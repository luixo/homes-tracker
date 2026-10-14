import type React from "react";

import { Spinner } from "@nextui-org/react";

export const Paranja: React.FC<React.PropsWithChildren> = ({ children }) => (
	<div className="relative">
		{children}
		<div className="top-0 left-0 bg-black absolute z-10 flex size-full items-center justify-center opacity-50">
			<Spinner size="lg" />
		</div>
	</div>
);
