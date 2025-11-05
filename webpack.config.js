const path = require("path");
const webpack = require("webpack");
const current_mode = process.env.NODE_ENV === "production" ? "production" : "development";
const TerserPlugin = require("terser-webpack-plugin");

let plugins = []; // if using any plugins for both dev and production
const devPlugins = []; // if using any plugins for development

const prodPlugins = [
  new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: JSON.stringify("production"),
    },
  }),
];

plugins = plugins.concat(process.env.NODE_ENV === "production" ? prodPlugins : devPlugins);

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
  plugins: plugins,
  optimization: {
    minimize: process.env.NODE_ENV === "production",
    minimizer: [new TerserPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
  devtool: "source-map",
  mode: current_mode,
};
