import React, { createContext, useState } from "react";

// Cria o contexto
export const TicketContext = createContext();

// Cria o provedor de contexto
export const TicketProvider = ({ children }) => {
  // Define variáveis de estado
  const [loadingDash, setLoadingDash] = useState(false);
  const [ticketWindowAtt, setTicketWindowAtt] = useState(false);
  const [reloadFilter, setReloadFilter] = useState(false);
  const [forcedLoad, setForcedLoad] = useState(false);
  const [filterHistory, setFilterHistory] = useState(false);

  const [changeTech, setChangeTech] = useState("");
  const [cardOrList, setCardOrList] = useState("");

  const [ticketData, setTicketData] = useState([]);

  const [totalTickets, setTotalTickets] = useState(0);

  return (
    <TicketContext.Provider
      value={{
        ticketData,
        setTicketData,
        loadingDash,
        setLoadingDash,
        ticketWindowAtt,
        setTicketWindowAtt,
        changeTech,
        setChangeTech,
        cardOrList,
        setCardOrList,
        totalTickets,
        setTotalTickets,
        reloadFilter,
        setReloadFilter,
        forcedLoad,
        setForcedLoad,
        filterHistory,
        setFilterHistory,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
