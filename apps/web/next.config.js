import { fileURLToPath } from "node:url";

const config = {
	// The build script runs workspace-wide oxlint before Next.js.
	eslint: {
		ignoreDuringBuilds: true,
	},
	experimental: {
		// Bun hoists dependencies to the repository root. Keep standalone traces
		// inside the output directory rather than writing partial packages outside it.
		outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
		reactCompiler: true,
	},
	output: "standalone",
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
	typescript: {
		tsconfigPath: "../../tsconfig.json",
	},
};

export default config;
