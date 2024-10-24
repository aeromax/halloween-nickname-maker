const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-history");
const incomingChat = document.querySelector(".chat-list");
const deleteChatButton = document.querySelector(".ghost");
const submitButton = document.querySelector("#send-message-button");
const nameField = document.querySelector("#nameField");
const costumeField = document.querySelector("#costumeField");
const mouth = document.querySelector(".mouth");
const ghostLineDiv = document.querySelector(".ghost-line");
let firstName;
let costume;
let sessionHistory = [];
// State variables
let isResponseGenerating = false;

// API configuration

const API_URL = "..";

const splitTextByAsterisk = function (phrase) {
	const firstAsteriskIndex = phrase.indexOf("*");
	const lastAsteriskIndex = phrase.lastIndexOf("*");
	// If no asterisks are found, return the whole phrase in the "before" part and an empty "after" part
	if (firstAsteriskIndex === -1 || lastAsteriskIndex === -1) {
		return {
			before: phrase,
			after: "",
		};
	}
	// Get the text before the first asterisk
	const beforeText = phrase.substring(0, firstAsteriskIndex).trim();
	// Get the text after the last asterisk
	// const afterText = phrase.substring(lastAsteriskIndex + 1).trim();
	// Return the two parts as an object
	return {
		before: beforeText,
		// after: afterText + "!",
	};
};
const isolateNickname = function (nickname) {
	const match = nickname.match(/\*(.*?)\*/);
	return match ? match[1] : null;
};
const deleteEntry = async entry => {
	try {
		const response = await fetch(API_URL + "/log", {
			method: "DELETE",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({
				entryID: entry,
			}),
		});
		if (!response.ok) {
			throw new Error(error);
		}
		loadChatHistory();
	} catch (error) {
		console.log(error.stack);
	} finally {
		chatContainer.innerHTML = "";
	}
};

// Load chat history from server
const loadChatHistory = async () => {
	const html = `<div class="message-content">
					<p class="text"></p>
                </div>`;
	try {
		const response = await fetch(API_URL + "/log", {
			method: "GET",
			headers: {"Content-Type": "application/json"},
		});
		if (!response.ok) throw new Error("Failed to fetch log data");
		let data = await response.json();
		data = data.sessionHistory;
		for (entry in data) {
			sessionHistory.push(data[entry]);
			const message = data[entry].model.result;
			const messageID = data[entry].msgID;
			const div = createMessageElement(html);
			div.setAttribute("data-id", messageID);
			div.querySelector(".text").append(message);
			chatContainer.prepend(div);
		}
		console.log(`Refreshed log with ${data.length || 0} entries`);
	} catch (error) {
		console.log(error);
	}
};
// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
	const div = document.createElement("div");
	div.classList.add("message", ...classes);
	div.innerHTML = content;
	return div;
};

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElements, incomingMessageDiv) => {
	ghostLineDiv.classList.remove("hidden");
	const splitText = splitTextByAsterisk(text);
	const textParts = [splitText.before.split(" "), [isolateNickname(text)]];
	for (let i = 0; i < textElements.length; i++) {
		const words = textParts[i] || ""; // Use the correct part for each element
		const element = textElements[i];
		let currentWordIndex = 0;
		const typingInterval = setInterval(() => {
			// Append each word to the text element with a space
			element.innerText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
			// If all words are displayed
			if (currentWordIndex === words.length) {
				clearInterval(typingInterval);
				isResponseGenerating = false;
			}

			// chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
		}, 75);
		setTimeout(() => {
			const nicknameDiv = document.querySelector(".text3");
			if (nicknameDiv.textContent === "null") {
				return;
			}
			ghostLineDiv.classList.add("hidden");
			nicknameDiv.classList.remove("hidden");
		}, 2000);
	}
	loadChatHistory();
};

// Fetch response from the API based on user message
const generateAPIResponse = async incomingMessageDiv => {
	const textElements = incomingMessageDiv.querySelectorAll(".text"); // Getting text element
	try {
		// Send a POST request to the API with the user's message
		const response = await fetch(API_URL + "/generate-nickname", {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({
				name: firstName,
				costume: costume,
			}),
		});
		const data = await response.json();
		if (!response.ok) throw new Error(data.error);
		console.log(data);
		const apiResponse = data.nickname;
		showTypingEffect(apiResponse, textElements, incomingMessageDiv); // Show typing effect
		chatContainer.innerHTML = " ";
	} catch (error) {
		// Handle error
		isResponseGenerating = false;
		textElements[0].innerText = error;
		textElements[0].classList.add("error", "message");
	} finally {
		incomingMessageDiv.classList.remove("loading");
	}
};

// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
	const html = `<div class="message-content">
	<p class="text text1"></p>
	<p class="text text3 hidden"></p>
	</div>
	<div class="loading-indicator">
		<div class="loading-bar"></div>
		<div class="loading-bar"></div>
		<div class="loading-bar"></div>
	</div>
`;

	const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
	incomingChat.appendChild(incomingMessageDiv);
	// chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
	generateAPIResponse(incomingMessageDiv);
};

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
	firstName = nameField.value;
	costume = costumeField.value;

	if (!firstName || !costume || isResponseGenerating) return; // Exit if there is no message or response is generating

	isResponseGenerating = true;

	typingForm.reset(); // Clear input field
	incomingChat.innerHTML = "";
	setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
};

// Delete all chats from local storage when button is clicked
deleteChatButton.addEventListener("click", () => {
	if (confirm("Are you sure you want to delete all the chats?")) {
		deleteEntry();
	}
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
typingForm.addEventListener("submit", e => {
	e.preventDefault();
	handleOutgoingChat();
});

loadChatHistory();

// const mouthClose = () => {
// 	let random = Math.floor(Math.random() * 300);
// 	mouth.classList.remove("open");
// 	setInterval(random => {
// 		mouthOpen(random);
// 	}, random);
// };
// const mouthOpen = function (stop) {
// 	let random = Math.floor(Math.random() * 300);
// 	mouth.classList.add("open");

// 	const timer = setInterval(stop => {
// 		mouthClose();
// 		if (stop) {
// 			clearInterval(timer);
// 		}
// 	}, random);
// };
