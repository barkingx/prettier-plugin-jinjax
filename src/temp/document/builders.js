import {
  DOC_TYPE_ALIGN,
  DOC_TYPE_BREAK_PARENT,
  DOC_TYPE_CURSOR,
  DOC_TYPE_FILL,
  DOC_TYPE_GROUP,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LABEL,
  DOC_TYPE_LINE,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE_SUFFIX_BOUNDARY,
  DOC_TYPE_TRIM,
} from "./constants.js";
import {
  assertDoc,
  assertDocArray,
  assertDocFillParts,
} from "./utils/assert-doc.js";

/**
 * TBD properly tagged union for Doc object type is needed here.
 *
 * @typedef {object} DocObject
 * @property {string} type
 * @property {boolean} [hard]
 * @property {boolean} [literal]
 *
 * @typedef {Doc[]} DocArray
 *
 * @typedef {string | DocObject | DocArray} Doc
 */

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
 * @param {Doc} contents
 * @returns Doc
 */
function markAsRoot(contents) {
  // @ts-expect-error - TBD ???:
  return align({ type: "root" }, contents);
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
const trim = { type: DOC_TYPE_TRIM };

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

const cursor = { type: DOC_TYPE_CURSOR };

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
/**
 * Mark a doc with an arbitrary truthy value. This doesn't affect how the doc is printed, but can be useful for heuristics based on doc introspection.
 * @param {any} label If falsy, the `contents` doc is returned as is.
 * @param {Doc} contents
 */
function label(label, contents) {
  assertDoc(contents);

  return label ? { type: DOC_TYPE_LABEL, label, contents } : contents;
}

export {
  align,
  breakParent,
  cursor,
  dedentToRoot,
  fill,
  group,
  hardline,
  hardlineWithoutBreakParent,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  label,
  line,
  literalline,
  literallineWithoutBreakParent,
  markAsRoot,
  softline,
  trim,
};
