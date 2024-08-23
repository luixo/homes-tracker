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

export const escapeMarkdown = (input: string) => {
  return input.replaceAll(
    new RegExp(`([${escapeChars.join("")}])`, "g"),
    "\\$1"
  );
};
