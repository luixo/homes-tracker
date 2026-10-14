import { getLintConfig } from "@luixo/configs";

export default getLintConfig({
	env: {
		node: true,
	},
	ignorePatterns: ["**/.next/**"],
	overrides: [
		{
			files: ["apps/web/src/app/**"],
			rules: {
				"import/no-default-export": "off",
			},
		},
	],
	rules: {
		// Domain constants and object layouts follow the existing application conventions.
		"eslint/no-magic-numbers": "off",
		// MongoDB documents expose _id.
		"eslint/no-underscore-dangle": ["error", { allow: ["_id"] }],
		// Workspaces share server utilities and use relative imports internally.
		"import/no-nodejs-modules": "off",
		"node/no-process-env": "off",
		"node/no-top-level-await": "off",
		// We don't translate the app
		"react/jsx-no-literals": "off",
		"typescript/strict-boolean-expressions": "off",
	},
});
