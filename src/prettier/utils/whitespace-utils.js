import escapeStringRegexp from "escape-string-regexp";

class WhitespaceUtils {
  #whitespaceCharacters;

  constructor(whitespaceCharacters) {
    this.#whitespaceCharacters = new Set(whitespaceCharacters);

    if (
      this.#whitespaceCharacters.size === 0 ||
      Array.prototype.some.call(
        whitespaceCharacters,
        (character) => !/^\s$/u.test(character),
      )
    ) {
      throw new TypeError(
        `Invalid characters: ${JSON.stringify(whitespaceCharacters)}`,
      );
    }
  }

  getLeadingWhitespaceCount(text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    let count = 0;

    for (
      let index = 0;
      index < text.length && whitespaceCharacters.has(text.charAt(index));
      index++
    ) {
      count++;
    }

    return count;
  }

  getTrailingWhitespaceCount(text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    let count = 0;

    for (
      let index = text.length - 1;
      index >= 0 && whitespaceCharacters.has(text.charAt(index));
      index--
    ) {
      count++;
    }

    return count;
  }

  getLeadingWhitespace(text) {
    const count = this.getLeadingWhitespaceCount(text);
    return text.slice(0, count);
  }

  getTrailingWhitespace(text) {
    const count = this.getTrailingWhitespaceCount(text);
    return text.slice(text.length - count);
  }
  trimStart(text) {
    const count = this.getLeadingWhitespaceCount(text);
    return text.slice(count);
  }

  trimEnd(text) {
    const count = this.getTrailingWhitespaceCount(text);
    return text.slice(0, text.length - count);
  }

  trim(text) {
    return this.trimEnd(this.trimStart(text));
  }

  split(text, captureWhitespace = false) {
    const pattern = `[${escapeStringRegexp(
      [...this.#whitespaceCharacters].join(""),
    )}]+`;
    const regexp = new RegExp(
      captureWhitespace ? `(${pattern})` : pattern,
      "u",
    );
    return text.split(regexp);
  }

  hasWhitespaceCharacter(text) {
    const whitespaceCharacters = this.#whitespaceCharacters;
    return Array.prototype.some.call(text, (character) =>
      whitespaceCharacters.has(character),
    );
  }
}

export default WhitespaceUtils;
