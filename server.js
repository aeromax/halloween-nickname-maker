// server.js
require("dotenv").config(); // Load environment variables from .env
const OpenAI = require("openai");
const openai = new OpenAI();
const cors = require("cors");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: "http://127.0.0.1:5500",
};
const fetch = require("node-fetch");

// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors(corsOptions));


app.use(express.json());

const apiKey = process.env.OPENAI_API_KEY; // Keep this safe!

// app.post("/generate-nickname", async (req, res) => {
app.post("/generate-nickname", async (req, res) => {

async function main() {
	const completion = await openai.chat.completions.create({
		messages: [{role: "system", content: "You are a helpful assistant."}],
		model: "gpt-4o-mini",
	});

	console.log(completion.choices[0]);
};

main();
});






app.listen(3000, () => {
	console.log("Server running on http://localhost:3000");
});

