var $lqbcr$path = require("path");
var $lqbcr$dotenv = require("dotenv");
var $lqbcr$express = require("express");
var $lqbcr$cors = require("cors");
var $lqbcr$googlegenerativeai = require("@google/generative-ai");
var $lqbcr$uuid = require("uuid");
var $lqbcr$fs = require("fs");

var $f172f24f4cac03dc$exports = {};
// server.js

var $f172f24f4cac03dc$var$$parcel$__dirname = $lqbcr$path.resolve(__dirname, "../src");

$lqbcr$dotenv.config();



var $f172f24f4cac03dc$require$GoogleGenerativeAI = $lqbcr$googlegenerativeai.GoogleGenerativeAI;

var $f172f24f4cac03dc$require$uuidv4 = $lqbcr$uuid.v4;
const $f172f24f4cac03dc$var$app = $lqbcr$express();
const $f172f24f4cac03dc$var$apiKey = process.env.GEMINI_API_KEY;
const $f172f24f4cac03dc$var$genAI = new $f172f24f4cac03dc$require$GoogleGenerativeAI($f172f24f4cac03dc$var$apiKey);

delete undefined[undefined("./userLog.json")];
var $1dea104bb91be807$exports = {};
$1dea104bb91be807$exports = JSON.parse('[{"time":"Mon Oct 14 2024 12:35:41 GMT-0400 (Eastern Daylight Time)","msgID":"363a79bb-6ba9-49fb-b7fd-5766f03e9557","role":"model","name":"Violet","costume":"tinkerbelle","result":"Violet\'s Whisper"},{"time":"Mon Oct 14 2024 12:38:07 GMT-0400 (Eastern Daylight Time)","msgID":"c9d602bd-5d49-4802-8dbd-78f739fbda1d","role":"model","name":"Justin","costume":"Bored dad","result":"Papa-Zoom!"}]');


