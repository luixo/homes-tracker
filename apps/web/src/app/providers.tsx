"use client";

import { NextUIProvider } from "@nextui-org/react";
import {
	QueryClient,
	QueryClientProvider,
	isServer,
} from "@tanstack/react-query";

const makeQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	});

let browserQueryClient: QueryClient | undefined;
function getQueryClient() {
	if (isServer) {
		return makeQueryClient();
	}
	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}
	return browserQueryClient;
}

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
	const queryClient = getQueryClient();

	return (
		<NextUIProvider>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</NextUIProvider>
	);
};
