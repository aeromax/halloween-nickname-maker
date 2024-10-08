// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const {v4: uuidv4} = require("uuid");
const app = express();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

//Writing to server storage
var fs = require("fs");
delete require.cache[require.resolve("./userLog.json")];
const sessionHistory = require("./userLog.json");
console.log(sessionHistory);
//

app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Enable JSON parsing for incoming requests

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-pro-002",
	systemInstruction: "Respond with a creative, spooky, halloween-themed nickname that utilizes their first name and is topical based on the costume they are wearing. Make sure you respond in a fun, lighthearted way. Don't be too chatty, a couple sentences is fine. The responses should emphasize creativity and fun while being respectful and appropriate for all audiences. Avoid any references to violence, gore, death, or inappropriate language. The nicknames should remain lighthearted friendly. Avoid repetetiveness, and be poetic. If the user inputs a response that is rude, uses offense language, is inappropriate or sexually explicity, do not generate a nickname and provide a one sentence explanation as to why why you chose not to accept their input. When you return the result, you must wrap the nickname itself in an asterix so I can isolate it.",
});

const generationConfig = {
	temperature: 1.2,
	topP: 0.9,
	topK: 40,
	maxOutputTokens: 200,
	responseMimeType: "text/plain",
};
const isolateNickname = function (nickname) {
	const match = nickname.match(/\*(.*?)\*/);
	return match ? match[1] : null;
};
const refreshSessionHistory = () => {
	return;
};
const writeToLog = sessionHistory => {
	fs.writeFile("userLog.json", JSON.stringify(sessionHistory, null, 2), "utf8", err => {
		if (err) {
			console.error("Error writing to userLog.json:", err);
			return; // Handle error appropriately (e.g., logging it or notifying the user)
		}
		console.log("Session history successfully written to userLog.json");
	});
};
// POST endpoint to get log history
app.get("/log", async (req, res) => {
	try {
		const sessionHistory = require("./userLog.json");
		res.status(200).json({sessionHistory});
	} catch (error) {
		res.status(500).json({error: "Could not fetch log"});
	}
});
// POST endpoint to generate nickname
app.post("/generate-nickname", async (req, res) => {
	// Destructure `name` and `costume` from the request body (assuming client sends in contents)
	const {name, costume} = req.body.contents[0].parts[0];
	const promptString = `My name is ${name} and I am dressed as ${costume}. Create me a unique halloween nickname!`;
	try {
		// Create a unique session ID
		let currentSessionId = uuidv4();
		// Store session history if it doesn't exist for the session
		if (!sessionHistory[currentSessionId]) {
			sessionHistory[currentSessionId] = [];
		}

		// Append this interaction to the session history (if needed later for more context)
		sessionHistory[currentSessionId].unshift({
			role: "user",
			name: name,
			costume: costume,
		});

		const result = await model.generateContent(promptString, {
			generationConfig,
			history: sessionHistory[currentSessionId],
		});
		const nickname = await result.response.text();
		const cleanResult = await isolateNickname(nickname);
		// Store model response with model role
		sessionHistory[currentSessionId].push({
			role: "model",
			result: nickname,
		});
		writeToLog(sessionHistory);
		res.status(200).json({nickname});
	} catch (error) {
		console.error("Error generating nickname:", error);
		res.status(500).json(error);
	}
});

module.exports = app;
