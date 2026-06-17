const path = require("path");
const current_mode = process.env.NODE_ENV === "production" ? "production" : "development";
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: "./frontend/picmes.jsx",
  output: {
    path: path.resolve(__dirname, "app", "assets", "javascripts"),
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js", ".jsx", "*"],
  },
  optimization: {
    minimize: process.env.NODE_ENV === "production",
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: "babel-loader",
      },
    ],
  },
  devtool: process.env.NODE_ENV === "production" ? false : "source-map",
  mode: current_mode,
};
