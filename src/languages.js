import { EXTENSION_NAME, EXTENSION_NAME_WITH_DOT, PLUGIN_KEY, PLUGIN_KEY_PASCAL_CASED, } from "./constants.js";
export const languages = [
    {
        name: PLUGIN_KEY_PASCAL_CASED,
        parsers: [PLUGIN_KEY],
        extensions: [EXTENSION_NAME_WITH_DOT],
        vscodeLanguageIds: [EXTENSION_NAME],
    },
];
