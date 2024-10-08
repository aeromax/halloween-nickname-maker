const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const deleteChatButton = document.querySelector("#delete-chat-button");

const nameField = document.querySelector("#nameField");
const costumeField = document.querySelector("#costumeField");
let firstName;
let costume;

// State variables
let userMessage = new Object();
let isResponseGenerating = false;

// API configuration

const API_URL = "http://localhost:3000/generate-nickname";

// Load chat history from server
const loadChatHistory = async () => {
	try {
		const response = await fetch("http://localhost:3000/log", {
			method: "GET",
			headers: {"Content-Type": "application/json"},
		});
		if (!response.ok) throw new Error("Failed to fetch log data");
		const logData = await response.json();
		const entries = logData.sessionHistory;
		const html = `<div class="message-content">
		<p class="text"></p>
                </div>`;
		if (entries.length > 0) {
			for (const entry of entries) {
				const message = entries[entry][1].parts[0].result;
				const div = createMessageElement(html);
				div.querySelector(".text").append(message);
				chatContainer.appendChild(div);
			}
		}
		if (!response.ok) throw new Error(data.error);
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
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
	const words = text.split(" ");
	let currentWordIndex = 0;

	const typingInterval = setInterval(() => {
		// Append each word to the text element with a space
		textElement.innerText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex++];
		incomingMessageDiv.querySelector(".icon").classList.add("hide");

		// If all words are displayed
		if (currentWordIndex === words.length) {
			clearInterval(typingInterval);
			isResponseGenerating = false;
			incomingMessageDiv.querySelector(".icon").classList.remove("hide");
			localStorage.setItem("saved-chats", chatContainer.innerHTML); // Save chats to local storage
		}
		chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
	}, 75);
};

// Fetch response from the API based on user message
const generateAPIResponse = async incomingMessageDiv => {
	const textElement = incomingMessageDiv.querySelector(".text"); // Getting text element

	try {
		// Send a POST request to the API with the user's message
		const response = await fetch(API_URL, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({
				name: firstName,
				costume: costume,
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to fetch nickname.");
		}
		const data = await response.json();

		if (!response.ok) throw new Error(data.error.message);
		loadChatHistory();
		// Get the API response text and remove asterisks from it
		// const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
		const apiResponse = data.nickname;
		console.log(data.nickname);
		showTypingEffect(apiResponse, textElement, incomingMessageDiv); // Show typing effect
	} catch (error) {
		// Handle error
		isResponseGenerating = false;
		textElement.innerText = error;
		console.log(error.message);
		textElement.parentElement.closest(".message").classList.add("error.message");
	} finally {
		incomingMessageDiv.classList.remove("loading");
	}
};

// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
	const html = `<div class="message-content">
                  
                  <p class="text"></p>
                  <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                  </div>
                </div>
                <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

	const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
	chatContainer.appendChild(incomingMessageDiv);

	chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
	generateAPIResponse(incomingMessageDiv);
};

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
	firstName = nameField.value;
	costume = costumeField.value;

	if (!firstName || !costume || isResponseGenerating) return; // Exit if there is no message or response is generating

	isResponseGenerating = true;

	const html = `<div class="message-content">
                  <p class="text"></p>
                </div>`;

	typingForm.reset(); // Clear input field
	// document.body.classList.add("hide-header");
	chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
	setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
};

// Delete all chats from local storage when button is clicked
deleteChatButton.addEventListener("click", () => {
	if (confirm("Are you sure you want to delete all the chats?")) {
		localStorage.removeItem("saved-chats");
		loadChatHistory();
	}
});

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", e => {
	e.preventDefault();
	handleOutgoingChat();
});

loadChatHistory();