var $f172f24f4cac03dc$require$sessionHistory = $1dea104bb91be807$exports;
$f172f24f4cac03dc$var$app.use($lqbcr$cors()); // Enable CORS for all origins
$f172f24f4cac03dc$var$app.use($lqbcr$express.json()); // Enable JSON parsing for incoming requests
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
    $lqbcr$fs.writeFile("userLog.json", JSON.stringify(sessionHistory, null, 2), "utf8", (err)=>{
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
$f172f24f4cac03dc$exports = $f172f24f4cac03dc$var$app;


const $4877faf558a81fb7$var$typingForm = document.querySelector(".typing-form");
const $4877faf558a81fb7$var$chatContainer = document.querySelector(".chat-history");
const $4877faf558a81fb7$var$incomingChat = document.querySelector(".chat-list");
const $4877faf558a81fb7$var$deleteChatButton = document.querySelector("#delete-chat-button");
const $4877faf558a81fb7$var$submitButton = document.querySelector("#send-message-button");
const $4877faf558a81fb7$var$nameField = document.querySelector("#nameField");
const $4877faf558a81fb7$var$costumeField = document.querySelector("#costumeField");
let $4877faf558a81fb7$var$firstName;
let $4877faf558a81fb7$var$costume;
let $4877faf558a81fb7$var$sessionHistory = [];
// State variables
let $4877faf558a81fb7$var$isResponseGenerating = false;
// API configuration
const $4877faf558a81fb7$var$API_URL = "http://localhost:3000/generate-nickname";
const $4877faf558a81fb7$var$splitTextByAsterisk = function(phrase) {
    const firstAsteriskIndex = phrase.indexOf("*");
    const lastAsteriskIndex = phrase.lastIndexOf("*");
    // If no asterisks are found, return the whole phrase in the "before" part and an empty "after" part
    if (firstAsteriskIndex === -1 || lastAsteriskIndex === -1) return {
        before: phrase,
        after: ""
    };
    // Get the text before the first asterisk
    const beforeText = phrase.substring(0, firstAsteriskIndex).trim();
    // Get the text after the last asterisk
    const afterText = phrase.substring(lastAsteriskIndex + 1).trim();
    // Return the two parts as an object
    return {
        before: beforeText,
        after: afterText
    };
};
const $4877faf558a81fb7$var$isolateNickname = function(nickname) {
    const match = nickname.match(/\*(.*?)\*/);
    return match ? match[1] : null;
};
const $4877faf558a81fb7$var$deleteEntry = async (entry1)=>{
    try {
        const response = await fetch("http://localhost:3000/log", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                entryID: entry1
            })
        });
        if (!response.ok) throw new Error(err);
        $4877faf558a81fb7$var$loadChatHistory();
    } catch (err1) {
        console.log(err1.stack);
    }
};
// Load chat history from server
const $4877faf558a81fb7$var$loadChatHistory = async ()=>{
    const html = `<div class="message-content">
					<p class="text"></p>
                </div>
				<span class="material-symbols-rounded icon hide">delete</span>`;
    try {
        const response = await fetch("http://localhost:3000/log", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!response.ok) throw new Error("Failed to fetch log data");
        let data = await response.json();
        data = data.sessionHistory;
        for(entry in data){
            $4877faf558a81fb7$var$sessionHistory.push(data[entry]);
            const message = data[entry].result;
            const messageID = data[entry].msgID;
            const div = $4877faf558a81fb7$var$createMessageElement(html);
            div.setAttribute("data-id", messageID);
            div.querySelector(".text").append(message);
            $4877faf558a81fb7$var$chatContainer.prepend(div);
        }
        console.log(`Refreshed log with ${data.length} entries`);
    } catch (error) {
        console.log(error);
    }
};
// Create a new message element and return it
const $4877faf558a81fb7$var$createMessageElement = (content, ...classes)=>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};
// Show typing effect by displaying words one by one
const $4877faf558a81fb7$var$showTypingEffect = (text, textElements, incomingMessageDiv)=>{
    const splitText = $4877faf558a81fb7$var$splitTextByAsterisk(text);
    const textParts = [
        splitText.before.split(" "),
        [
            $4877faf558a81fb7$var$isolateNickname(text)
        ],
        splitText.after.split(" ")
    ];
    for(let i = 0; i < textElements.length; i++){
        const words = textParts[i]; // Use the correct part for each element
        const element = textElements[i];
        let currentWordIndex = 0;
        const typingInterval = setInterval(()=>{
            // Append each word to the text element with a space
            element.innerText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
            // If all words are displayed
            if (currentWordIndex === words.length) {
                clearInterval(typingInterval);
                $4877faf558a81fb7$var$isResponseGenerating = false;
            // Remove loading icon when done
            // incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            }
            $4877faf558a81fb7$var$chatContainer.scrollTo(0, $4877faf558a81fb7$var$chatContainer.scrollHeight); // Scroll to the bottom
        }, 50);
    }
};
// Fetch response from the API based on user message
const $4877faf558a81fb7$var$generateAPIResponse = async (incomingMessageDiv)=>{
    const textElements = incomingMessageDiv.querySelectorAll(".text"); // Getting text element
    try {
        // Send a POST request to the API with the user's message
        const response = await fetch($4877faf558a81fb7$var$API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: $4877faf558a81fb7$var$firstName,
                costume: $4877faf558a81fb7$var$costume
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.err);
        const apiResponse = data.nickname;
        $4877faf558a81fb7$var$showTypingEffect(apiResponse, textElements, incomingMessageDiv); // Show typing effect
        $4877faf558a81fb7$var$chatContainer.innerHTML = " ";
        $4877faf558a81fb7$var$loadChatHistory();
    } catch (err1) {
        // Handle error
        console.log(`Couldn't fetch nickname: ${err1}`);
        $4877faf558a81fb7$var$isResponseGenerating = false;
        textElements[1].innerText = err1;
        textElements[1].parentElement.closest(".message").classList.add("error.message");
    } finally{
        incomingMessageDiv.classList.remove("loading");
    }
};
// Show a loading animation while waiting for the API response
const $4877faf558a81fb7$var$showLoadingAnimation = ()=>{
    const html = `<div class="message-content">
	<p class="text text1"></p>
	<p class="text text3 nickname-bold"></p>
	<p class="text text2"></p>
	<div class="loading-indicator">
		<div class="loading-bar"></div>
		<div class="loading-bar"></div>
		<div class="loading-bar"></div>
	</div>
</div>
`;
    const incomingMessageDiv = $4877faf558a81fb7$var$createMessageElement(html, "incoming", "loading");
    $4877faf558a81fb7$var$incomingChat.appendChild(incomingMessageDiv);
    // chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
    $4877faf558a81fb7$var$generateAPIResponse(incomingMessageDiv);
};
// Handle sending outgoing chat messages
const $4877faf558a81fb7$var$handleOutgoingChat = ()=>{
    $4877faf558a81fb7$var$firstName = $4877faf558a81fb7$var$nameField.value;
    $4877faf558a81fb7$var$costume = $4877faf558a81fb7$var$costumeField.value;
    if (!$4877faf558a81fb7$var$firstName || !$4877faf558a81fb7$var$costume || $4877faf558a81fb7$var$isResponseGenerating) return; // Exit if there is no message or response is generating
    $4877faf558a81fb7$var$isResponseGenerating = true;
    $4877faf558a81fb7$var$typingForm.reset(); // Clear input field
    $4877faf558a81fb7$var$incomingChat.innerHTML = "";
    setTimeout($4877faf558a81fb7$var$showLoadingAnimation, 500); // Show loading animation after a delay
};
// Delete all chats from local storage when button is clicked
$4877faf558a81fb7$var$deleteChatButton.addEventListener("click", ()=>{
    if (confirm("Are you sure you want to delete all the chats?")) $4877faf558a81fb7$var$deleteEntry();
});
// chatContainer.addEventListener("click", e => {
// 	let elements = chatContainer.querySelectorAll(".message");
// 	elements.forEach(item => {
// 		item.addEventListener("click", function (e) {
// 			const dataID = this.getAttribute("data-id");
// 			deleteEntry(dataID);
// 		});
// 	});
// });
// Prevent default form submission and handle outgoing chat
$4877faf558a81fb7$var$typingForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    $4877faf558a81fb7$var$handleOutgoingChat();
});
$4877faf558a81fb7$var$loadChatHistory();


//# sourceMappingURL=script.js.map
