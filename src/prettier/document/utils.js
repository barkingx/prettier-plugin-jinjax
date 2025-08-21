import { trimNewlinesEnd } from "trim-newlines";
import { join, literalline } from "./builders.js";
import {
  DOC_TYPE_ALIGN,
  DOC_TYPE_ARRAY,
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
  DOC_TYPE_STRING,
  DOC_TYPE_TRIM,
} from "./constants.js";
import InvalidDocError from "./invalid-doc-error.js";
import getDocType from "./utils/get-doc-type.js";
import traverseDoc from "./utils/traverse-doc.js";

function mapDoc(doc, cb) {
  // Avoid creating `Map`
  if (typeof doc === "string") {
    return cb(doc);
  }

  // Within a doc tree, the same subtrees can be found multiple times.
  // E.g., often this happens in conditional groups.
  // As an optimization (those subtrees can be huge) and to maintain the
  // reference structure of the tree, the mapping results are cached in
  // a map and reused.
  const mapped = new Map();

  return rec(doc);

  function rec(doc) {
    if (mapped.has(doc)) {
      return mapped.get(doc);
    }
    const result = process(doc);
    mapped.set(doc, result);
    return result;
  }

  function process(doc) {
    switch (getDocType(doc)) {
      case DOC_TYPE_ARRAY:
        return cb(doc.map(rec));

      case DOC_TYPE_FILL:
        return cb({ ...doc, parts: doc.parts.map(rec) });

      case DOC_TYPE_IF_BREAK:
        return cb({
          ...doc,
          breakContents: rec(doc.breakContents),
          flatContents: rec(doc.flatContents),
        });

      case DOC_TYPE_GROUP: {
        let { expandedStates, contents } = doc;
        if (expandedStates) {
          expandedStates = expandedStates.map(rec);
          contents = expandedStates[0];
        } else {
          contents = rec(contents);
        }
        return cb({ ...doc, contents, expandedStates });
      }

      case DOC_TYPE_ALIGN:
      case DOC_TYPE_INDENT:
      case DOC_TYPE_INDENT_IF_BREAK:
      case DOC_TYPE_LABEL:
      case DOC_TYPE_LINE_SUFFIX:
        return cb({ ...doc, contents: rec(doc.contents) });

      case DOC_TYPE_STRING:
      case DOC_TYPE_CURSOR:
      case DOC_TYPE_TRIM:
      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
      case DOC_TYPE_LINE:
      case DOC_TYPE_BREAK_PARENT:
        return cb(doc);

      default:
        /* c8 ignore next 3 */
        throw new InvalidDocError(doc);
    }
  }
}
function stripTrailingHardlineFromParts(parts) {
  parts = [...parts];

  while (
    parts.length >= 2 &&
    parts.at(-2).type === DOC_TYPE_LINE &&
    parts.at(-1).type === DOC_TYPE_BREAK_PARENT
  ) {
    parts.length -= 2;
  }

  if (parts.length > 0) {
    const lastPart = stripTrailingHardlineFromDoc(parts.at(-1));
    parts[parts.length - 1] = lastPart;
  }

  return parts;
}

function stripTrailingHardlineFromDoc(doc) {
  switch (getDocType(doc)) {
    case DOC_TYPE_INDENT:
    case DOC_TYPE_INDENT_IF_BREAK:
    case DOC_TYPE_GROUP:
    case DOC_TYPE_LINE_SUFFIX:
    case DOC_TYPE_LABEL: {
      const contents = stripTrailingHardlineFromDoc(doc.contents);
      return { ...doc, contents };
    }

    case DOC_TYPE_IF_BREAK:
      return {
        ...doc,
        breakContents: stripTrailingHardlineFromDoc(doc.breakContents),
        flatContents: stripTrailingHardlineFromDoc(doc.flatContents),
      };

    case DOC_TYPE_FILL:
      return { ...doc, parts: stripTrailingHardlineFromParts(doc.parts) };

    case DOC_TYPE_ARRAY:
      return stripTrailingHardlineFromParts(doc);

    case DOC_TYPE_STRING:
      return trimNewlinesEnd(doc);

    case DOC_TYPE_ALIGN:
    case DOC_TYPE_CURSOR:
    case DOC_TYPE_TRIM:
    case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
    case DOC_TYPE_LINE:
    case DOC_TYPE_BREAK_PARENT:
      // No op
      break;

    default:
      throw new InvalidDocError(doc);
  }

  return doc;
}
// - concat strings
// - flat arrays except for parts of `fill`
// - merge arrays of strings into single strings
// - remove nested `group`s and empty `fill`/`align`/`indent`/`line-suffix`/`if-break` if possible
function replaceEndOfLine(doc, replacement = literalline) {
  return mapDoc(doc, (currentDoc) =>
    typeof currentDoc === "string"
      ? join(replacement, currentDoc.split("\n"))
      : currentDoc,
  );
}
/**
 * returns true iff cleanDoc(doc) === ""
 * @param {import("./builders.js").Doc} doc
 * @returns {boolean}
 */
function isEmptyDoc(doc) {
  let isEmpty = true;
  traverseDoc(doc, (doc) => {
    switch (getDocType(doc)) {
      case DOC_TYPE_STRING:
        if (doc === "") {
          break;
        }
      // fallthrough
      case DOC_TYPE_TRIM:
      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
      case DOC_TYPE_LINE:
      case DOC_TYPE_BREAK_PARENT:
        isEmpty = false;
        return false;
    }
  });
  return isEmpty;
}

export { getDocType, isEmptyDoc, mapDoc, replaceEndOfLine, traverseDoc };
