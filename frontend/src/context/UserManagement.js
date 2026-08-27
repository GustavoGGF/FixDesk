import { createContext, useState } from "react";

// Cria o contexto
export const UserManagementContext = createContext();

// Cria o provedor de contexto
export const UserManagementProvider = ({ children }) => {
	// Define variáveis de estado
	const [configUsers, setConfigUsers] = useState(false);
	const [showExcludeUser, setShowExcludeUser] = useState(false);

	const [currentUserAlteration, setCurrentUserAlteration] = useState();

	return (
		<UserManagementContext.Provider
			value={{
				configUsers,
				setConfigUsers,
				showExcludeUser,
				setShowExcludeUser,
				currentUserAlteration,
				setCurrentUserAlteration,
			}}
		>
			{children}
		</UserManagementContext.Provider>
	);
};
