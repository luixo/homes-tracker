"use client";

import { QueryClientProvider } from "../providers/query-client";
import { TrpcProvider } from "../providers/trpc";
import { UIProvider } from "../providers/ui";

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => (
		<UIProvider>
			<QueryClientProvider>
				<TrpcProvider>{children}</TrpcProvider>
			</QueryClientProvider>
		</UIProvider>
	);
