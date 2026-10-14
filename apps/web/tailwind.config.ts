import { nextui } from "@nextui-org/react";

const config = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
		"../../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	darkMode: "class",
	plugins: [nextui()],
	theme: {
		extend: {},
	},
};

export default config;
