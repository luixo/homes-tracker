const config = {
	output: "standalone",
	transpilePackages: [
		"@/utils",
		"@/tsconfig",
		"@/db",
		"@/bot",
		"@/scrape",
		"@/filters",
		"@/intercom",
		"@/web",
	],
};

export default config;
