"use client";

import type React from "react";

import { Link } from "@nextui-org/react";

import { Header } from "../components/header";

const Page: React.FC = () => (
	<main className="py-10 w-full h-full align-center flex flex-col items-center text-center leading-8 gap-4">
		<div>
			<Header />
			<h3 className="tracking-tight font-semibold text-3xl">
				monitoring rent in Georgia
			</h3>
		</div>
		<Link isExternal showAnchorIcon href="https://t.me/homes_tracker_bot">
			<h2 className="tracking-tight font-semibold text-3xl">Start using now</h2>
		</Link>
	</main>
);

export default Page;
