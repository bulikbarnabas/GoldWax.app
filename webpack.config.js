const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env = {}, argv = {}) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: env?.mode || 'development'
  }, argv);
  
  // Remove problematic webpack-dev-server options
  if (config.devServer) {
    // Remove any unknown properties that cause validation errors
    delete config.devServer._assetEmittingPreviousFiles;
    
    // Ensure only valid webpack-dev-server options are present
    const cleanDevServer = {
      allowedHosts: 'all',
      compress: true,
      hot: true,
      liveReload: true,
      historyApiFallback: {
        disableDotRule: true,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
      },
      // Keep essential properties from original config
      host: config.devServer.host || 'localhost',
      port: config.devServer.port || 19006
    };
    
    config.devServer = cleanDevServer;
  }
  
  return config;
};