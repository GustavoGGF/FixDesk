import React, { useState } from "react";
import { createContext } from "react";

export const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const [ticketData, setTicketData] = useState([]);

  const [countTicket, setCountTicket] = useState(0);

  const [loadingDash, setLoadingDash] = useState(false);
  const [message, setMessage] = useState(false);
  const [btnMore, setBtnMore] = useState(true);

  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [cardOrlist, setCardOrList] = useState("");

  return (
    <TicketContext.Provider
      value={{
        ticketData,
        setTicketData,
        countTicket,
        setCountTicket,
        loadingDash,
        setLoadingDash,
        message,
        setMessage,
        typeError,
        setTypeError,
        btnMore,
        setBtnMore,
        messageError,
        setMessageError,
        cardOrlist,
        setCardOrList,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
