import type React from "react";

import "../globals.css";

import { Providers } from "./providers";

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
	<html lang="en" className="dark">
		<head>
			<title>Homes tracker Georgia</title>
		</head>
		<body>
			<Providers>{children}</Providers>
		</body>
	</html>
);

export default RootLayout;
