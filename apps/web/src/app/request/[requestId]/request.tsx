"use client";

import type React from "react";

import type { RequestId } from "@/db/types";
import { formatRequest } from "@/filters/format";
import { trpc } from "@/web/utils/trpc/client";

export const Request: React.FC<{ requestId: RequestId }> = ({ requestId }) => {
	const [data] = trpc.requests.get.useSuspenseQuery();
	if (!data) {
		return (
			<div>
				<h2>{requestId}</h2>
				Request not found!
			</div>
		);
	}
	return (
		<div>
			<h2>{requestId}</h2>
			<span>{formatRequest(data.filter)}</span>
		</div>
	);
};
