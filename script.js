const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const deleteChatButton = document.querySelector("#delete-chat-button");

// State variables
let userMessage = null;
let isResponseGenerating = false;

// API configuration

const API_URL = 'http://127.0.0.1:3000/generate';

// Load theme and chat data from local storage on page load
const loadDataFromLocalstorage = () => {
	const savedChats = localStorage.getItem("saved-chats");

	// Restore saved chats or clear the chat container
	chatContainer.innerHTML = savedChats || "";
	document.body.classList.toggle("hide-header", savedChats);

	chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
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
				contents: [
					{
						role: "user",
						parts: [{text: userMessage}],
					},
				],
			}),
		});

		const data = await response.json();
		if (!response.ok) throw new Error(data.error.message);

		// Get the API response text and remove asterisks from it
		const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
		showTypingEffect(apiResponse, textElement, incomingMessageDiv); // Show typing effect
	} catch (error) {
		// Handle error
		isResponseGenerating = false;
		textElement.innerText = error.message;
		textElement.parentElement.closest(".message").classList.add("error");
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

// Copy message text to the clipboard

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
	const nameField = document.querySelector("#nameField").value;
	const costumeField = document.querySelector("#costumeField").value;
	console.log(nameField, costumeField);

	userMessage = "My name is " + nameField.trim() + " and I am dressed as " + costumeField.trim() + ". " || userMessage;
	if (!userMessage || isResponseGenerating) return; // Exit if there is no message or response is generating

	isResponseGenerating = true;

	const html = `<div class="message-content">
                  <p class="text"></p>
                </div>`;

	const outgoingMessageDiv = createMessageElement(html, "outgoing");
	// outgoingMessageDiv.querySelector(".text").innerText = userMessage;
	chatContainer.appendChild(outgoingMessageDiv);

	typingForm.reset(); // Clear input field
	document.body.classList.add("hide-header");
	chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
	setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
};

// Delete all chats from local storage when button is clicked
deleteChatButton.addEventListener("click", () => {
	if (confirm("Are you sure you want to delete all the chats?")) {
		localStorage.removeItem("saved-chats");
		loadDataFromLocalstorage();
	}
});

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", e => {
	e.preventDefault();
	handleOutgoingChat();
});

loadDataFromLocalstorage();
