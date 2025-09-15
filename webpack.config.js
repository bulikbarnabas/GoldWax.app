const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
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
    config.output.publicPath = process.env.PUBLIC_URL + '/';
  } else if (process.env.GITHUB_PAGES) {
    const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
    config.output.publicPath = `/${repoName}/`;
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