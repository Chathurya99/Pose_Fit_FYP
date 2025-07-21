/* eslint-disable import/no-extraneous-dependencies */
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    index: "./src/index.js",
    "challenge-run": "./src/challenge-run.js"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/template.html",
      filename: "index.html",
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/contact.html',
      filename: 'contact.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/login.html',
      filename: 'login.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/templatecopy.html',
      filename: 'temp.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/dashboard.html',
      filename: 'dashboard.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/register.html',
      filename: 'register.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/user_activity.html',
      filename: 'user_activity.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/user_activity_graph.html',
      filename: 'user_activity_graph.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/pri.html',
      filename: 'pri.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/yash.html',
      filename: 'yash.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/bmi.html',
      filename: 'bmi.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/about.html',
      filename: 'about.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/blog.html',
      filename: 'blog.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/aboutus.html',
      filename: 'aboutus.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/contactus.html',
      filename: 'contactus.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/workoutplans.html',
      filename: 'workoutplans.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/team.html',
      filename: 'team.html',
      chunks: ["index"]
    }),
    new HtmlWebpackPlugin({
      template: './src/challenges.html',
      filename: 'challenges.html',
      chunks: []
    }),
    new HtmlWebpackPlugin({
      template: './src/challenge-run.html',
      filename: 'challenge-run.html',
      chunks: ["challenge-run"]
    }),
  ],
  devServer: {
    watchFiles: ["./src/*.html"],
    port: 8080,
    open: true,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
};
