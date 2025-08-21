import {
  parse as parseHtml,
  ParseLocation,
  ParseSourceFile,
  ParseSourceSpan,
  TagContentType,
} from "angular-html-parser";
import createError from "../common/parser-create-error.js";
import parseFrontMatter from "../utils/front-matter/parse.js";
import { Node } from "./ast.js";
import { parseIeConditionalComment } from "./conditional-comment.js";
import { locEnd, locStart } from "./loc.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";
/**
 * @param {string} input
 */
function ngHtmlParser(input) {
  let { rootNodes, errors } = parseHtml(input, {
    canSelfClose: true,
    allowHtmComponentClosingTags: true,
    isTagNameCaseSensitive: true,
    getTagContentType: () => TagContentType.RAW_TEXT,
  });

  if (errors.length > 0) {
    throwParseError(errors[0]);
  }
  return rootNodes;
}

function throwParseError(error) {
  const {
    msg,
    span: { start, end },
  } = error;
  throw createError(msg, {
    loc: {
      start: { line: start.line + 1, column: start.col + 1 },
      end: { line: end.line + 1, column: end.col + 1 },
    },
    cause: error,
  });
}

/**
 * @param {string} text
 * @param {Options} options
 * @param {boolean} shouldParseFrontMatter
 */
function parse(text, options = {}, shouldParseFrontMatter = true) {
  const { frontMatter, content } = shouldParseFrontMatter
    ? parseFrontMatter(text)
    : { frontMatter: null, content: text };

  const file = new ParseSourceFile(text, options.filepath);
  const start = new ParseLocation(file, 0, 0, 0);
  const end = start.moveBy(text.length);
  const rawAst = {
    type: "root",
    sourceSpan: new ParseSourceSpan(start, end),
    children: ngHtmlParser(content),
  };

  if (frontMatter) {
    const start = new ParseLocation(file, 0, 0, 0);
    const end = start.moveBy(frontMatter.raw.length);
    frontMatter.sourceSpan = new ParseSourceSpan(start, end);
    // @ts-expect-error -- not a real AstNode
    rawAst.children.unshift(frontMatter);
  }

  const ast = new Node(rawAst);

  const parseSubHtml = (subContent, startSpan) => {
    const { offset } = startSpan;
    const fakeContent = text.slice(0, offset).replaceAll(/[^\n\r]/gu, " ");
    const subAst = parse(fakeContent + subContent, options, false);

    subAst.sourceSpan = new ParseSourceSpan(
      startSpan,
      subAst.children.at(-1).sourceSpan.end,
    );
    const firstText = subAst.children[0];
    if (firstText.length === offset) {
      subAst.children.shift();
    } else {
      firstText.sourceSpan = new ParseSourceSpan(
        firstText.sourceSpan.start.moveBy(offset),
        firstText.sourceSpan.end,
      );
      firstText.value = firstText.value.slice(offset);
    }
    return subAst;
  };

  ast.walk((node) => {
    if (node.type === "comment") {
      const ieConditionalComment = parseIeConditionalComment(
        node,
        parseSubHtml,
      );
      if (ieConditionalComment) {
        node.parent.replaceChild(node, ieConditionalComment);
      }
    }
  });

  return ast;
}

export const html = {
  parse,
  hasPragma,
  hasIgnorePragma,
  astFormat: "html",
  locStart,
  locEnd,
};
