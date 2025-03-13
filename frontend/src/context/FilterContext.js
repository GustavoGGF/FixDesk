import React, { createContext, useState } from "react";

// Cria o contexto
export const FilterContext = createContext();

// Cria o provedor de contexto
export const FilterProvider = ({ children }) => {
  // Define variáveis de estado
  const [ticketData, setTicketData] = useState([]);
  return <FilterContext.Provider value={{ ticketData, setTicketData }}>{children}</FilterContext.Provider>;
};
