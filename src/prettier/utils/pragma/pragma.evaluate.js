export const FORMAT_PRAGMAS = ["format", "prettier"];
export const FORMAT_IGNORE_PRAGMAS = FORMAT_PRAGMAS.map(
  (pragma) => `no${pragma}`,
);
export const FORMAT_PRAGMA_TO_INSERT = FORMAT_PRAGMAS[0];

export const [HTML_HAS_PRAGMA_REGEXP, HTML_HAS_IGNORE_PRAGMA_REGEXP] = [
  FORMAT_PRAGMAS,
  FORMAT_IGNORE_PRAGMAS,
].map(
  (pragmas) =>
    new RegExp(String.raw`^\s*<!--\s*@(?:${pragmas.join("|")})\s*-->`, "u"),
);
