const config = {
	experimental: {
		reactCompiler: true,
	},
	output: "standalone",
	typescript: {
		tsconfigPath: "../../tsconfig.json",
	},
	transpilePackages: [
		"@/utils",
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
