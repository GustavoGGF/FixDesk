import { createContext, useRef, useState } from "react";

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
	const [startSearch, setStartSearch] = useState(false);

	const [changeTech, setChangeTech] = useState("");
	const [changeStatus, setChangeStatus] = useState("");
	const [ticketIDOpen, setTicketIDOpen] = useState("");

	const [ticketData, setTicketData] = useState([]);
	const [ticketList, setTicketList] = useState([]);

	const [totalTickets, setTotalTickets] = useState(0);
	const [techDetails, setTechDetails] = useState(false);
	const [activeAreas, setActiveAreas] = useState([]);

	const sectionTicket = useRef(null);

	const themeCard = useRef("");

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
				changeStatus,
				setChangeStatus,
				totalTickets,
				setTotalTickets,
				reloadFilter,
				setReloadFilter,
				forcedLoad,
				setForcedLoad,
				filterHistory,
				setFilterHistory,
				ticketIDOpen,
				setTicketIDOpen,
				ticketList,
				setTicketList,
				sectionTicket,
				startSearch,
				setStartSearch,
				themeCard,
				techDetails,
				setTechDetails,
				activeAreas,
				setActiveAreas,
			}}
		>
			{children}
		</TicketContext.Provider>
	);
};
