import React, { createContext, useState } from "react";

// Cria o contexto
export const MessageContext = createContext();

// Cria o provedor de contexto
export const MessageProvider = ({ children }) => {
  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");

  const [message, setMessage] = useState(false);
  return <MessageContext.Provider value={{ typeError, setTypeError, messageError, setMessageError, message, setMessage }}>{children}</MessageContext.Provider>;
};
