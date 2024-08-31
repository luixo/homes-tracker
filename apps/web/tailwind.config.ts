import { nextui } from "@nextui-org/react";

const config = {
	content: [
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
		"../../node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {},
	},
	darkMode: "class",
	plugins: [nextui()],
};

export default config;
