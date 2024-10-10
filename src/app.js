// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const {v4: uuidv4} = require("uuid");
const app = express();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const helpers = require("./helpers");
//Writing to server storage
var fs = require("/fs");
delete require.cache[require.resolve("/userLog.json")];
const sessionHistory = require("/userLog.json");

app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Enable JSON parsing for incoming requests

// app.use(express.static(__dirname + "/static"));

// Endpoint to serve page
app.get("/", function (req, res) {
	res.sendFile(__dirname + "../index.html");
});

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash-8b",
	systemInstruction: "Respond with a creative, spooky, halloween-themed nickname that utilizes their first name and is topical based on the costume they are wearing. Make sure you respond in a fun, lighthearted way The responses should emphasize creativity and fun while being respectful and appropriate for all audiences. Avoid any references to violence, gore, death, or inappropriate language. The nicknames should remain lighthearted friendly. Avoid repetetiveness, and be poetic. Don't be afraid to be a little chatty, but limit the response to 2 sentences. Make the nickname revealed at the last part of the response, not in the middle. I don't want any language after the nickname. When you return the result, you must wrap the nickname itself in an asterix so I can isolate it. If the user inputs a response that is rude, uses offense language, is inappropriate or sexually explicity, do not generate a nickname and provide a one sentence explanation as to why why you chose not to accept their input. ",
});

const generationConfig = {
	temperature: 1.2,
	topP: 0.9,
	topK: 41,
	maxOutputTokens: 200,
	responseMimeType: "text/plain",
};

const refreshSessionHistory = () => {
	console.log("");
};
const writeToLog = sessionHistory => {
	fs.writeFile("userLog.json", JSON.stringify(sessionHistory, null, 2), "utf8", err => {
		if (err) {
			console.error("Error writing to userLog.json:", err);
			return; // Handle error appropriately (e.g., logging it or notifying the user)
		}
		console.log("Session successfully saved to log");
	});
};
// app.deleteHistory = () => {
// 	sessionHistory = "";
// 	fs.writeFile("userLog.json", JSON.stringify("{}}"), "utf8", err => {
// 		if (err) {
// 			throw new Error(err, {
// 				message: "Could not delete server history",
// 			});
// 		}
// 		console.log("Session history deleted");
// 	});
// };

// Endpoint to serve page
// app.get("/", function (req, res) {
// 	res.sendFile(__dirname + "/index.html");
// });

// GET endpoint to get log history
app.get("/log", async (req, res) => {
	try {
		const sessionHistory = require("../userLog.json");
		res.status(200).json({sessionHistory});
	} catch (error) {
		res.status(500).json({error: "Could not fetch log"});
	}
});
// POST endpoint to generate nickname
app.post("/generate-nickname", async (req, res) => {
	// Destructure `name` and `costume` from the request body (assuming client sends in contents)
	const {name, costume} = req.body;
	const promptString = `My name is ${name} and I am dressed as ${costume}.`;
	try {
		// Create a unique session ID
		let currentSessionId = uuidv4();
		const result = await model.generateContent(promptString, {
			generationConfig,
			history: sessionHistory[currentSessionId],
		});
		const nickname = await result.response.text();
		const cleanResult = await helpers.isolateNickname(nickname);
		const time = new Date();
		// Append this interaction to the session history (if needed later for more context)
		sessionHistory.push({
			time: `${time}`,
			msgID: `${currentSessionId}`,
			role: "user",
			name: `${name}`,
			costume: `${costume}`,
			role: "model",
			result: `${cleanResult}`,
		});

		res.status(200).json({nickname});
	} catch (error) {
		console.error("Error generating nickname:", error);
		res.status(500).json(error);
	} finally {
		writeToLog(sessionHistory);
	}
});

module.exports = app;
