/** @import {Language as LinguistLanguage} from 'linguist-languages' */
/**
@typedef {{
  name: string;
  parsers?: readonly string[];
  group?: string | undefined;
  tmScope?: string | undefined;
  aceMode?: string | undefined;
  codemirrorMode?: string | undefined;
  codemirrorMimeType?: string | undefined;
  aliases?: readonly string[] | undefined;
  extensions?: readonly string[] | undefined;
  filenames?: readonly string[] | undefined;
  linguistLanguageId?: number | undefined;
  vscodeLanguageIds?: readonly string[] | undefined;
  interpreters?: readonly string[] | undefined;
  isSupported?: ((options: {filepath: string}) => boolean) | undefined;
}} Language
*/

const excludedFields = new Set([
  "color",
  // Rename as `linguistLanguageId`
  "languageId",
]);

/**
 * @param {LinguistLanguage} linguistLanguage
 * @param {(data: LinguistLanguage) => Partial<LinguistLanguage & Language>} getOverrides
 * @returns {Language}
 */
function createLanguage(linguistLanguage, getOverrides) {
  const language = { ...linguistLanguage, ...getOverrides(linguistLanguage) };
  language.linguistLanguageId = language.languageId;

  for (const field of excludedFields) {
    delete language[field];
  }
  return language;
}

export default createLanguage;
