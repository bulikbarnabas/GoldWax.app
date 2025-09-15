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
  if (process.env.GITHUB_PAGES) {
    config.output.publicPath = `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || ''}/`;
  }
  
  return config;
};