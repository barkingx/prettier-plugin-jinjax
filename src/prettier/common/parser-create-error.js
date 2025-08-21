function createError(message, options) {
  const error = new SyntaxError(
    message +
      " (" +
      options.loc.start.line +
      ":" +
      options.loc.start.column +
      ")",
  );

  return Object.assign(error, options);
}

export default createError;
