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
		return (
			<HydrateClient>
				<div className="w-full max-w-screen-md flex flex-col gap-6">
					<Header />
					<Filters requestId={requestId} />
				</div>
			</HydrateClient>
		);
	} catch {
		return notFound();
	}
};

export default Page;
