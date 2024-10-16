// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const {v4: uuidv4} = require("uuid");
const app = express();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const port = process.env.PORT || 8080;
app.keepAliveTimeout = 120 * 1000;
app.headersTimeout = 120 * 1000;
app.listen(port, () => console.log(`App listening on port ${port}!`));

//Writing to server storage
let fs = require("fs");
delete require.cache[require.resolve("./userLog.json")];
let sessionHistory = require("./userLog.json");

// delete require.cache[require.resolve("./userLog.json")];
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Enable JSON parsing for incoming requests
console.log(__dirname);
app.use(express.static(__dirname + "/static"));
app.get("/", function (req, res) {
	res.sendFile(__dirname + "/index.html");
});

const isolateNickname = function (nickname) {
	const match = nickname.match(/\*(.*?)\*/);
	return match ? match[1] : null;
};

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash-8b",
	systemInstruction: "Respond with a creative, spooky, halloween-themed nickname that utilizes their first name and is topical based on the costume they are wearing. The responses should emphasize creativity and fun while being respectful and appropriate for all audiences. Try and respond in a fantastical vernacular, like Shakespearean english, pirate slang, or perhaps a fantasty character like from Lord of the Rings. Avoid any references to violence, gore, death, or inappropriate language. Terms having to do with slime, fur, fangs, scary animals, mummies, bats, vampires, ghosts, werewolves, shadows, witches, potion, smoke, are acceptable. The nicknames should remain lighthearted friendly. Avoid repetetiveness, and be poetic. Here is some data for inspiration: https://namesbudy.com/alias-names/halloween-nicknames/ and https://creativenomenclature.com/nicknames/spooky-nicknames/. Limit entire response to two sentences. Make the nickname revealed at the last part of the response, not in the middle. I don't want any language after the nickname. The nickname MUST be wrapped in asterisks.",
});

const generationConfig = {
	temperature: 1.4,
	topP: 1,
	topK: 41,
	maxOutputTokens: 50,
	responseMimeType: "text/plain",
};

const bannedWordList = require("./banned-words.json");
// Function to check if inut string contains any banned words
function bannedWord(inputString, bannedWordList) {
	// Check if any banned word is in the input string
	let match = bannedWordList.filter(word => inputString.toLowerCase().includes(word.toLowerCase()));
	return bannedWordList.some(word => inputString.toLowerCase().includes(word.toLowerCase()));
}

const writeToLog = sessionHistory => {
	fs.writeFile("userLog.json", JSON.stringify(sessionHistory, null, 2), "utf8", error => {
		if (error) {
			console.error("Error writing to userLog.json:", error);
			return error; // Handle error appropriately (e.g., logging it or notifying the user)
		}
	});
};

app.delete("/log", async function (req, res) {
	sessionHistory = [];
	try {
		await writeToLog(sessionHistory);
		res.status(200).json({message: `Chat history deleted`});
	} catch (error) {
		console.log(error);
		res.status(500).json({error});
	}
});

// GET endpoint to get log history
app.get("/log", async (req, res) => {
	try {
		res.status(200).json({sessionHistory});
	} catch (error) {
		res.status(500).json({error: error.message});
	}
});
// POST endpoint to generate nickname
app.post("/generate-nickname", async (req, res) => {
	// Destructure `name` and `costume` from the request body (assuming client sends in contents)
	const {name, costume} = req.body;
	let promptString = `My name is ${name} and I am dressed as ${costume}.`;
	try {
		const checkWords = await bannedWord(promptString, bannedWordList);
		if (checkWords) {
			// throw new Error("Sorry, I can't really work with that.");
			promptString = "Generate one sentence admonishing someone for using offensive language.";
		}
		// Create a unique session ID
		let currentSessionId = uuidv4();
		const result = await model.generateContent(promptString, {
			generationConfig,
			history: sessionHistory[currentSessionId],
		});
		const nickname = await result.response.text();
		const cleanResult = await isolateNickname(nickname);
		const time = new Date();
		// Append this interaction to the session history (if needed later for more context)
		sessionHistory.push({
			time: `${time}`,
			msgID: `${currentSessionId}`,
			user: {
				costume: `${costume}`,
				name: `${name}`,
			},
			model: {
				result: `${cleanResult}`,
			},
		});

		res.status(200).json({nickname});
		writeToLog(sessionHistory);
	} catch (error) {
		console.log(error);
		res.status(500).json({error: error.message});
	}
});

module.exports = app;
