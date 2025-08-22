# prettier-plugin-jinjax

`prettier-plugin-jinjax` is a [prettier](https://prettier.io/) plugin for correctly formatting `.html` files containing [JinjaX](https://jinjax.scaletti.dev/) components.

> [!IMPORTANT]
> This plugin is a modified version of **[prettier 3.6.2](https://github.com/prettier/prettier/releases/tag/3.6.2)**.
> It has been trimmed down to four packages (`common`, `document`, `language-html`, `utils`) from the [official source code](https://github.com/prettier/prettier/tree/main/src).
> Support for Vue, Angular, IE conditional comments, and other features has been removed.

By default, Prettier's HTML formatter normalizes tags that conflict with [html-tags](https://github.com/prettier/html-tags/blob/main/index.json) to lowercase. This can _incorrectly_ transform a JinjaX component like `<Button>` into `<button>`, breaking your UI.

This plugin solves the issue by **disabling** that normalization, ensuring JinjaX component tags are preserved as written. Alternatively, you can also choose to use tag names that do not conflict with native HTML tags in the first place.

## Getting Started

Install the plugin using your preferred package manager.

```bash
# npm
npm install --save-dev prettier prettier-plugin-jinjax

# yarn
yarn add --dev prettier prettier-plugin-jinjax

# pnpm
pnpm add --save-dev prettier prettier-plugin-jinjax
```

Then load the plugin with:

> [!NOTE]
> Once this plugin is loaded, it will automatically handle the formatting of `.html` files, instead of letting Prettier’s built-in HTML formatter do it.

- [Configuration File](https://prettier.io/docs/configuration), by adding it to `.prettierrc`:

  ```json
  {
    "plugins": ["prettier-plugin-jinjax"]
  }
  ```

- [CLI](https://prettier.io/docs/cli), using the `--plugin` option:

  ```bash
  prettier --plugin=prettier-plugin-jinjax [other options] [file/dir/glob ...]
  ```

## Options

The following options (from [src/prettier/language-html/options.js](src/prettier/language-html/options.js)) are supported:

| Option                                                                                    | Type      | Default | Description                                                     |
| ----------------------------------------------------------------------------------------- | --------- | ------- | --------------------------------------------------------------- |
| [bracketSameLine](https://prettier.io/docs/options#bracket-line)                          | `boolean` | `false` | Put `>` of opening tags on the last line instead of a new line. |
| [htmlWhitespaceSensitivity](https://prettier.io/docs/options#html-whitespace-sensitivity) | `choice`  | `"css"` | How to handle whitespaces in HTML.                              |
| [singleAttributePerLine](https://prettier.io/docs/options#single-attribute-per-line)      | `boolean` | `false` | Enforce a single attribute per line.                            |

## License

The package is available under the [MIT License](https://opensource.org/license/MIT).
