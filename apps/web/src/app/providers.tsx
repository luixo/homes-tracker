"use client";

import { QueryClientProvider } from "@/web/providers/query-client";
import { TrpcProvider } from "@/web/providers/trpc";
import { UIProvider } from "@/web/providers/ui";

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => (
	<UIProvider>
		<QueryClientProvider>
			<TrpcProvider>{children}</TrpcProvider>
		</QueryClientProvider>
	</UIProvider>
);
