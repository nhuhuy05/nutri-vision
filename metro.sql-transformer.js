const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = function ({ src, filename, options, plugins }) {
  if (filename.endsWith('.sql')) {
    return upstreamTransformer.transform({
      src: `export default ${JSON.stringify(src)};`,
      filename,
      options,
      plugins,
    });
  }
  return upstreamTransformer.transform({ src, filename, options, plugins });
};
