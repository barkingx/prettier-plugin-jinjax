import prettierHtmlParser from "./prettier/language-html/parser-html.js";
import prettierHtmlPrinter from "./prettier/language-html/printer-html.js";
import prettierHtmlOptions from "./prettier/language-html/options.js";

const AST_FORMAT_NAME = "html-jinjax-ast";
const EXTENSION_NAME = "jinja";
const EXTENSION_NAME_WITH_DOT = ".jinja";
const PLUGIN_KEY = "jinjax";
const PLUGIN_KEY_PASCAL_CASED = "JinjaX";

export default {
  languages: [
    {
      name: PLUGIN_KEY_PASCAL_CASED,
      parsers: [PLUGIN_KEY],
      extensions: [EXTENSION_NAME_WITH_DOT, ".html"],
      vscodeLanguageIds: [EXTENSION_NAME],
    },
  ],
  parsers: {
    [PLUGIN_KEY]: { ...prettierHtmlParser, astFormat: AST_FORMAT_NAME },
  },
  printers: { [AST_FORMAT_NAME]: prettierHtmlPrinter },
  options: prettierHtmlOptions,
};


