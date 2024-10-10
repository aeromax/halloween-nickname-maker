const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
	entry: "./src/app.js", // Update with your entry point file
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	devServer: {
		compress: true,
		port: 9000, // Change the port if needed
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader", // Optional: If you're using Babel
				},
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"], // To process CSS files
			},
			{
				test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
				type: "asset/resource", // To handle images
			},
		],
	},
	resolve: {
		fallback: {
			fs: false,
		},
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "Webpack Output",
		}),
	],
};
