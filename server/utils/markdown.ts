const escapeChars = [
  "_",
  "*",
  "\\[",
  "\\]",
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
  input.replaceAll(new RegExp(`([${escapeChars.join("")}])`, "g"), "\\$1");
