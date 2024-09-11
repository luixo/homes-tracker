import type React from "react";

export const NoEvents: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	...props
}) => (
	// Wrapper has no pointer events, all the inner elements has to enable pointer events
	<div
		{...props}
		className={[
			"flex absolute top-0 left-0 size-full pointer-events-none z-10 p-4",
			className,
		]
			.filter(Boolean)
			.join(" ")}
	/>
);

export const Events: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
	className,
	...props
}) => (
	<div
		{...props}
		className={[
			"flex relative pointer-events-auto empty:pointer-events-none",
			className,
		]
			.filter(Boolean)
			.join(" ")}
	/>
);
