import type React from "react";

import { notFound } from "next/navigation";

import type { RequestId } from "@/db/types";
import type { PageProps } from "@/utils/page";
import { generateHydrationHelpers } from "@/web/utils/trpc/rsc";

import { Header } from "../../../components/header";

import { Request } from "./request";

const Page: React.FC<PageProps<{ requestId: string }>> = async ({ params }) => {
	const requestId = params.requestId as RequestId;
	const { trpc, HydrateClient } = generateHydrationHelpers(requestId);
	const result = await trpc.requests.get();
	if (!result) {
		return notFound();
	}
	return (
		<HydrateClient>
			<div className="px-4">
				<main className="flex flex-col flex-1 min-h-screen">
					<Header />
					<Request requestId={requestId} />
				</main>
			</div>
		</HydrateClient>
	);
};

export default Page;
