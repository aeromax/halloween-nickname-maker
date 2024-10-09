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

export {splitTextByAsterisk, isolateNickname};
