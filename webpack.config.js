const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env = {}, argv = {}) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: env?.mode || 'development'
  }, argv);
  
  // Fix webpack-dev-server configuration issue
  if (config.devServer) {
    // Remove any problematic properties
    const cleanDevServer = { ...config.devServer };
    delete cleanDevServer._assetEmittingPreviousFiles;
    delete cleanDevServer.assetEmittingPreviousFiles;
    
    // Set clean devServer configuration
    config.devServer = {
      hot: true,
      liveReload: true,
      historyApiFallback: {
        disableDotRule: true,
      },
      compress: true,
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      ...cleanDevServer
    };
  }
  
  // Ensure proper webpack configuration
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      'react-native$': 'react-native-web'
    }
  };
  
  return config;
};

// Handle validation errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes('Invalid options object')) {
    console.warn('Webpack dev server configuration warning:', reason.message);
  }
});