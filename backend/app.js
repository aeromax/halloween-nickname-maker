// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {GoogleGenerativeAI} = require("@google/generative-ai");
const {v4: uuidv4} = require("uuid");
const app = express();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const port = process.env.PORT || 10000;
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

// Endpoint to serve page
app.get("/", (req, res) => {
	const html = `<!DOCTYPE html>
<!-- Coding By CodingNepal - www.codingnepalweb.com -->
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Zombiebrook Halloween Nickname Generator</title>
		<!-- Linking Google Fonts For Icons -->
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0" />
		<link rel="stylesheet" href="./css/style.css" />
	</head>
	<body>
		<div class="wrapper">
			<header class="header">
				<img src="./img/zombiebrook.png" alt="" />
				<h1 class="title">Nickname Generator!</h1>
			</header>
			<div class="chat-list"></div>
			<div class="typing-area">
				<form action="#" class="typing-form">
					<div class="input-wrapper">
						<input id="nameField" type="text" placeholder="What's your first name?" class="typing-input" required />
					</div>
					<div class="input-wrapper">
						<input id="costumeField" type="text" placeholder="What kind of costume are you wearing?" class="typing-input" required />
					</div>
					<button id="send-message-button" class="icon">Generate my nickname!</button>
				</form>
			</div>
			<div class="chat-history"></div>
			<div class="action-buttons">
				<span id="delete-chat-button" class="icon material-symbols-rounded">delete</span>
			</div>
		</div>
		<script src="./js/script.js"></script>
	</body>
</html>
`;
	res.type("html").send(html);
});
// app.get("/", function (req, res) {
// 	res.sendFile(__dirname + "../main.html");
// });

const isolateNickname = function (nickname) {
	const match = nickname.match(/\*(.*?)\*/);
	return match ? match[1] : null;
};

const model = genAI.getGenerativeModel({
	model: "gemini-1.5-flash-8b",
	systemInstruction: 'Respond with a creative, spooky, halloween-themed nickname that utilizes their first name and is topical based on the costume they are wearing. Make sure you respond in a fun, lighthearted way The responses should emphasize creativity and fun while being respectful and appropriate for all audiences. Avoid any references to violence, gore, death, or inappropriate language. The nicknames should remain lighthearted friendly. Avoid repetetiveness, and be poetic. Introduce the nickname with a brief phrase welcoming them to Zombie brook, for instance: /"Welcome to Zombiebrook, [nickname]!/". Here is some data for inspiration: https://namesbudy.com/alias-names/halloween-nicknames/ and https://creativenomenclature.com/nicknames/spooky-nicknames/ Make the nickname revealed at the last part of the response, not in the middle. I don\'t want any language after the nickname. When you return the result, you must wrap the nickname itself in an asterix so I can isolate it. If the user inputs a response that is rude, uses offense language, is inappropriate or sexually explicity, do not generate a nickname and provide a one sentence explanation as to why why you chose not to accept their input. ',
});

const generationConfig = {
	temperature: 1.2,
	topP: 0.9,
	topK: 41,
	maxOutputTokens: 200,
	responseMimeType: "text/plain",
};

const writeToLog = sessionHistory => {
	fs.writeFile("userLog.json", JSON.stringify(sessionHistory, null, 2), "utf8", err => {
		if (err) {
			console.error("Error writing to userLog.json:", err);
			return err; // Handle error appropriately (e.g., logging it or notifying the user)
		}
	});
};

app.delete("/log", async function (req, res) {
	sessionHistory = [];
	try {
		await writeToLog(sessionHistory);
		res.status(200).json({message: `Chat history deleted`});
	} catch (err) {
		console.log(err);
		res.status(500).json({err});
	}
});

// GET endpoint to get log history
app.get("/log", async (req, res) => {
	try {
		res.status(200).json({sessionHistory});
	} catch (err) {
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
		const cleanResult = await isolateNickname(nickname);
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
		writeToLog(sessionHistory);
	} catch (err) {
		console.log(err);
		res.status(500).json({err});
	}
});

module.exports = app;
