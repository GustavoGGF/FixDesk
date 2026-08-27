import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "react-day-picker/dist/style.css";
import DashBoardPie from "../components/dashboard/dashboardPie.jsx";
import Navbar from "../components/general/navbar.jsx";
import Message from "../components/utility/message.jsx";
import { Div } from "../styles/dashboardTI/dashboardTI.js";
import "../styles/bootstrap/css/bootstrap.css";
import "../styles/bootstrap/js/bootstrap.js";
import DashboardBar from "../components/dashboard/dashboardBar.jsx";
import ListTable from "../components/table/ListTable.jsx";
import FilterTickets from "../components/ticket/filter.jsx";
import OpenTicketWindow from "../components/ticket/openTicketWindow.jsx";
import ExcludeUser from "../components/utility/excludeUser.jsx";
import TechnicalDetails from "../components/ticket/TechnicalDetails.jsx";
import { MessageContext } from "../context/MessageContext.js";
import { TicketContext } from "../context/TicketContext.js";
import { UserManagementContext } from "../context/UserManagement.js";
import { AreaContext } from "../context/AreaContext";

export default function Dashboard() {
	// Ao carregar a pagina aplica o tema
	useEffect(() => {
		document.title = "Dashboard";
		const theme =
			localStorage.getItem("Theme") === null
				? "black"
				: localStorage.getItem("Theme");
		if (theme === "black") {
			ThemeBlack();
		} else {
			ThemeLight();
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { sector: routeSector } = useParams();

	const [selectedArea, setSelectedArea] = useState(() => {
		if (routeSector) {
			const formattedSector = routeSector.toUpperCase();
			if (formattedSector === "TI" || formattedSector === "FISCAL") {
				return formattedSector === "FISCAL" ? "Fiscal" : "TI";
			}
		}
		const storedGroups = JSON.parse(
			localStorage.getItem("groups") ||
				sessionStorage.getItem("groups") ||
				"[]",
		);
		const hasTI = storedGroups.some(
			(g) => g === "Helpdesk_Technician_TI" || g === "Helpdesk_Leader_TI",
		);
		const hasFiscal = storedGroups.some(
			(g) => g === "Helpdesk_Technician_Fiscal",
		);
		if (hasFiscal && !hasTI) {
			return "Fiscal";
		}
		return "TI";
	});

	const [chat, setChat] = useState(false);
	const [ticketWindow, setTicketWindow] = useState(false);
	const [showPageConfig, setShowPageConfig] = useState(false);

	const [blurNav, setBlurNav] = useState("");
	const [colorTheme, setColorTheme] = useState("");
	const [theme, setTheme] = useState("");
	const [themeFilter, setThemeFilter] = useState("");

	const [moreTickets, SetMoreTickets] = useState(0);

	const [userData, setUserData] = useState([]);

	const userGroups =
		userData?.groups ||
		JSON.parse(
			localStorage.getItem("groups") ||
				sessionStorage.getItem("groups") ||
				"[]",
		);

	const hasTIGroup = userGroups.some(
		(g) => g === "Helpdesk_Technician_TI" || g === "Helpdesk_Leader_TI",
	);
	const hasFiscalGroup = userGroups.some(
		(g) => g === "Helpdesk_Technician_Fiscal",
	);
	const isDualRole = hasTIGroup && hasFiscalGroup;

	useEffect(() => {
		if (routeSector) {
			const formattedSector = routeSector.toUpperCase();
			if (formattedSector === "TI" || formattedSector === "FISCAL") {
				setSelectedArea(formattedSector === "FISCAL" ? "Fiscal" : "TI");
				return;
			}
		}

		if (userData?.groups) {
			const hasTI = userData.groups.some(
				(g) => g === "Helpdesk_Technician_TI" || g === "Helpdesk_Leader_TI",
			);
			const hasFiscal = userData.groups.some(
				(g) => g === "Helpdesk_Technician_Fiscal",
			);
			if (hasFiscal && !hasTI) {
				setSelectedArea("Fiscal");
			}
		}
	}, [userData, routeSector]);

	useEffect(() => {
		const titleText = isDualRole
			? `Dashboard TI & Fiscal - ${selectedArea}`
			: `Dashboard ${selectedArea}`;
		document.title = titleText;
	}, [selectedArea, isDualRole]);

	const timeoutTicketUpdateRef = useRef(null);

	const initialFileticket = useRef(false);
	const showEquipament = useRef(false);
	const mountDataChat = useRef(false);
	const fetchchat = useRef(false);

	const lifeTime = useRef("");
	const ticketCOMPANY = useRef("");
	const token = useRef("");
	const ticketDEPARTMENT = useRef("");
	const ticketAREA = useRef("");
	const ticketID = useRef("");
	const ticketMAIL = useRef("");
	const ticketOCCURRENCE = useRef("");
	const ticketPROBLEMN = useRef("");
	const ticketResponsibleTechnician = useRef("");
	const ticketSECTOR = useRef("");
	const equipament = useRef("");
	const ticketNAME = useRef("");
	const observation = useRef("");
	const initialFileData = useRef("");
	const initialFileName = useRef("");
	const initialContentFile = useRef("");
	const dateAlocate = useRef("");

	const techsNames = useRef([]);
	const mountInitialChat = useRef([]);

	const {
		ticketData,
		setTicketData,
		ticketWindowAtt,
		setTicketWindowAtt,
		changeTech,
		setChangeTech,
		changeStatus,
		setChangeStatus,
		ticketIDOpen,
		setTicketIDOpen,
		sectionTicket,
		startSearch,
		setStartSearch,
		themeCard,
		techDetails,
		setTechDetails,
	} = useContext(TicketContext);
	const { getAreaCodeById } = useContext(AreaContext);

	const { typeError, messageError, setMessage, message } =
		useContext(MessageContext);

	const { setConfigUsers, configUsers, showExcludeUser, setShowExcludeUser } =
		useContext(UserManagementContext);

	const [techNote, setTechNote] = useState("");
	const [techFile, setTechFile] = useState(null);
	const [isSavingTechNote, setIsSavingTechNote] = useState(false);
	const [techRecords, setTechRecords] = useState([]);
	const [techFiles, setTechFiles] = useState([]);

	async function loadTechnicalFiles(id) {
		try {
			const response = await fetch(
				`/helpdesk/ticket/${id}/technical-details/files/`,
				{ headers: { Accept: "application/json" } },
			);
			if (!response.ok) {
				setTechFiles([]);
				return;
			}
			const data = await response.json();
			setTechFiles(data.files || []);
		} catch (error) {
			setTechFiles([]);
			console.error("Erro ao carregar arquivos técnicos:", error);
		}
	}

	const parseTechDetails = (detailsStr) => {
		if (!detailsStr) return [];
		const regex = /\[\[([^[\]]+?)\],\[([^[\]]+?)\],\[([^[\]]+?)\]\]/g;
		const records = [];
		let match = regex.exec(detailsStr);
		let index = 0;
		while (match !== null) {
			const [, dateStr, contentStr, hoursStr] = match;
			const date = dateStr.replace("Date:", "").trim();
			const time = hoursStr.replace("Hours:", "").trim();
			const [day, month, year] = date.split("/");
			const timestamp = `${year}-${month}-${day}T${time}:00`;
			let rawContent = contentStr;
			if (rawContent.startsWith("System:")) {
				rawContent = rawContent.substring(7).trim();
			}
			let author = "TI";
			let content = rawContent;

			let allTechs = [];
			if (Array.isArray(techsNames.current)) {
				allTechs = techsNames.current;
			} else if (techsNames.current && typeof techsNames.current === "object") {
				allTechs = Object.values(techsNames.current).flat();
			}

			// Tenta casar o autor com os nomes conhecidos da equipe de TI ou Fiscal
			const matchedTech = allTechs.find((techName) =>
				rawContent.startsWith(techName),
			);

			if (matchedTech) {
				author = matchedTech;
				content = rawContent.substring(matchedTech.length).trim();
			} else {
				const firstSpace = rawContent.indexOf(" ");
				if (firstSpace !== -1) {
					author = rawContent.substring(0, firstSpace);
					content = rawContent.substring(firstSpace + 1).trim();
				}
			}

			let fileUrl = null;
			let fileName = null;

			// Verificar se o conteúdo indica envio de anexo (ex: "Anexou um arquivo: /media/...|nome_do_arquivo")
			const attachmentMatch =
				content.match(
					/Anexou um arquivo:\s*(https?:\/\/[^\s|]+|\/[^\s|]+)(?:\|(.+))?/i,
				) ||
				content.match(
					/(https?:\/\/[^\s|]+\/media\/[^\s|]+|\/media\/[^\s|]+)(?:\|(.+))?/i,
				);

			if (attachmentMatch) {
				fileUrl = attachmentMatch[1];
				fileName = attachmentMatch[2] || fileUrl.split("/").pop();
			}

			records.push({
				id: index++,
				timestamp: timestamp,
				author: author,
				content: content,
				fileUrl: fileUrl,
				fileName: fileName,
			});
			match = regex.exec(detailsStr);
		}
		return records;
	};

	// Abre a tela de dados do chamado
	useEffect(() => {
		if (ticketIDOpen && ticketIDOpen !== "") {
			HelpdeskPage({ id: ticketIDOpen });
			setTicketIDOpen("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticketIDOpen]);

	// Inicia o loop por novos chamados
	useEffect(() => {
		if (startSearch) {
			CallNewTicket();
			setStartSearch(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [startSearch]);

	// Atualiza a lista de chamados sempre que a área selecionada mudar (TI <-> Fiscal)
	useEffect(() => {
		GetNewTickets();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedArea]);

	/**
	 * useEffect para fechar telas específicas ao pressionar a tecla Escape.
	 *
	 * Escuta eventos de teclado e:
	 * - Fecha a tela de exclusão de usuário se estiver aberta.
	 * - Fecha a tela de configuração de usuários se estiver ativa.
	 *
	 * Remove o listener ao desmontar o componente para evitar vazamentos de memória.
	 */
	useEffect(() => {
		const handleKeyDown = (event) => {
			// Verifica se a tecla pressionada é Escape
			if ((event.key === "Escape" || event.keyCode === 27) && showExcludeUser) {
				setShowExcludeUser(false); // Fecha tela de exclusão
				setConfigUsers(true); // Reabre a configuração de usuários
				return;
			} else if (
				(event.key === "Escape" || event.keyCode === 27) &&
				configUsers
			) {
				setConfigUsers(false); // Fecha a tela de configuração de usuários
				return;
			}
		};

		// Adiciona listener para evento de keydown
		window.addEventListener("keydown", handleKeyDown);

		// Remove listener ao desmontar o componente
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [configUsers, showExcludeUser]);

	/**
	 * useEffect para fechar a tela de configuração ao clicar fora dela.
	 *
	 * Adiciona um listener de clique no elemento com id "dashboard-ti".
	 * Se o clique ocorrer fora dos elementos com ids relacionados à configuração,
	 * e a tela de configuração estiver aberta, ela será fechada.
	 *
	 */
	useEffect(() => {
		const handleClickOutsideConfig = (event) => {
			// Verifica se o clique NÃO foi em nenhum dos elementos da configuração
			if (
				event.target.id !== "setting" &&
				event.target.id !== "setting-2" &&
				event.target.id !== "setting-3" &&
				event.target.id !== "setting-4" &&
				event.target.id !== "setting-5"
			) {
				// Se a página de configuração está aberta, fecha-a
				if (showPageConfig) {
					setShowPageConfig(false);
					return;
				}
				return;
			}
			return;
		};

		const dashboardElement = document.getElementById("dashboard-ti");
		dashboardElement.addEventListener("click", handleClickOutsideConfig);

		// Cleanup: remove o listener ao desmontar ou atualizar efeito
		return () => {
			dashboardElement.removeEventListener("click", handleClickOutsideConfig);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userData]);

	useEffect(() => {
		if (ticketWindowAtt) {
			setTicketWindowAtt(false);
			CloseTicket();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticketWindowAtt]);

	useEffect(() => {
		if (changeTech && changeTech.length !== 0) {
			CloseTicket();
			HelpdeskPage({ id: changeTech });
			setChangeTech("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [changeTech]);

	useEffect(() => {
		if (changeStatus && changeStatus.length !== 0) {
			CloseTicket();
			HelpdeskPage({ id: changeStatus });
			setChangeStatus("");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [changeStatus]);

	/**
	 * Função para alterar o tema da aplicação para o modo escuro.
	 * Limpa os filtros e estilos de cartões existentes e define o tema como "themeBlack".
	 */
	function ThemeBlack() {
		setThemeFilter("");
		themeCard.current = "";
		setColorTheme("text-light");
		setTheme("themeBlack");
	}

	/**
	 * Função para alterar o tema da aplicação para o modo claro.
	 * Define os estilos de cartões e filtros como claros e define o tema como "themeLight".
	 */
	function ThemeLight() {
		themeCard.current = "theme-card-light";
		setThemeFilter("theme-filter-light");
		setTheme("theme-light");
	}

	/**
	 * Valida a sessão do usuário e inicializa as configurações do painel de TI.
	 *
	 * @description
	 * Executado na montagem do componente. Verifica a existência dos dados de autenticação
	 * (`dataInfo`) no `localStorage`. Se ausente, redireciona o usuário para a página de login
	 * mantendo o caminho de origem. Se presente, atualiza o estado local do usuário e busca
	 * a listagem de técnicos e o token de acesso no endpoint `get-info/`.
	 */
	useEffect(() => {
		const dataInfo = JSON.parse(localStorage.getItem("dataInfo"));
		if (dataInfo === null || dataInfo === "null") {
			window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
			return;
		}
		setUserData(dataInfo.data);
		fetch("/dashboard/get-info/", {
			method: "GET",
			headers: { Accept: "application/json" },
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				techsNames.current = data.techs;
				token.current = data.token;
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	/**
	 * Esta função atua como um loop controlado via setTimeout para consultar
	 * novos chamados a cada 60 segundos, garantindo que não existam timeouts
	 * concorrentes. Utiliza uma referência para armazenar o identificador do
	 * timeout, permitindo o cancelamento seguro e evitando múltiplas execuções paralelas.
	 */
	function CallNewTicket() {
		try {
			// Se existir um timeout já configurado, cancela antes de agendar outro
			if (timeoutTicketUpdateRef.current) {
				clearTimeout(timeoutTicketUpdateRef.current);
			}

			// Configura um novo timeout para executar após 60 segundos
			timeoutTicketUpdateRef.current = setTimeout(() => {
				// Chama a função responsável por buscar novos chamados
				GetNewTickets();

				// Após execução, limpa o identificador do timeout para indicar inatividade
				timeoutTicketUpdateRef.current = null;
			}, 60000);
		} catch (err) {
			// Loga qualquer erro ocorrido durante o processo para facilitar debug
			return console.error(err);
		}
	}

	function GetLocalStorageValues() {
		const prefix = selectedArea ? `_${selectedArea}` : "";
		const storedQuantity =
			localStorage.getItem(`quantity${prefix}`) ||
			localStorage.getItem("quantity");
		const finalQuantity = storedQuantity || "10";
		const storedStatus =
			localStorage.getItem(`status${prefix}`) || localStorage.getItem("status");
		const finalStatus = storedStatus || "open";
		const storedOrder =
			localStorage.getItem(`order${prefix}`) || localStorage.getItem("order");
		const finalOrder = storedOrder || "-id";

		return {
			quantity: finalQuantity,
			status: finalStatus,
			order: finalOrder,
		};
	}

	/**
	 * Consulta a lista atualizada de chamados da área ativa (TI ou Fiscal) com base nos filtros.
	 */
	function GetNewTickets() {
		const { quantity, status, order } = GetLocalStorageValues();
		const currentArea = selectedArea || "TI";

		fetch(
			`/helpdesk/tickets/?context=dashboard&area=${encodeURIComponent(currentArea)}&status=${encodeURIComponent(status)}&order=${encodeURIComponent(order)}&limit=${encodeURIComponent(quantity)}`,
			{
				method: "GET",
				headers: { Accept: "application/json" },
			},
		)
			.then((response) => response.json())
			.then((data) => {
				if (data.tickets) {
					setTicketData(data.tickets);
				}
			})
			.catch((err) => {
				typeError.current = "FATAL ERROR";
				messageError.current = err;
				setMessage(true);
				return console.error(err);
			});
	}

	/**
	 * Altera o último visualizador de um chamado no sistema de helpdesk.
	 *
	 * @param {Object} params - Parâmetros da função.
	 * @param {number} params.id - ID do chamado a ser atualizado.
	 * @param {string} params.tech - Nome do técnico responsável pelo chamado.
	 * @returns {Promise<Response>} - Retorna a resposta da requisição fetch.
	 */
	async function ChangeLastVW({ id, tech }) {
		try {
			return fetch(`/helpdesk/change-last-viewer/${id}`, {
				method: "POST",
				headers: {
					"X-CSRFToken": token.current, // Token CSRF para segurança da requisição
					"Content-Type": "application/json", // Define o formato do corpo da requisição como JSON
				},
				body: JSON.stringify({
					viewer: userData.name, // Nome do usuário que está visualizando o chamado
					technician: tech, // Nome do técnico associado ao chamado
					requester: "tech", // Indica que a alteração foi feita por um usuário tecnico
					mail: userData.mail,
				}),
			});
		} catch (err) {
			console.error(err);
		}
	}

	async function HelpdeskPage({ id }) {
		try {
			CloseTicket();
			fetch(`/helpdesk/ticket/${id}`, {
				method: "GET",
				headers: {
					"X-CSRFToken": token.current,
				},
			})
				.then((response) => {
					return response.json();
				})
				.then((dataBack) => {
					setBlurNav("addBlur");
					if (sectionTicket?.current) {
						sectionTicket.current.style.filter = "blur(3px)";
					}
					const data = dataBack.data;
					if (data.responsible_technician !== null) {
						const callAsyncFunction = async () => {
							await ChangeLastVW({ id: id, tech: data.responsible_technician });
						};
						callAsyncFunction();
					}
					setMessage(false);

					const CalculateDiference = (dataStr) => {
						const data = new Date(dataStr);
						const agora = new Date();

						const diffMs = agora - data;

						const diffAbs = Math.abs(diffMs);

						const diffDias = Math.floor(diffAbs / (1000 * 60 * 60 * 24));

						const diffHorasTotal = Math.floor(diffAbs / (1000 * 60 * 60));
						const diffMinutosTotal = Math.floor(diffAbs / (1000 * 60));
						const diffHoras = diffHorasTotal % 24;
						const diffMinutos = diffMinutosTotal % 60;

						const hora = data.toLocaleTimeString("pt-BR", {
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
						});

						const dataFormatada = data.toLocaleDateString("pt-BR");

						return {
							hora,
							dataFormatada,
							diffDias,
							diffHoras,
							diffMinutos,
							noFuturo: diffMs < 0,
						};
					};

					const resultado = CalculateDiference(data.start_date);

					lifeTime.current = `${resultado.diffDias} Dias e ${resultado.diffHoras}:${resultado.diffMinutos} Horas`;

					ticketNAME.current = data.ticketRequester;
					ticketDEPARTMENT.current = data.department;
					ticketMAIL.current = data.mail;
					ticketCOMPANY.current = data.company;
					ticketSECTOR.current = data.sector;
					ticketAREA.current = getAreaCodeById(data.respective_area);
					ticketOCCURRENCE.current = data.occurrence;
					ticketPROBLEMN.current = data.problemn;
					if (data.observation && data.observation.length !== 0) {
						observation.current = data.observation;
					}
					if (data.equipament && data.equipament.length !== 0) {
						showEquipament.current = true;
						equipament.current = data.equipament;
						dateAlocate.current = data.date_alocate;
					}
					if (
						data.responsible_technician &&
						data.responsible_technician.length !== 0
					) {
						ticketResponsibleTechnician.current = data.responsible_technician;
					}
					ticketID.current = data.id;

					const name_verify = userData?.name || "";
					// Verifica se o ticket contém arquivos do tipo e-mail e gera a visualização correspondente, se aplicável.
					if (data.file && data.file.length >= 1) {
						initialFileData.current = data.file;
						initialFileName.current = data.name_file;
						initialContentFile.current = data.content_file;
						initialFileticket.current = true;
					}
					// Identifica o chat, verifica se contém valores e os separa em grupos de Data, Receptor e Horário.
					if (
						data.chat !== null &&
						data.chat !== undefined &&
						data.chat !== "undefined"
					) {
						fetchchat.current = true;
						mountDataChat.current = true;
						mountInitialChat.current = data.chat;
					}

					setTechRecords(parseTechDetails(data.details));
					loadTechnicalFiles(id);

					// Verifica se o nome que consta no técnico é o mesmo que está logado.
					const nameVer = name_verify ? name_verify.split(" ") : [];
					let allFind = false;

					if (data.responsible_technician && nameVer.length > 0) {
						const techVer = data.responsible_technician.split(" ");

						allFind = true;
						for (let i = 0; i < techVer.length; i++) {
							if (nameVer.indexOf(techVer[i]) === -1) {
								allFind = false;
								break;
							}
						}
					}

					if (allFind && data.open) {
						setChat(true);
					}
					setTicketWindow(true);
					setTicketWindowAtt(false);
				})
				.catch((err) => {
					messageError.current = err;
					typeError.current = "FATAL ERROR";
					setMessage(true);
					return console.error(err);
				});
		} catch (err) {
			console.error(err);
		}
	}

	// Evento para fechar dropdowns quando o usuário clica fora deles.
	window.onclick = (event) => {
		if (
			!event.target.matches(".dropbtn") &&
			!event.target.matches(".dropdown-content")
		) {
			try {
				const dropdowns = document.getElementsByClassName("dropdown-content");
				for (let i = 0; i < dropdowns.length; i++) {
					const openDropdown = dropdowns[i];
					if (openDropdown.classList.contains("showDP")) {
						openDropdown.classList.remove("showDP");
					}
				}
			} catch (err) {
				return console.error(err);
			}
		}
		return;
	};

	async function CloseTicket() {
		if (sectionTicket?.current) {
			sectionTicket.current.style.filter = "blur(0)";
		}
		initialFileData.current = "";
		initialFileName.current = "";
		initialContentFile.current = "";
		initialFileticket.current = false;
		setTechFiles([]);
		setBlurNav("");
		setTicketWindow(false);
		equipament.current = "";
		observation.current = "";
		ticketResponsibleTechnician.current = "";
		setChat(false);
		showEquipament.current = false;
		mountInitialChat.current = [];
		return GetNewTickets();
	}

	return (
		<Div className={`position-relative ${theme}`} id="dashboard-ti">
			<div className={blurNav}>
				<Navbar />
			</div>
			{message && (
				<div className="position-fixed top-50 start-50 translate-middle !tw-z-[12]">
					<Message
						CloseMessage={() => {
							setMessage(false);
						}}
					/>
				</div>
			)}
			<h2
				className={`text-center mt-3 tw-text-[2.3em] tw-font-bold tw-font-['Lugrasimo',cursive] tw-text-center tw-text-[var(--pure-black)] ${colorTheme}`}
			>
				{isDualRole ? "Dashboard TI & Fiscal" : `Dashboard ${selectedArea}`}
			</h2>
			{isDualRole && (
				<div className="tw-flex tw-justify-center tw-items-center tw-my-3 tw-gap-2">
					<span
						className={`tw-font-semibold tw-text-sm ${
							colorTheme === "text-light" ? "tw-text-white" : "tw-text-gray-700"
						}`}
					>
						Área Selecionada:
					</span>
					<div className="tw-inline-flex tw-rounded-md tw-shadow-sm">
						<button
							type="button"
							className={`tw-px-4 tw-py-1.5 tw-text-sm tw-font-medium tw-rounded-l-lg tw-border tw-transition-colors ${
								selectedArea === "TI"
									? "tw-bg-blue-600 tw-text-white tw-border-blue-600"
									: "tw-bg-white tw-text-gray-700 tw-border-gray-300 hover:tw-bg-gray-100"
							}`}
							onClick={() => setSelectedArea("TI")}
						>
							TI
						</button>
						<button
							type="button"
							className={`tw-px-4 tw-py-1.5 tw-text-sm tw-font-medium tw-rounded-r-lg tw-border tw-transition-colors ${
								selectedArea === "Fiscal"
									? "tw-bg-blue-600 tw-text-white tw-border-blue-600"
									: "tw-bg-white tw-text-gray-700 tw-border-gray-300 hover:tw-bg-gray-100"
							}`}
							onClick={() => setSelectedArea("Fiscal")}
						>
							Fiscal
						</button>
					</div>
				</div>
			)}
			<div
				className={`d-flex flex-column justify-content-center w-100 ${blurNav} mb-5 position-relative`}
			>
				<div className="d-flex justify-content-center w-100">
					<DashBoardPie sector={selectedArea} clss={colorTheme} />
				</div>
				<div className="d-flex justify-content-center mb-5">
					<DashboardBar activeArea={selectedArea} />
				</div>
			</div>
			<div className="mt7 position-relative p-3">
				<FilterTickets
					url={"dashboards"}
					blurNav={""}
					themeFilter={themeFilter}
					userName={userData.name}
					moreTickets={moreTickets}
					activeArea={selectedArea}
				/>
			</div>
			<section ref={sectionTicket} className="mt-3 position-relative">
				<div className="w-100 d-flex justify-content-center">
					<ListTable ticket={ticketData} />
				</div>
			</section>
			{ticketWindow && !techDetails && (
				<OpenTicketWindow
					helpdesk={"dashboard"}
					ticketID={ticketID.current}
					token={token.current}
					CloseTicket={CloseTicket}
					ticketNAME={ticketNAME.current}
					ticketDEPARTMENT={ticketDEPARTMENT.current}
					ticketMAIL={ticketMAIL.current}
					ticketCOMPANY={ticketCOMPANY.current}
					ticketOCCURRENCE={ticketOCCURRENCE.current}
					ticketPROBLEMN={ticketPROBLEMN.current}
					ticketSECTOR={ticketSECTOR.current}
					ticketAREA={ticketAREA.current}
					equipament={equipament.current}
					dateAlocate={dateAlocate.current}
					lifeTime={lifeTime.current}
					ticketResponsible_Technician={ticketResponsibleTechnician.current}
					initialFileticket={initialFileticket.current}
					showEquipament={showEquipament.current}
					observation={observation.current}
					mountDataChat={mountDataChat.current}
					chat={chat}
					fetchchat={fetchchat.current}
					userName={userData.name}
					userMail={userData.mail}
					initialFileData={initialFileData.current}
					initialFileName={initialFileName.current}
					initialContentFile={initialContentFile.current}
					mountInitialChat={mountInitialChat.current}
					techsNames={techsNames.current}
				/>
			)}
			{techDetails && (
				<TechnicalDetails
					isOpen={techDetails}
					technicalRecords={techRecords}
					technicalFiles={techFiles}
					onClose={() => setTechDetails(false)}
					canAddNote={true}
					note={techNote}
					onNoteChange={setTechNote}
					selectedFile={techFile}
					onFileSelect={setTechFile}
					onFileRemove={() => setTechFile(null)}
					isSavingNote={isSavingTechNote}
					onAddNote={async () => {
						if (!techNote.trim() && !techFile) return;
						setIsSavingTechNote(true);
						try {
							const dateObj = new Date();
							const addZero = (num) => (num < 10 ? `0${num}` : num);
							const dateFormatted = `${addZero(dateObj.getDate())}/${addZero(dateObj.getMonth() + 1)}/${dateObj.getFullYear()}`;
							const hoursFormatted = `${addZero(dateObj.getHours())}:${addZero(dateObj.getMinutes())}`;

							let noteSuccess = false;
							let fileSuccess = false;

							if (techNote.trim()) {
								const res = await fetch(
									`/helpdesk/ticket/${ticketID.current}/technical-details/message/`,
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
											"X-CSRFToken": token.current,
										},
										body: JSON.stringify({
											message: techNote.trim(),
											date: dateFormatted,
											hours: hoursFormatted,
										}),
									},
								);
								if (res.ok) {
									const data = await res.json();
									if (data.details) {
										setTechRecords(parseTechDetails(data.details));
									}
									noteSuccess = true;
								}
							}

							if (techFile) {
								const formData = new FormData();
								formData.append("files", techFile);
								formData.append("date", dateFormatted);
								formData.append("hours", hoursFormatted);

								const resFile = await fetch(
									`/helpdesk/ticket/${ticketID.current}/technical-details/file/`,
									{
										method: "POST",
										headers: {
											"X-CSRFToken": token.current,
										},
										body: formData,
									},
								);
								if (resFile.ok) {
									const dataFile = await resFile.json();
									if (dataFile.details) {
										setTechRecords(parseTechDetails(dataFile.details));
									}
									await loadTechnicalFiles(ticketID.current);
									fileSuccess = true;
								}
							}

							if (noteSuccess) setTechNote("");
							if (fileSuccess) setTechFile(null);
						} catch (err) {
							console.error("Erro ao salvar nota técnica:", err);
						} finally {
							setIsSavingTechNote(false);
						}
					}}
					ticket={{
						id: ticketID.current,
						requester: ticketNAME.current,
						department: ticketDEPARTMENT.current,
						email: ticketMAIL.current,
						unit: ticketCOMPANY.current,
						sector: ticketSECTOR.current,
						occurrence: ticketOCCURRENCE.current,
						description: ticketPROBLEMN.current,
						openDuration: lifeTime.current,
						responsibleTechnician: ticketResponsibleTechnician.current,
					}}
				/>
			)}
			<div className={`w-100 text-center ${blurNav} mt-5`}>
				<button
					type="button"
					className="btn btn-info mb-5"
					onClick={() => {
						var quantity = localStorage.getItem("quantity");
						quantity = Number(quantity);
						quantity += 10;
						return SetMoreTickets(quantity);
					}}
				>
					Carregar Mais
				</button>
			</div>
			{showExcludeUser && <ExcludeUser token={token.current} />}
		</Div>
	);
}
