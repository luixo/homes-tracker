import type React from "react";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
	<main className="py-4 px-8 min-h-screen flex flex-col flex-1 items-center max-sm:py-2 max-sm:px-4">
		{children}
	</main>
);

export default Layout;
