const path = require('path');

const resolve = absolutePath => path.resolve(process.cwd(), absolutePath);

const webpackBaseConfig = {
  resolve: {
    alias: {
      '@': resolve('extensions/metrics-server/src'),
    },
  },
};

module.exports = webpackBaseConfig;