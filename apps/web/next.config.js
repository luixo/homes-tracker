const config = {
	output: "standalone",
	transpilePackages: [
		"@/utils",
		"@/tsconfig",
		"@/db",
		"@/scrape",
		"@/filters",
		"@/intercom",
		"@/web",
		"@/telegram",
		"@/server",
	],
};

export default config;
