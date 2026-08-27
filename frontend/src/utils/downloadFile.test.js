import { handleDownload } from "./downloadFile";

describe("handleDownload", () => {
	let createElementSpy;

	beforeEach(() => {
		// Mock DOM elements and methods
		// We need to provide a mock click method to the created element
		const mockAnchor = {
			click: jest.fn(),
			href: "",
			download: "",
		};
		createElementSpy = jest
			.spyOn(document, "createElement")
			.mockReturnValue(mockAnchor);

		jest.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("should create an anchor element, set properties, and click it", () => {
		const url = "http://example.com/file.pdf";
		const filename = "test.pdf";

		handleDownload(url, filename);

		expect(createElementSpy).toHaveBeenCalledWith("a");

		// Check if properties were set on the created element
		const createdAnchor = createElementSpy.mock.results[0].value;
		expect(createdAnchor.href).toBe(url);
		expect(createdAnchor.download).toBe(filename);

		expect(createdAnchor.click).toHaveBeenCalled();
	});

	it("should handle blob URLs", () => {
		const url = "blob:http://localhost:3000/1234-5678";
		const filename = "blob-file.txt";

		handleDownload(url, filename);

		const createdAnchor = createElementSpy.mock.results[0].value;
		expect(createdAnchor.href).toBe(url);
		expect(createdAnchor.click).toHaveBeenCalled();
	});

	it("should handle data URLs", () => {
		const url = "data:text/plain;base64,SGVsbG8gV29ybGQ=";
		const filename = "data-file.txt";

		handleDownload(url, filename);

		const createdAnchor = createElementSpy.mock.results[0].value;
		expect(createdAnchor.href).toBe(url);
		expect(createdAnchor.click).toHaveBeenCalled();
	});

	it("should reject javascript URLs to prevent XSS (CWE-79)", () => {
		const url = 'javascript:alert("XSS")';

		handleDownload(url, "xss.html");

		expect(console.error).toHaveBeenCalledWith(
			"Invalid URL protocol for download",
		);
		expect(createElementSpy).not.toHaveBeenCalled();
	});

	it("should use default filename if not provided", () => {
		const url = "http://example.com/file";

		handleDownload(url);

		const createdAnchor = createElementSpy.mock.results[0].value;
		expect(createdAnchor.download).toBe("download");
	});

	it("should do nothing if URL is empty", () => {
		handleDownload("", "file.txt");
		expect(createElementSpy).not.toHaveBeenCalled();
	});
});
