"use client";

import type React from "react";

import { QueryClientProvider as RawQueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/web/utils/query-client";

export const QueryClientProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const queryClient = getQueryClient();

	return (
		<RawQueryClientProvider client={queryClient}>
			{children}
		</RawQueryClientProvider>
	);
};
