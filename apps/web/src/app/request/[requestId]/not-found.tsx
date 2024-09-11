import React from "react";

import { Link } from "@nextui-org/react";

import { Header } from "@/web/components/header";

const NotFound = () => (
	<div className="flex flex-col gap-20 items-center text-center">
		<div className="flex flex-col gap-6">
			<Header />
			<h2 className="tracking-tight font-semibold text-6xl">404 Not Found</h2>
			<div className="flex flex-col gap-2">
				<h3 className="tracking-tight font-semibold text-4xl">
					You might misspelled the request id
				</h3>
				<h4 className="tracking-tight font-semibold text-2xl">
					If problem persists, contact{" "}
					<Link
						isExternal
						showAnchorIcon
						href="https://t.me/luixo"
						className="text-[length:inherit]"
					>
						me
					</Link>
				</h4>
			</div>
		</div>
		<Link isExternal showAnchorIcon href="https://t.me/homes_tracker_bot">
			<h2 className="tracking-tight font-semibold text-3xl">Start using bot</h2>
		</Link>
	</div>
);

export default NotFound;
