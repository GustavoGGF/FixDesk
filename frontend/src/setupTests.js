const originalError = console.error;
console.error = (...args) => {
	if (
		typeof args[0] === "string" &&
		args[0].includes("`ReactDOMTestUtils.act` is deprecated")
	) {
		return;
	}
	originalError(...args);
};
