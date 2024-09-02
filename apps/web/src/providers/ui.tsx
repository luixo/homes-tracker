import type React from "react";

import { NextUIProvider } from "@nextui-org/react";

export const UIProvider: React.FC<React.PropsWithChildren> = ({ children }) => (
	<NextUIProvider>{children}</NextUIProvider>
);
