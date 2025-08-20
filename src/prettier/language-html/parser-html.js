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
 * @param {ParseOptions} parseOptions
 */
function ngHtmlParser(input, parseOptions) {
  const {
    canSelfClose = true,
    allowHtmComponentClosingTags = false,
    isTagNameCaseSensitive = false,
    shouldParseAsRawText,
  } = parseOptions;

  let { rootNodes, errors } = parseHtml(input, {
    canSelfClose,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    getTagContentType: shouldParseAsRawText
      ? (...args) =>
          shouldParseAsRawText(...args) ? TagContentType.RAW_TEXT : undefined
      : undefined,
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
 * @param {ParseOptions} parseOptions
 * @param {Options} options
 * @param {boolean} shouldParseFrontMatter
 */
function parse(
  text,
  parseOptions,
  options = {},
  shouldParseFrontMatter = true,
) {
  const { frontMatter, content } = shouldParseFrontMatter
    ? parseFrontMatter(text)
    : { frontMatter: null, content: text };

  const file = new ParseSourceFile(text, options.filepath);
  const start = new ParseLocation(file, 0, 0, 0);
  const end = start.moveBy(text.length);
  const rawAst = {
    type: "root",
    sourceSpan: new ParseSourceSpan(start, end),
    children: ngHtmlParser(content, parseOptions),
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
    const subAst = parse(
      fakeContent + subContent,
      parseOptions,
      options,
      false,
    );

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

/**
 * @param {ParseOptions} parseOptions
 */
function createParser(parseOptions) {
  return {
    parse: (text, options) => parse(text, parseOptions, options),
    hasPragma,
    hasIgnorePragma,
    astFormat: "html",
    locStart,
    locEnd,
  };
}

/** @type {ParseOptions} */
const HTML_PARSE_OPTIONS = {
  name: "html",
  normalizeTagName: true,
  normalizeAttributeName: true,
  allowHtmComponentClosingTags: true,
};

// HTML
export const html = createParser(HTML_PARSE_OPTIONS);
