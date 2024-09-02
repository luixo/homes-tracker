import React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { unstable_httpBatchStreamLink as httpBatchStreamLink } from "@trpc/client";
import { usePathname } from "next/navigation";

import { trpc } from "@/web/utils/trpc/client";

const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 5 * 1000 } },
});

const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		return "";
	}
	return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const TrpcProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const pathname = usePathname();
	const [trpcClient] = React.useState(() =>
		trpc.createClient({
			links: [
				httpBatchStreamLink({
					url: `${getBaseUrl()}/api/trpc`,
					headers: () => {
						if (typeof window === "undefined") {
							return {
								"x-trpc-source": "ssr",
							};
						}
						const requestIdMatch = /request\/(.*)\??/.exec(pathname);
						return {
							"x-trpc-source": typeof window !== "undefined" ? "csr" : "ssr",
							"x-request-id": requestIdMatch ? requestIdMatch[1] : undefined,
						};
					},
				}),
			],
		}),
	);

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	);
};
