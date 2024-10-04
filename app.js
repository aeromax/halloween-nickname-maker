// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {GoogleGenerativeAI} = require("@google/generative-ai");

const app = express();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);


app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Enable JSON parsing for incoming requests

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash",
	systemInstruction: "You will receive a user's first name and the type of halloween costume they are wearing. Give me a creative nickname that combines the two elements in a fun and lighthearted way. The responses should emphasize creativity and fun while being respectful and appropriate for all audiences. Avoid any references to violence, gore, death, or inappropriate language. The nicknames should remain lighthearted friendly. If the user inputs a response that is rude, uses offense language, is inappropriate or sexually explicity, do not generate a nickname and provide a one sentence explanation as to why why you chose not to accept their input.",
});

const generationConfig = {
	temperature: 2,
	topP: 0.95,
	topK: 64,
	maxOutputTokens: 8192,
	responseMimeType: "text/plain",
};
// POST endpoint to generate nickname
app.post("/generate-nickname", async (req, res) => {
	try {
		
		const chatSession = model.startChat({
			generationConfig,
			history: [],
		});
		const message = req.body.contents[0].parts[0];
		const result = await chatSession.sendMessage(`My name is ${message.name} and I am dressed up as a ${message.costume}.`);
		const nickname = result.response.text();
		res.status(200).json({nickname});
	} catch (error) {
		console.error("Error generating nickname:", error);
		res.status(500).json({error: "Failed to generate nickname."});
	}
});


 module.exports = app;
