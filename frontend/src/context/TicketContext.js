import React, { createContext, useState } from "react";

// Cria o contexto
export const TicketContext = createContext();

// Cria o provedor de contexto
export const TicketProvider = ({ children }) => {
  // Define variáveis de estado
  const [loadingDash, setLoadingDash] = useState(false);

  const [ticketData, setTicketData] = useState([]);

  return (
    <TicketContext.Provider
      value={{
        ticketData,
        setTicketData,
        loadingDash,
        setLoadingDash,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
