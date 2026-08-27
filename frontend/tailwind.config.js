// tailwind.config.js
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	// Importante: No v3 o prefixo é exatamente assim
	prefix: "tw-",
	corePlugins: {
		preflight: false, // Mantém o Bootstrap sem alterações
	},
	theme: {
		extend: {
			keyframes: {
				"technical-details-overlay-fade": {
					from: { opacity: "0" },
					to: { opacity: "1" },
				},
				"technical-details-enter": {
					from: {
						opacity: "0",
						transform: "scale(0.94) translateY(12px)",
					},
					to: {
						opacity: "1",
						transform: "scale(1) translateY(0)",
					},
				},
				"technical-details-pulse": {
					to: { backgroundPosition: "-200% 0" },
				},
			},
			animation: {
				"technical-overlay-fade":
					"technical-details-overlay-fade 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
				"technical-enter":
					"technical-details-enter 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
				"technical-pulse": "technical-details-pulse 1.4s ease infinite",
			},
		},
	},
	plugins: [],
};

