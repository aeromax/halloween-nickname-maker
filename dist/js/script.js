const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-history");
const incomingChat = document.querySelector(".chat-list");
const deleteChatButton = document.querySelector("#delete-chat-button");
const submitButton = document.querySelector("#send-message-button");
const nameField = document.querySelector("#nameField");
const costumeField = document.querySelector("#costumeField");
let firstName;
let costume;
let sessionHistory = [];
// State variables
let isResponseGenerating = false;

// API configuration

// const API_URL = "localhost:3000";

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
	const afterText = phrase.substring(lastAsteriskIndex + 1).trim();
	// Return the two parts as an object
	return {
		before: beforeText,
		after: afterText,
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
			throw new Error(err);
		}
		loadChatHistory();
	} catch (err) {
		console.log(err.stack);
	}
};

// Load chat history from server
const loadChatHistory = async () => {
	const html = `<div class="message-content">
					<p class="text"></p>
                </div>
				<span class="material-symbols-rounded icon hide">delete</span>`;
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
			const message = data[entry].result;
			const messageID = data[entry].msgID;
			const div = createMessageElement(html);
			div.setAttribute("data-id", messageID);
			div.querySelector(".text").append(message);
			chatContainer.prepend(div);
		}
		console.log(`Refreshed log with ${data.length} entries`);
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
	const splitText = splitTextByAsterisk(text);
	const textParts = [splitText.before.split(" "), [isolateNickname(text)], splitText.after.split(" ")];
	for (let i = 0; i < textElements.length; i++) {
		const words = textParts[i]; // Use the correct part for each element
		const element = textElements[i];
		let currentWordIndex = 0;

		const typingInterval = setInterval(() => {
			// Append each word to the text element with a space
			element.innerText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];

			// If all words are displayed
			if (currentWordIndex === words.length) {
				clearInterval(typingInterval);
				isResponseGenerating = false;
				// Remove loading icon when done
				// incomingMessageDiv.querySelector(".icon").classList.remove("hide");
			}

			chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
		}, 50);
	}
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
		if (!response.ok) throw new Error(data.err);
		const apiResponse = data.nickname;
		showTypingEffect(apiResponse, textElements, incomingMessageDiv); // Show typing effect
		chatContainer.innerHTML = " ";
		loadChatHistory();
	} catch (err) {
		// Handle error
		console.log(`Couldn't fetch nickname: ${err}`);
		isResponseGenerating = false;
		textElements[1].innerText = err;
		textElements[1].parentElement.closest(".message").classList.add("error.message");
	} finally {
		incomingMessageDiv.classList.remove("loading");
	}
};

// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
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
