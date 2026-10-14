const escapeChars = [
	"_",
	"*",
	String.raw`\[`,
	String.raw`\]`,
	"(",
	")",
	"~",
	"`",
	">",
	"#",
	"+",
	"-",
	"=",
	"|",
	"{",
	"}",
	".",
	"!",
];

export const escapeMarkdown = (input: string) =>
	input.replaceAll(
		new RegExp(`([${escapeChars.join("")}])`, "gu"),
		String.raw`\$1`,
	);
