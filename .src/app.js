var $g7Wyq$path = require("path");
var $g7Wyq$dotenv = require("dotenv");
var $g7Wyq$express = require("express");
var $g7Wyq$cors = require("cors");
var $g7Wyq$googlegenerativeai = require("@google/generative-ai");
var $g7Wyq$uuid = require("uuid");
var $g7Wyq$fs = require("fs");

// server.js

var $f172f24f4cac03dc$var$$parcel$__dirname = $g7Wyq$path.resolve(__dirname, "../src");

$g7Wyq$dotenv.config();



var $f172f24f4cac03dc$require$GoogleGenerativeAI = $g7Wyq$googlegenerativeai.GoogleGenerativeAI;

var $f172f24f4cac03dc$require$uuidv4 = $g7Wyq$uuid.v4;
const $f172f24f4cac03dc$var$app = $g7Wyq$express();
const $f172f24f4cac03dc$var$apiKey = process.env.GEMINI_API_KEY;
const $f172f24f4cac03dc$var$genAI = new $f172f24f4cac03dc$require$GoogleGenerativeAI($f172f24f4cac03dc$var$apiKey);

delete undefined[undefined("./userLog.json")];
var $1dea104bb91be807$exports = {};
$1dea104bb91be807$exports = JSON.parse('[{"time":"Mon Oct 14 2024 12:35:41 GMT-0400 (Eastern Daylight Time)","msgID":"363a79bb-6ba9-49fb-b7fd-5766f03e9557","role":"model","name":"Violet","costume":"tinkerbelle","result":"Violet\'s Whisper"},{"time":"Mon Oct 14 2024 12:38:07 GMT-0400 (Eastern Daylight Time)","msgID":"c9d602bd-5d49-4802-8dbd-78f739fbda1d","role":"model","name":"Justin","costume":"Bored dad","result":"Papa-Zoom!"}]');


var $f172f24f4cac03dc$require$sessionHistory = $1dea104bb91be807$exports;
$f172f24f4cac03dc$var$app.use($g7Wyq$cors()); // Enable CORS for all origins
$f172f24f4cac03dc$var$app.use($g7Wyq$express.json()); // Enable JSON parsing for incoming requests
// Endpoint to serve page
$f172f24f4cac03dc$var$app.get("/", function(req, res) {
    res.sendFile($f172f24f4cac03dc$var$$parcel$__dirname + "../index.html");
});
const $f172f24f4cac03dc$var$isolateNickname = function(nickname) {
    const match = nickname.match(/\*(.*?)\*/);
    return match ? match[1] : null;
};
const $f172f24f4cac03dc$var$model = $f172f24f4cac03dc$var$genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction: 'Respond with a creative, spooky, halloween-themed nickname that utilizes their first name and is topical based on the costume they are wearing. Make sure you respond in a fun, lighthearted way The responses should emphasize creativity and fun while being respectful and appropriate for all audiences. Avoid any references to violence, gore, death, or inappropriate language. The nicknames should remain lighthearted friendly. Avoid repetetiveness, and be poetic. Introduce the nickname with a brief phrase welcoming them to Zombie brook, for instance: /"Welcome to Zombiebrook, [nickname]!/". Here is some data for inspiration: https://namesbudy.com/alias-names/halloween-nicknames/ and https://creativenomenclature.com/nicknames/spooky-nicknames/ Make the nickname revealed at the last part of the response, not in the middle. I don\'t want any language after the nickname. When you return the result, you must wrap the nickname itself in an asterix so I can isolate it. If the user inputs a response that is rude, uses offense language, is inappropriate or sexually explicity, do not generate a nickname and provide a one sentence explanation as to why why you chose not to accept their input. '
});
const $f172f24f4cac03dc$var$generationConfig = {
    temperature: 1.2,
    topP: 0.9,
    topK: 41,
    maxOutputTokens: 200,
    responseMimeType: "text/plain"
};
const $f172f24f4cac03dc$var$writeToLog = (sessionHistory)=>{
    $g7Wyq$fs.writeFile("userLog.json", JSON.stringify(sessionHistory, null, 2), "utf8", (err)=>{
        if (err) {
            console.error("Error writing to userLog.json:", err);
            return err; // Handle error appropriately (e.g., logging it or notifying the user)
        }
    });
};
$f172f24f4cac03dc$var$app.delete("/log", async function(req, res) {
    // const entry = req.body.entryID;
    // let matchedEntry = sessionHistory.find(obj => obj.msgID == entry || {});
    // console.log(matchedEntry);
    $f172f24f4cac03dc$require$sessionHistory = [];
    try {
        await $f172f24f4cac03dc$var$writeToLog($f172f24f4cac03dc$require$sessionHistory);
        res.status(200).json({
            message: `Chat history deleted`
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
});
// GET endpoint to get log history
$f172f24f4cac03dc$var$app.get("/log", async (req, res)=>{
    try {
        res.status(200).json({
            sessionHistory: $f172f24f4cac03dc$require$sessionHistory
        });
    } catch (err) {
        res.status(500).json({
            error: "Could not fetch log"
        });
    }
});
// POST endpoint to generate nickname
$f172f24f4cac03dc$var$app.post("/generate-nickname", async (req, res)=>{
    // Destructure `name` and `costume` from the request body (assuming client sends in contents)
    const { name: name, costume: costume } = req.body;
    const promptString = `My name is ${name} and I am dressed as ${costume}.`;
    try {
        // Create a unique session ID
        let currentSessionId = $f172f24f4cac03dc$require$uuidv4();
        const result = await $f172f24f4cac03dc$var$model.generateContent(promptString, {
            generationConfig: $f172f24f4cac03dc$var$generationConfig,
            history: $f172f24f4cac03dc$require$sessionHistory[currentSessionId]
        });
        const nickname = await result.response.text();
        const cleanResult = await $f172f24f4cac03dc$var$isolateNickname(nickname);
        const time = new Date();
        // Append this interaction to the session history (if needed later for more context)
        $f172f24f4cac03dc$require$sessionHistory.push({
            time: `${time}`,
            msgID: `${currentSessionId}`,
            role: "user",
            name: `${name}`,
            costume: `${costume}`,
            role: "model",
            result: `${cleanResult}`
        });
        res.status(200).json({
            nickname: nickname
        });
        $f172f24f4cac03dc$var$writeToLog($f172f24f4cac03dc$require$sessionHistory);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            err: err
        });
    }
});
module.exports = $f172f24f4cac03dc$var$app;


//# sourceMappingURL=app.js.map
