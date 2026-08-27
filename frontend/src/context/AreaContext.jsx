import { createContext, useCallback, useEffect, useState } from "react";
import api from "../services/api";

/**
 * Contexto para compartilhamento global das áreas ativas de atendimento.
 */
export const AreaContext = createContext({
	activeAreas: [],
	loadingAreas: false,
	setActiveAreas: () => {},
	getAreaCodeById: (areaId) => (areaId ? String(areaId) : ""),
});

/**
 * Provedor de contexto responsável por buscar as áreas ativas no backend
 * no momento de sua montagem e disponibilizar métodos auxiliares.
 */
export const AreaProvider = ({ children }) => {
	const [activeAreas, setActiveAreas] = useState([]);
	const [loadingAreas, setLoadingAreas] = useState(true);

	useEffect(() => {
		let isMounted = true;

		api
			.get("/helpdesk/active-areas/")
			.then((response) => {
				if (isMounted && response.data?.areas) {
					setActiveAreas(response.data.areas);
				}
			})
			.catch((err) => {
				console.error("Erro ao carregar áreas ativas:", err);
			})
			.finally(() => {
				if (isMounted) {
					setLoadingAreas(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	/**
	 * Converte um ID numérico de área para seu respectivo código textual (ex: "TI", "Fiscal").
	 * Caso não seja encontrado, retorna o próprio ID fornecido.
	 */
	const getAreaCodeById = useCallback(
		(areaId) => {
			if (areaId === null || areaId === undefined || areaId === "") return "";
			const found = activeAreas.find(
				(a) => a.respective_area === Number(areaId),
			);
			return found ? found.respective_area_code : String(areaId);
		},
		[activeAreas],
	);

	return (
		<AreaContext.Provider
			value={{
				activeAreas,
				setActiveAreas,
				loadingAreas,
				getAreaCodeById,
			}}
		>
			{children}
		</AreaContext.Provider>
	);
};
