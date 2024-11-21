const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      if (process.env.NODE_ENV === "production") {
        webpackConfig.optimization.minimizer = [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true, // Remove console.log
              },
              mangle: {
                properties: {
                  regex: /^_/, // Ofusca propriedades iniciando com "_"
                },
              },
            },
          }),
        ];
      }
      return webpackConfig;
    },
  },
};
