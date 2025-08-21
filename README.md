# prettier-plugin-jinjax

`prettier-plugin-jinjax` is a [prettier](https://prettier.io/) plugin for correctly formatting `.html` and `.jinja` files containing **JinjaX** components.

By default, Prettier's HTML formatter normalizes tags that conflict with [HTML tags](https://github.com/prettier/html-tags/blob/main/index.json) to lowercase. This can "incorrectly" format a JinjaX component like `<Button>` to `<button>`, breaking your UI. This plugin solves the problem by **disabling** this normalization, ensuring the JinjaX component tags are preserved as-is.

> [!IMPORTANT]
> This plugin is a modified version of **[Prettier 3.6.2](https://github.com/prettier/prettier/releases/tag/3.6.2)**. It has been pruned to only four packages(`common`, `document`, `language-html`, `utils`) from [original source code](https://github.com/prettier/prettier/tree/main/src), and support for vue, angular, ieConditionalComment, etc. has also being removed.

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

- the [Configuration File](https://prettier.io/docs/configuration), by adding it to `.prettierrc`:

  ```json
  {
    "plugins": ["prettier-plugin-jinjax"]
  }
  ```

- or the [CLI](https://prettier.io/docs/cli), via `--plugin`:

  ```bash
  prettier --write --plugin=prettier-plugin-jinjax .
  ```

## Options

Below are the options (from [src/prettier/language-html/options.js](src/prettier/language-html/options.js)) that `prettier-plugin-jinjax` supports:

| Option                                                                                    | Type      | Default | Description                                                     |
|-------------------------------------------------------------------------------------------|-----------|---------|-----------------------------------------------------------------|
| [bracketSameLine](https://prettier.io/docs/options#bracket-line)                          | `boolean` | `false` | Put `>` of opening tags on the last line instead of a new line. |
| [htmlWhitespaceSensitivity](https://prettier.io/docs/options#html-whitespace-sensitivity) | `choice`  | `"css"` | How to handle whitespaces in HTML.                              |
| [singleAttributePerLine](https://prettier.io/docs/options#single-attribute-per-line)      | `boolean` | `false` | Enforce a single attribute per line.                            |

## License

The package is available under the [MIT License](https://opensource.org/license/MIT).
