const config = {
	experimental: {
		reactCompiler: true,
	},
	output: "standalone",
	transpilePackages: [
		"@/utils",
		"@/tsconfig",
		"@/db",
		"@/scrape",
		"@/intercom",
		"@/web",
		"@/telegram",
		"@/server",
		"mapbox-gl-draw-freehand-mode",
		"@mapbox/mapbox-gl-draw",
		"@react-hookz/web",
	],
};

export default config;
