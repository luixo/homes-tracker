"use client";

import React from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { unstable_httpBatchStreamLink as httpBatchStreamLink } from "@trpc/client";

import { getQueryClient } from "@/web/utils/query-client";
import { trpc } from "@/web/utils/trpc/client";

const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		return "";
	}
	if (process.env.SERVER_BASE_URL) {
		return process.env.SERVER_BASE_URL;
	}
	return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const TrpcProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const [queryClient] = React.useState(getQueryClient);
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
						return {
							"x-trpc-source": "csr",
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
