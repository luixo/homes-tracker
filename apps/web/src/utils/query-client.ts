import { QueryClient, isServer } from "@tanstack/react-query";

export const makeQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	});

let browserQueryClient: QueryClient | undefined;
export const getQueryClient = () => {
	if (isServer) {
		return makeQueryClient();
	}
	if (!browserQueryClient) {
		browserQueryClient = makeQueryClient();
	}
	return browserQueryClient;
};
