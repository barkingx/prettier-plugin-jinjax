import {
  getHtmlTagDefinition,
  parse as parseHtml,
  ParseLocation,
  ParseSourceFile,
  ParseSourceSpan,
  RecursiveVisitor,
  visitAll,
} from "angular-html-parser";
import createError from "../common/parser-create-error.js";
import parseFrontMatter from "../utils/front-matter/parse.js";
import { Node } from "./ast.js";
import { locEnd, locStart } from "./loc.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";
import isUnknownNamespace from "./utils/is-unknown-namespace.js";

/**
 * @param {string} input
 */
function ngHtmlParser(input) {
  const isTagNameCaseSensitive = true;

  let { rootNodes, errors } = parseHtml(input, {
    canSelfClose: true,
    allowHtmComponentClosingTags: true,
    isTagNameCaseSensitive,
    getTagContentType: undefined,
  });

  if (errors.length > 0) throwParseError(errors[0]);

  const restoreName = (node) => {
    const namespace = node.name.startsWith(":")
      ? node.name.slice(1).split(":")[0]
      : null;
    const rawName = node.nameSpan.toString();
    const hasExplicitNamespace =
      namespace !== null && rawName.startsWith(`${namespace}:`);

    node.name = hasExplicitNamespace
      ? rawName.slice(namespace.length + 1)
      : rawName;
    node.namespace = namespace;
    node.hasExplicitNamespace = hasExplicitNamespace;
  };

  const restoreNameAndValue = (node) => {
    switch (node.type) {
      case "element":
        restoreName(node);
        for (const attr of node.attrs) {
          restoreName(attr);
          if (!attr.valueSpan) {
            attr.value = null;
          } else {
            attr.value = attr.valueSpan.toString();
            if (/["']/u.test(attr.value[0])) {
              attr.value = attr.value.slice(1, -1);
            }
          }
        }
        break;
      case "comment":
        node.value = node.sourceSpan
          .toString()
          .slice("<!--".length, -"-->".length);
        break;
      case "text":
        node.value = node.sourceSpan.toString();
        break;
    }
  };
  const fixSourceSpan = (node) => {
    if (node.sourceSpan && node.endSourceSpan) {
      node.sourceSpan = new ParseSourceSpan(
        node.sourceSpan.start,
        node.endSourceSpan.end,
      );
    }
  };

  const addTagDefinition = (node) => {
    if (node.type === "element") {
      const tagDefinition = getHtmlTagDefinition(
        isTagNameCaseSensitive ? node.name : node.name.toLowerCase(),
      );
      if (
        !node.namespace ||
        node.namespace === tagDefinition.implicitNamespacePrefix ||
        isUnknownNamespace(node)
      ) {
        node.tagDefinition = tagDefinition;
      } else {
        node.tagDefinition = getHtmlTagDefinition(""); // the default one
      }
    }
  };

  visitAll(
    new (class extends RecursiveVisitor {
      visit(node) {
        restoreNameAndValue(node);
        addTagDefinition(node);
        fixSourceSpan(node);
      }
    })(),
    rootNodes,
  );

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
    rawAst.children.unshift(frontMatter);
  }

  const ast = new Node(rawAst);

  // eslint-disable-next-line no-unused-vars
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
      /* c8 ignore next */
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

  return ast;
}

export const html = {
  parse: (text, options) => parse(text, options),
  hasPragma,
  hasIgnorePragma,
  astFormat: "html",
  locStart,
  locEnd,
};
