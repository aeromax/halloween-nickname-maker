// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const {v4: uuidv4} = require("uuid");
const app = express();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Enable JSON parsing for incoming requests

const sessionHistory = {};

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash",
	systemInstruction: "Respond with a creative, spooky, halloween-themed nickname that utilizes their first name and is topical based on the costume they are wearing. Make sure you respond in a fun, lighthearted, slightly chatty way. The responses should emphasize creativity and fun while being respectful and appropriate for all audiences. Avoid any references to violence, gore, death, or inappropriate language. The nicknames should remain lighthearted friendly. Avoid repetetiveness, and be poetic. If the user inputs a response that is rude, uses offense language, is inappropriate or sexually explicity, do not generate a nickname and provide a one sentence explanation as to why why you chose not to accept their input.",
});

const generationConfig = {
	temperature: 1.2,
	topP: 0.9,
	topK: 50,
	maxOutputTokens: 200,
	responseMimeType: "text/plain",
};
// POST endpoint to generate nickname
app.post("/generate-nickname", async (req, res) => {

	try {
		// Destructure `name` and `costume` from the request body (assuming client sends in contents)
		const {name, costume} = req.body.contents[0].parts[0];

		// Create a unique session ID
		let currentSessionId = uuidv4();
		// Store session history if it doesn't exist for the session
		if (!sessionHistory[currentSessionId]) {
			sessionHistory[currentSessionId] = [];
		}

		// Create the prompt string based on the `name` and `costume`
		const prompt = `My name is ${name} and I am dressed up as a ${costume}. Create a spooky nickname for me that's creative and fun!`;

		// Append this interaction to the session history (if needed later for more context)
		sessionHistory[currentSessionId].push({
			role: "user",
			parts: [{content: prompt}],
		});

		const chatSession = model.startChat({
			generationConfig,
			history: sessionHistory[currentSessionId],
		});
		const result = await model.generateContent(prompt);
		const nickname = await result.response.text();
		// Store model response with model role
		sessionHistory[currentSessionId].push({
			role: "model",
			parts: [{name: name, costume: costume}],
		});
		res.status(200).json({nickname});
	} catch (error) {
		console.error("Error generating nickname:", error);
		res.status(500).json({error: "Failed to generate nickname."});
	}
});

module.exports = app;
