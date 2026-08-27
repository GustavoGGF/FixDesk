export const handleDownload = (url, filename) => {
	if (!url) return;

	// Validate URL to prevent XSS (CWE-79)
	try {
		const parsedUrl = new URL(url, window.location.origin);
		// Only allow http, https, blob, and data protocols
		if (!["http:", "https:", "blob:", "data:"].includes(parsedUrl.protocol)) {
			console.error("Invalid URL protocol for download");
			return;
		}
	} catch (error) {
		console.error("Invalid URL provided for download", error);
		return;
	}

	const a = document.createElement("a");
	a.href = url;
	a.download = filename || "download";
	a.click();
};
