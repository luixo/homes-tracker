import type React from "react";

import { Spinner } from "@nextui-org/react";

export const Paranja: React.FC<React.PropsWithChildren> = ({ children }) => (
	<div className="relative">
		{children}
		<div className="absolute size-full top-0 left-0 z-10 bg-black opacity-50 flex items-center justify-center">
			<Spinner size="lg" />
		</div>
	</div>
);
