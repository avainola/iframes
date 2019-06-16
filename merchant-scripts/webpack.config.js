const path = require("path");

module.exports = {
  entry: {
    merchant: "./merchant-scripts/merchant.ts"
  },
  output: {
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  devtool: "inline-source-map",
  devServer: {
    sockPort: 8080,
    // allow cors to make merchant.json awailable to merchant page domain
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*"
    }
  }
};
