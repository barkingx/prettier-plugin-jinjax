import * as linguistLanguages from "linguist-languages";
import createLanguage from "../utils/create-language.js";

const languages = [
  createLanguage(linguistLanguages.HTML, () => ({
    parsers: ["html"],
    vscodeLanguageIds: ["html"],
  })),
];

export default languages;
