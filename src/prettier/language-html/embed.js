import {
  breakParent,
  group,
  hardline,
  indent,
  line,
} from "../document/builders.js";
import printFrontMatter from "../utils/front-matter/print.js";
import printAttribute from "./embed/attribute.js";
import getNodeContent from "./get-node-content.js";
import {
  needsToBorrowPrevClosingTagEndMarker,
  printClosingTag,
  printClosingTagSuffix,
  printOpeningTag,
  printOpeningTagPrefix,
} from "./print/tag.js";
import {
  dedentString,
  htmlTrimPreserveIndentation,
  inferElementParser,
  isScriptLikeTag,
} from "./utils/index.js";

function embed(path, options) {
  const { node } = path;

  switch (node.type) {
    case "element":
      if (isScriptLikeTag(node) || node.type === "interpolation") {
        // Fall through to "text"
        return;
      }

      if (!node.isSelfClosing) {
        const parser = inferElementParser(node);
        if (!parser) {
          return;
        }

        return async (textToDoc, print) => {
          const content = getNodeContent(node, options);
          let isEmpty = /^\s*$/u.test(content);
          let doc = "";
          if (!isEmpty) {
            doc = await textToDoc(htmlTrimPreserveIndentation(content), {
              parser,
              __embeddedInHtml: true,
            });
            isEmpty = doc === "";
          }

          return [
            printOpeningTagPrefix(node),
            group(printOpeningTag(path, options, print)),
            isEmpty ? "" : hardline,
            doc,
            isEmpty ? "" : hardline,
            printClosingTag(node, options),
            printClosingTagSuffix(node, options),
          ];
        };
      }
      break;

    case "text":
      if (isScriptLikeTag(node.parent)) {
        const parser = inferElementParser(node.parent);
        if (parser) {
          return async (textToDoc) => {
            const value =
              parser === "markdown"
                ? dedentString(node.value.replace(/^[^\S\n]*\n/u, ""))
                : node.value;
            const textToDocOptions = { parser, __embeddedInHtml: true };
            if (options.parser === "html" && parser === "babel") {
              let sourceType = "script";
              const { attrMap } = node.parent;
              if (
                attrMap &&
                (attrMap.type === "module" ||
                  ((attrMap.type === "text/babel" ||
                    attrMap.type === "text/jsx") &&
                    attrMap["data-type"] === "module"))
              ) {
                sourceType = "module";
              }
              textToDocOptions.__babelSourceType = sourceType;
            }

            return [
              breakParent,
              printOpeningTagPrefix(node),
              await textToDoc(value, textToDocOptions),
              printClosingTagSuffix(node, options),
            ];
          };
        }
      } else if (node.parent.type === "interpolation") {
        return async (textToDoc) => {
          const textToDocOptions = {
            __isInHtmlInterpolation: true, // to avoid unexpected `}}`
            __embeddedInHtml: true,
          };

          textToDocOptions.parser = "__js_expression";

          return [
            indent([line, await textToDoc(node.value, textToDocOptions)]),
            node.parent.next &&
            needsToBorrowPrevClosingTagEndMarker(node.parent.next)
              ? " "
              : line,
          ];
        };
      }
      break;

    case "attribute":
      return printAttribute(path, options);

    case "front-matter":
      return (textToDoc) => printFrontMatter(node, textToDoc);
  }
}

export default embed;
