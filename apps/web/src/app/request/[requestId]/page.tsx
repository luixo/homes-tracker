import type React from "react";

import { notFound } from "next/navigation";

import type { RequestId } from "@/types/ids";
import type { PageProps } from "@/utils/page";
import { Header } from "@/web/components/header";
import { generateHydrationHelpers } from "@/web/utils/trpc/rsc";

import { Filters } from "./filters";

const Page: React.FC<PageProps<{ requestId: string }>> = async ({ params }) => {
	const requestId = params.requestId as RequestId;
	const { trpc, HydrateClient } = generateHydrationHelpers();
	try {
		await trpc.filters.config.get();
		await trpc.filters.values.get({ requestId });
	} catch {
		return notFound();
	}
	return (
		<HydrateClient>
			<div className="max-w-screen-md gap-6 flex w-full flex-col">
				<Header />
				<Filters requestId={requestId} />
			</div>
		</HydrateClient>
	);
};

export default Page;
