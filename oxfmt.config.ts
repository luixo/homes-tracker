import { getFormatConfig } from "@luixo/configs";

export default getFormatConfig({
	imports: {
		customGroups: [{ elementNamePattern: ["react"], groupName: "react-first" }],
		groups: [
			"react-first",
			["builtin", "external"],
			"internal",
			"parent",
			["sibling", "index"],
			"unknown",
		],
		internalPattern: ["@/"],
		newlinesBetween: true,
	},
	tailwind: {
		stylesheet: "apps/web/src/globals.css",
	},
});
