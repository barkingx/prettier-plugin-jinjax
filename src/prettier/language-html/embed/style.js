import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

function printStyleAttribute(path, options) {
  const text = getUnescapedAttributeValue(path.node).trim();
  if (
    path.node.fullName === "style" &&
    !options.parentParser &&
    !text.includes("{{")
  ) {
    return async (textToDoc) =>
      printExpand(
        await textToDoc(text, { parser: "css", __isHTMLStyleAttribute: true }),
      );
  }
}

export { printStyleAttribute };
