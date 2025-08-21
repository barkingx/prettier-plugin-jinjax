import { fill, group, hardline } from "../document/builders.js";
import { replaceEndOfLine } from "../document/utils.js";
import getPreferredQuote from "../utils/get-preferred-quote.js";
import UnexpectedNodeError from "../utils/unexpected-node-error.js";
import clean from "./clean.js";
import embed from "./embed.js";
import getVisitorKeys from "./get-visitor-keys.js";
import { locEnd, locStart } from "./loc.js";
import { insertPragma } from "./pragma.js";
import { printChildren } from "./print/children.js";
import { printElement } from "./print/element.js";
import {
  printClosingTagEnd,
  printClosingTagSuffix,
  printOpeningTagPrefix,
  printOpeningTagStart,
} from "./print/tag.js";
import preprocess from "./print-preprocess.js";
import { getTextValueParts, unescapeQuoteEntities } from "./utils/index.js";

function genericPrint(path, options, print) {
  const { node } = path;

  switch (node.type) {
    case "front-matter":
      return replaceEndOfLine(node.raw);
    case "root":
      if (options.__onHtmlRoot) {
        options.__onHtmlRoot(node);
      }
      return [group(printChildren(path, options, print)), hardline];
    case "element":
    case "ieConditionalComment":
      return printElement(path, options, print);
    case "ieConditionalStartComment":
    case "ieConditionalEndComment":
      return [printOpeningTagStart(node), printClosingTagEnd(node)];
    case "interpolation":
      return [
        printOpeningTagStart(node, options),
        ...path.map(print, "children"),
        printClosingTagEnd(node, options),
      ];
    case "text": {
      if (node.parent.type === "interpolation") {
        // replace the trailing literalline with hardline for better readability
        const trailingNewlineRegex = /\n[^\S\n]*$/u;
        const hasTrailingNewline = trailingNewlineRegex.test(node.value);
        const value = hasTrailingNewline
          ? node.value.replace(trailingNewlineRegex, "")
          : node.value;
        return [replaceEndOfLine(value), hasTrailingNewline ? hardline : ""];
      }

      const prefix = printOpeningTagPrefix(node);
      const printed = getTextValueParts(node);

      const suffix = printClosingTagSuffix(node, options);
      // We cant use `fill([prefix, printed, suffix])` because it violates rule of fill: elements with odd indices must be line break
      printed[0] = [prefix, printed[0]];
      printed.push([printed.pop(), suffix]);

      return fill(printed);
    }
    case "docType":
      return [
        group([
          printOpeningTagStart(node, options),
          " ",
          node.value.replace(/^html\b/iu, "html").replaceAll(/\s+/gu, " "),
        ]),
        printClosingTagEnd(node, options),
      ];
    case "comment":
      return [
        printOpeningTagPrefix(node),
        replaceEndOfLine(
          options.originalText.slice(locStart(node), locEnd(node)),
        ),
        printClosingTagSuffix(node, options),
      ];

    case "attribute": {
      if (node.value === null) {
        return node.rawName;
      }
      const value = unescapeQuoteEntities(node.value);
      const quote = getPreferredQuote(value, '"');
      return [
        node.rawName,
        "=",
        quote,
        replaceEndOfLine(
          quote === '"'
            ? value.replaceAll('"', "&quot;")
            : value.replaceAll("'", "&apos;"),
        ),
        quote,
      ];
    }
    case "cdata": // Transformed into `text`
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "HTML");
  }
}

const printer = {
  preprocess,
  print: genericPrint,
  insertPragma,
  massageAstNode: clean,
  embed,
  getVisitorKeys,
};

export default printer;
