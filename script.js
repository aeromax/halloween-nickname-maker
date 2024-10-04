document.getElementById('submit').addEventListener('click', run);
const nicknameResult = document.getElementById("response");
nicknameResult.textContent = "";
const name = document.getElementById("firstName").value;
const costume = document.getElementById("costume").value;
const input = `My name is ${name}, and I'm dressed as a ${costume}.`;


// Make sure to include these imports:
// import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = input;

const result = await model.generateContent(prompt);
console.log(result.response.text());
