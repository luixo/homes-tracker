import React from "react";

import * as ReactQuery from "@tanstack/react-query";
import type { AppProps } from "next/app";

import { globalCss } from "../client/styles";

const globalStyles = globalCss({
	"html, body": {
		padding: 0,
		margin: 0,
		fontFamily:
			"-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
	},

	a: {
		color: "inherit",
		textDecoration: "none",
	},

	"*": {
		boxSizing: "border-box",
	},
});

const MyApp: React.FC<
	AppProps<{ dehydratedState: ReactQuery.DehydratedState }>
> = ({ Component, pageProps: { dehydratedState, ...pageProps } }) => {
	globalStyles();
	const [queryClient] = React.useState(
		() =>
			new ReactQuery.QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						refetchOnMount: false,
						retry: 0,
					},
				},
			}),
	);
	return (
		<ReactQuery.QueryClientProvider client={queryClient}>
			<ReactQuery.HydrationBoundary state={dehydratedState}>
				<Component {...pageProps} />
			</ReactQuery.HydrationBoundary>
		</ReactQuery.QueryClientProvider>
	);
};

export default MyApp;
