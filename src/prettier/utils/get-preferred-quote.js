const SINGLE_QUOTE = "'";
const DOUBLE_QUOTE = '"';

function getPreferredQuote(text, preferredQuoteOrPreferSingleQuote) {
  const preferred =
    preferredQuoteOrPreferSingleQuote === true ||
    preferredQuoteOrPreferSingleQuote === SINGLE_QUOTE
      ? SINGLE_QUOTE
      : DOUBLE_QUOTE;
  const alternate = preferred === SINGLE_QUOTE ? DOUBLE_QUOTE : SINGLE_QUOTE;

  let preferredQuoteCount = 0;
  let alternateQuoteCount = 0;
  for (const character of text) {
    if (character === preferred) {
      preferredQuoteCount++;
    } else if (character === alternate) {
      alternateQuoteCount++;
    }
  }

  return preferredQuoteCount > alternateQuoteCount ? alternate : preferred;
}

export default getPreferredQuote;
