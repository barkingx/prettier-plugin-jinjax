import isFrontMatter from "../utils/front-matter/is-front-matter.js";

const ignoredProperties = new Set([
  "sourceSpan",
  "startSourceSpan",
  "endSourceSpan",
  "nameSpan",
  "valueSpan",
  "keySpan",
  "tagDefinition",
  "tokens",
  "valueTokens",
  "switchValueSourceSpan",
  "expSourceSpan",
  "valueSourceSpan",
]);
new Set(["if", "else if", "for", "switch", "case"]);
function clean(original, cloned) {
  if (original.type === "text" || original.type === "comment") {
    return null;
  }

  // may be formatted by multiparser
  if (
    isFrontMatter(original) ||
    original.type === "yaml" ||
    original.type === "toml"
  ) {
    return null;
  }

  if (original.type === "attribute") {
    delete cloned.value;
  }

  if (original.type === "docType") {
    delete cloned.value;
  }
}

clean.ignoredProperties = ignoredProperties;

export default clean;
