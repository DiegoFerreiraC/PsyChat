module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Este plugin DEVE ser sempre o último da lista
      'react-native-reanimated/plugin',
    ],
  };
};