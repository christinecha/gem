const entry = {
  'home': './scripts/home.js',
  'splash': './scripts/splash.js'
}

module.exports = {
  entry,
  output: {
    publicPath: "/build/scripts/",
    path: __dirname + "/build/scripts",
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: "/node_modules",
        query: {
          presets: [ "es2015" ]
        }
      }
    ]
  }
}
