const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env = {}, argv = {}) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    mode: env?.mode || 'development'
  }, argv);
  
  // Clean webpack-dev-server configuration
  if (config.devServer) {
    const validDevServerOptions = {
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
      }
    };
    
    // Only keep valid webpack-dev-server options
    const originalDevServer = config.devServer;
    config.devServer = {};
    
    // Copy only valid properties
    const validKeys = [
      'allowedHosts', 'bonjour', 'client', 'compress', 'devMiddleware', 
      'headers', 'historyApiFallback', 'host', 'hot', 'ipc', 'liveReload', 
      'onListening', 'open', 'port', 'proxy', 'server', 'app', 
      'setupExitSignals', 'setupMiddlewares', 'static', 'watchFiles', 'webSocketServer'
    ];
    
    validKeys.forEach(key => {
      if (originalDevServer[key] !== undefined) {
        config.devServer[key] = originalDevServer[key];
      }
    });
    
    // Apply our custom options
    Object.assign(config.devServer, validDevServerOptions);
  }
  
  return config;
};