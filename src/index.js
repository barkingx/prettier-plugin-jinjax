import { html as prettierHtmlParser } from "./prettier/language-html/parser-html.js";
import prettierHtmlPrinter from "./prettier/language-html/printer-html.js";
import prettierHtmlOptions from "./prettier/language-html/options.js";

const PLUGIN_KEY = "jinjax";

export default {
  languages: [
    {
      name: "JinjaX",
      parsers: [PLUGIN_KEY],
      extensions: [".html", ".jinja"],
      vscodeLanguageIds: ["html", "jinja"],
    },
  ],
  parsers: { [PLUGIN_KEY]: prettierHtmlParser },
  printers: { [prettierHtmlParser.astFormat]: prettierHtmlPrinter },
  options: prettierHtmlOptions,
};
