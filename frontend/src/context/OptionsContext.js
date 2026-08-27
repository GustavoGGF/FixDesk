import { createContext, useRef, useState } from "react";

// Cria o contexto
export const OptionsContext = createContext();

// Cria o provedor de contexto
export const OptionsProvider = ({ children }) => {
	// Variáveis de referência String
	const messagetitle = useRef("");
	const sector = useRef("");
	const messageinfo1 = useRef("");
	const messageinfo2 = useRef("");
	const messageinfo3 = useRef("");
	const linkAcess = useRef("");
	const machineAlocate = useRef("");
	const respectiveArea = useRef("");
	const problemn = useRef("");
	const occurrence = useRef("");

	// Variáveis de referência Array
	const selectedDay = useRef([]);

	// Variáveis de estado Boolean
	const [alertverify, setAlertVerify] = useState(false);
	const [alert, setAlert] = useState(false);
	const [alocate_machine_acess, seAlocate_Machine_Acess] = useState(true);
	const [reset, setReset] = useState(false);
	const [activeAreas, setActiveAreas] = useState([]);

	return (
		<OptionsContext.Provider
			value={{
				messagetitle,
				alertverify,
				setAlertVerify,
				alert,
				setAlert,
				sector,
				occurrence,
				problemn,
				respectiveArea,
				messageinfo1,
				messageinfo2,
				messageinfo3,
				machineAlocate,
				selectedDay,
				alocate_machine_acess,
				seAlocate_Machine_Acess,
				reset,
				setReset,
				linkAcess,
				activeAreas,
				setActiveAreas,
			}}
		>
			{children}
		</OptionsContext.Provider>
	);
};
