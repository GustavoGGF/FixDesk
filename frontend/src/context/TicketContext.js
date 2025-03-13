import React, { createContext, useState } from "react";

// Cria o contexto
export const TicketContext = createContext();

// Cria o provedor de contexto
export const TicketProvider = ({ children }) => {
  // Define variáveis de estado
  const [messagetitle, setMessagetitle] = useState("");
  const [sector, setSector] = useState("");
  const [occurrence, setOccurrence] = useState("");
  const [problemn, setProblemn] = useState("");
  const [respectiveArea, setRespectiveArea] = useState("");
  const [messageinfo1, setMessageinfo1] = useState("");
  const [messageinfo2, setMessageinfo2] = useState("");
  const [machineAlocate, setMachineAlocate] = useState("");

  const [alertverify, setAlertVerify] = useState(false);
  const [alert, setAlert] = useState(false);
  const [create_user_acess, setCreate_user_acess] = useState(true);
  const [alocate_machine_acess, seAlocate_Machine_Acess] = useState(true);
  const [loadingDash, setLoadingDash] = useState(false);
  const [btnMore, setBtnMore] = useState(false);

  const [countTicket, setCountTicket] = useState(0);

  const [selectedDay, setSelectedDay] = useState([]);
  const [ticketData, setTicketData] = useState([]);

  // Adicione mais estados conforme necessário
  // const [outroEstado, setOutroEstado] = useState(valorInicial);

  return (
    <TicketContext.Provider
      value={{
        ticketData,
        setTicketData,
        messagetitle,
        setMessagetitle,
        alertverify,
        setAlertVerify,
        alert,
        setAlert,
        sector,
        setSector,
        occurrence,
        setOccurrence,
        problemn,
        setProblemn,
        respectiveArea,
        setRespectiveArea,
        messageinfo1,
        setMessageinfo1,
        messageinfo2,
        setMessageinfo2,
        machineAlocate,
        setMachineAlocate,
        selectedDay,
        setSelectedDay,
        create_user_acess,
        setCreate_user_acess,
        alocate_machine_acess,
        seAlocate_Machine_Acess,
        loadingDash,
        setLoadingDash,
        btnMore,
        setBtnMore,
        countTicket,
        setCountTicket,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};
