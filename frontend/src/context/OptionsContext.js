import React, { createContext, useState } from "react";

// Cria o contexto
export const OptionsContext = createContext();

// Cria o provedor de contexto
export const OptionsProvider = ({ children }) => {
  // Define variáveis de estado
  const [messagetitle, setMessagetitle] = useState("");
  const [sector, setSector] = useState("");
  const [occurrence, setOccurrence] = useState("");
  const [problemn, setProblemn] = useState("");
  const [respectiveArea, setRespectiveArea] = useState("");
  const [messageinfo1, setMessageinfo1] = useState("");
  const [messageinfo2, setMessageinfo2] = useState("");
  const [machineAlocate, setMachineAlocate] = useState("");
  const [linkAcess, setLinkAcess] = useState("");

  const [alertverify, setAlertVerify] = useState(false);
  const [alert, setAlert] = useState(false);
  const [alocate_machine_acess, seAlocate_Machine_Acess] = useState(true);
  const [reset, setReset] = useState(false);

  const [selectedDay, setSelectedDay] = useState([]);

  return (
    <OptionsContext.Provider
      value={{
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
        alocate_machine_acess,
        seAlocate_Machine_Acess,
        reset,
        setReset,
        linkAcess,
        setLinkAcess,
      }}
    >
      {children}
    </OptionsContext.Provider>
  );
};
