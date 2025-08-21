import { indent, softline } from "../../document/builders.js";

/**
 * @import {Doc} from "../../document/builders.js"
 */

function printExpand(doc, canHaveTrailingWhitespace = true) {
  return [indent([softline, doc]), canHaveTrailingWhitespace ? softline : ""];
}
export {  printExpand};
