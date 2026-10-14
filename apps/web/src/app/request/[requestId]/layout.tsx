import type React from "react";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => (
	<main className="py-4 px-8 max-sm:py-2 max-sm:px-4 flex min-h-screen flex-1 flex-col items-center">
		{children}
	</main>
);

export default Layout;
