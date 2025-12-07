module.exports = function (options) {
  return {
    ...options,
    externals: [
      ...(Array.isArray(options.externals) ? options.externals : [options.externals]),
      { bcrypt: 'commonjs bcrypt' },
    ],
  };
};
