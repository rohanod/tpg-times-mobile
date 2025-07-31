module.exports = function(api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    plugins: [
      ['module-resolver', { alias: { '~': './' } }],
      '@babel/plugin-transform-nullish-coalescing-operator',
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      '@babel/plugin-transform-optional-chaining',
      'react-native-reanimated/plugin'
    ]
  };
};
