import { getUnescapedAttributeValue } from "../utils/index.js";

function printClassNames(path, options) {
  const value = getUnescapedAttributeValue(path.node);
  if (
    path.node.fullName === "class" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return () => value.trim().split(/\s+/u).join(" ");
  }
}

export default printClassNames;
