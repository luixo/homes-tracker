import { getFormatConfig } from "@luixo/configs";

export default getFormatConfig({
	imports: {
		customGroups: [{ groupName: "react-first", elementNamePattern: ["react"] }],
		internalPattern: ["@/"],
		groups: [
			"react-first",
			["builtin", "external"],
			"internal",
			"parent",
			["sibling", "index"],
			"unknown",
		],
		newlinesBetween: true,
	},
	tailwind: {
		stylesheet: "apps/web/src/globals.css",
	},
});
