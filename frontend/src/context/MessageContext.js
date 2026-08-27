import { createContext, useRef, useState } from "react";

// Cria o contexto
export const MessageContext = createContext();

// Cria o provedor de contexto
export const MessageProvider = ({ children }) => {
	// Variáveis de Referência String
	const typeError = useRef("");
	const messageError = useRef("");

	const [message, setMessage] = useState(false);
	return (
		<MessageContext.Provider
			value={{ typeError, messageError, message, setMessage }}
		>
			{children}
		</MessageContext.Provider>
	);
};
