import {
  DOC_TYPE_ALIGN,
  DOC_TYPE_BREAK_PARENT,
  DOC_TYPE_FILL,
  DOC_TYPE_GROUP,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LINE,
} from "./constants.js";
import {
  assertDoc,
  assertDocArray,
  assertDocFillParts,
} from "./utils/assert-doc.js";


/**
 * @param {Doc} contents
 * @returns Doc
 */
function indent(contents) {
  assertDoc(contents);

  return { type: DOC_TYPE_INDENT, contents };
}

/**
 * @param {number | string} widthOrString
 * @param {Doc} contents
 * @returns Doc
 */
function align(widthOrString, contents) {
  assertDoc(contents);

  return { type: DOC_TYPE_ALIGN, contents, n: widthOrString };
}

/**
 * @param {Doc} contents
 * @param {object} [opts] - TBD ???
 * @returns Doc
 */
function group(contents, opts = {}) {
  assertDoc(contents);
  assertDocArray(opts.expandedStates, /* optional */ true);

  return {
    type: DOC_TYPE_GROUP,
    id: opts.id,
    contents,
    break: Boolean(opts.shouldBreak),
    expandedStates: opts.expandedStates,
  };
}

/**
 * @param {Doc} contents
 * @returns Doc
 */
function dedentToRoot(contents) {
  return align(Number.NEGATIVE_INFINITY, contents);
}
/**
 * @param {Doc[]} parts
 * @returns Doc
 */
function fill(parts) {
  assertDocFillParts(parts);

  return { type: DOC_TYPE_FILL, parts };
}

/**
 * @param {Doc} breakContents
 * @param {Doc} [flatContents]
 * @param {object} [opts] - TBD ???
 * @returns Doc
 */
function ifBreak(breakContents, flatContents = "", opts = {}) {
  assertDoc(breakContents);
  if (flatContents !== "") {
    assertDoc(flatContents);
  }

  return {
    type: DOC_TYPE_IF_BREAK,
    breakContents,
    flatContents,
    groupId: opts.groupId,
  };
}

/**
 * Optimized version of `ifBreak(indent(doc), doc, { groupId: ... })`
 * @param {Doc} contents
 * @param {{ groupId: symbol, negate?: boolean }} opts
 * @returns Doc
 */
function indentIfBreak(contents, opts) {
  assertDoc(contents);

  return {
    type: DOC_TYPE_INDENT_IF_BREAK,
    contents,
    groupId: opts.groupId,
    negate: opts.negate,
  };
}
const breakParent = { type: DOC_TYPE_BREAK_PARENT };

const hardlineWithoutBreakParent = { type: DOC_TYPE_LINE, hard: true };
const literallineWithoutBreakParent = {
  type: DOC_TYPE_LINE,
  hard: true,
  literal: true,
};

const line = { type: DOC_TYPE_LINE };
const softline = { type: DOC_TYPE_LINE, soft: true };
const hardline = [hardlineWithoutBreakParent, breakParent];
const literalline = [literallineWithoutBreakParent, breakParent];

/**
 * @param {Doc} separator
 * @param {Doc[]} docs
 * @returns Doc
 */
function join(separator, docs) {
  assertDoc(separator);
  assertDocArray(docs);

  const parts = [];

  for (let i = 0; i < docs.length; i++) {
    if (i !== 0) {
      parts.push(separator);
    }

    parts.push(docs[i]);
  }

  return parts;
}

export {
  align,
  breakParent,
  dedentToRoot,
  fill,
  group,
  hardline,
  hardlineWithoutBreakParent,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  line,
  literalline,
  literallineWithoutBreakParent,
  softline,
};
