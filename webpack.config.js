const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Fix for ajv module resolution
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'ajv/dist/compile/codegen': require.resolve('ajv/dist/compile/codegen')
    },
    fallback: {
      ...config.resolve.fallback,
      "fs": false,
      "path": false,
      "crypto": false
    }
  };
  
  // Customize the config before returning it
  if (config.mode === 'production') {
    // Optimize for production
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/
          }
        }
      }
    };
  }
  
  // Fix for GitHub Pages routing
  if (process.env.PUBLIC_URL) {
    config.output.publicPath = process.env.PUBLIC_URL.endsWith('/') ? process.env.PUBLIC_URL : process.env.PUBLIC_URL + '/';
  } else if (process.env.GITHUB_PAGES || process.env.CI) {
    const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
    if (repoName) {
      config.output.publicPath = `/${repoName}/`;
    }
  }
  
  // Ensure proper base path handling
  if (process.env.EXPO_PUBLIC_BASE_PATH) {
    config.output.publicPath = process.env.EXPO_PUBLIC_BASE_PATH.endsWith('/') 
      ? process.env.EXPO_PUBLIC_BASE_PATH 
      : process.env.EXPO_PUBLIC_BASE_PATH + '/';
  }
  
  // Ensure HTML plugin is configured correctly
  if (config.plugins) {
    const HtmlWebpackPlugin = require('html-webpack-plugin');
    const htmlPlugin = config.plugins.find(
      plugin => plugin instanceof HtmlWebpackPlugin
    );
    if (htmlPlugin) {
      htmlPlugin.options.publicPath = config.output.publicPath || '/';
    }
  }
  
  return config;
};