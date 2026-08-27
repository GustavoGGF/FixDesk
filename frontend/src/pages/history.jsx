import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Navbar from "../components/general/navbar";
import "react-day-picker/dist/style.css";
import ListTable from "../components/table/ListTable";
import FilterTickets from "../components/ticket/filter";
import OpenTicketWindow from "../components/ticket/openTicketWindow";
import Message from "../components/utility/message";
import { MessageContext } from "../context/MessageContext";
import { TicketContext } from "../context/TicketContext";
import { AreaContext } from "../context/AreaContext";
import api from "../services/api";
import { logErrorFrontend } from "../services/errorLogger";

const CalculateDiference = (dataStr) => {
	const data = new Date(dataStr);
	const agora = new Date();

	// Diferença em milissegundos
	const diffMs = agora - data;

	// Se a data for no futuro, diffMs será negativo
	const diffAbs = Math.abs(diffMs);

	// Diferença em dias
	const diffDias = Math.floor(diffAbs / (1000 * 60 * 60 * 24));

	// Diferença em horas e minutos
	const diffHorasTotal = Math.floor(diffAbs / (1000 * 60 * 60));
	const diffMinutosTotal = Math.floor(diffAbs / (1000 * 60));
	const diffHoras = diffHorasTotal % 24;
	const diffMinutos = diffMinutosTotal % 60;

	// Formatar hora da data original
	const hora = data.toLocaleTimeString("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	// Formatar data da data original
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

export default function History() {
	useEffect(() => {
		// Função para desabilitar o menu de contexto (botão direito do mouse)
		const handleContextMenu = (event) => {
			// Previne o comportamento padrão de exibir o menu de contexto
			event.preventDefault();
		};

		// Função para desabilitar atalhos de teclado específicos, como F12 e Ctrl+Shift+I
		const handleKeyDown = (event) => {
			// Verifica se a tecla pressionada é F12 ou o atalho Ctrl+Shift+I (inspecionar elemento)
			if (
				event.key === "F12" ||
				(event.ctrlKey && event.shiftKey && event.key === "I")
			) {
				// Previne o comportamento padrão associado a essas teclas
				event.preventDefault();
			}
		};

		// Adiciona o listener para desabilitar o menu de contexto
		document.addEventListener("contextmenu", handleContextMenu);
		// Adiciona o listener para desabilitar atalhos de teclado específicos
		document.addEventListener("keydown", handleKeyDown);

		// Cleanup para remover os listeners ao desmontar o componente
		return () => {
			// Remove o listener do menu de contexto para evitar vazamentos de memória
			document.removeEventListener("contextmenu", handleContextMenu);
			// Remove o listener de atalhos de teclado para garantir que o comportamento padrão seja restaurado
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	useEffect(() => {
		// Define o título do documento
		document.title = "Meus Chamados";

		// Obtém o tema armazenado no localStorage
		const theme = localStorage.getItem("Theme");

		// Aplica o tema apropriado
		if (theme === null || theme === "black") {
			localStorage.setItem("Theme", "black");
			ThemeBlack();
		} else {
			ThemeLight();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // O array de dependências vazio faz com que o useEffect execute apenas na montagem do componente

	// Variaveis de estado String
	const [colorTheme, setColorTheme] = useState("");
	const [theme, setTheme] = useState("");
	const [themeFilter, setThemeFilter] = useState("");
	const [blurNav, setBlurNav] = useState("");
	// Declarando variaveis de estado Boolean
	const [chat, setChat] = useState(false);
	const [ticketWindow, setTicketWindow] = useState(false);
	// Varaiveis de estado Array
	const [Data, setData] = useState([]);
	const [userArea] = useState(() => {
		try {
			const storedGroups =
				localStorage.getItem("groups") || sessionStorage.getItem("groups");
			let groups = [];
			if (storedGroups) {
				groups = JSON.parse(storedGroups);
			} else {
				const storedDataUser = localStorage.getItem("dataInfo");
				if (storedDataUser) {
					groups = JSON.parse(storedDataUser)?.data?.groups || [];
				}
			}
			const hasTI = groups.some(
				(g) => g === "Helpdesk_Technician_TI" || g === "Helpdesk_Leader_TI",
			);
			const hasFiscal = groups.some((g) => g === "Helpdesk_Technician_Fiscal");
			if (hasFiscal && !hasTI) {
				return "Fiscal";
			}
		} catch (_) {}
		return "TI";
	});

	// Variaveis de estado Number
	const [moreTickets, SetMoreTickets] = useState(0);

	const timeoutTicketUpdateRef = useRef(null);

	const token = useRef("");
	const ticketNAME = useRef("");
	const ticketDEPARTMENT = useRef("");
	const ticketMAIL = useRef("");
	const ticketCOMPANY = useRef("");
	const ticketSECTOR = useRef("");
	const ticketAREA = useRef("");
	const ticketOCCURRENCE = useRef("");
	const ticketPROBLEMN = useRef("");
	const equipament = useRef("");
	const dateAlocate = useRef("");
	const observation = useRef("");
	const lifeTime = useRef("");
	const ticketResponsibleTechnician = useRef("");
	const ticketID = useRef("");
	const initialFileData = useRef("");
	const initialFileName = useRef("");
	const initialContentFile = useRef("");

	const showEquipament = useRef(false);
	const initialFileticket = useRef(false);
	const fetchchat = useRef(false);
	const mountDataChat = useRef(false);

	const mountInitialChat = useRef([]);

	const {
		ticketData,
		setTicketData,
		ticketWindowAtt,
		setTicketWindowAtt,
		changeStatus,
		setChangeStatus,
		ticketIDOpen,
		setTicketIDOpen,
		setTicketList,
		sectionTicket,
		themeCard,
		startSearch,
		setStartSearch,
	} = useContext(TicketContext);
	const { getAreaCodeById } = useContext(AreaContext);
	const { typeError, messageError, setMessage, message } =
		useContext(MessageContext);

	// Abrir os dados do chamado
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

	useEffect(() => {
		if (ticketWindowAtt) {
			setTicketWindowAtt(false);
			CloseTicket();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ticketWindowAtt]); // Dependências ajustadas para ambos os estados

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

	useEffect(() => {
		const fetchData = async () => {
			setTicketList([]);
			try {
				// Obtém os dados armazenados localmente no navegador (localStorage)
				const dataInfo = JSON.parse(localStorage.getItem("dataInfo"));
				if (dataInfo === null || dataInfo === "null") {
					window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
					return;
				}
				// Se os dados não existirem, lança um erro e interrompe a execução
				if (!dataInfo)
					throw new Error("Informações de usuário não encontradas");

				// Atualiza o estado `data` com as informações obtidas do localStorage
				setData(dataInfo.data);

				const quantity =
					localStorage.getItem("quantity") === null
						? "10"
						: localStorage.getItem("quantity");

				const status_current =
					localStorage.getItem("status") === null
						? "open"
						: localStorage.getItem("status");

				const order_current =
					localStorage.getItem("order") === null
						? "-id"
						: localStorage.getItem("order");

				// Envia os dados para o servidor através de uma requisição GET utilizando a instância do api
				const response = await api.get(
					`/helpdesk/get-ticket/${quantity}/${dataInfo.data.name}/${status_current}/${order_current}`,
					{
						headers: {
							Accept: "application/json",
						},
					},
				);

				const data = response.data;
				// Verifica se não há tickets e define mensagens de erro informativas para o usuário
				if (data.tickets.length === 0) {
					typeError.current = "Falta de Dados";
					messageError.current = "Você Ainda não abriu nenhum chamado";
					setMessage(true);
				}
				// Atualiza os estados com os dados recebidos da API
				token.current = data.token;
				setTicketData(data.tickets);
			} catch (error) {
				// Se for não autorizado ou sessão expirada (402), redireciona para o login
				if (error.response?.status === 402) {
					window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
					return;
				}
				logErrorFrontend(
					error.message ||
						"Erro na solicitação de obter os chamados em history",
					error.stack || String(error),
				);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**
	 * Altera o último visualizador de um chamado no sistema de helpdesk.
	 *
	 * @param {Object} params - Parâmetros da função.
	 * @param {number} params.id - ID do chamado a ser atualizado.
	 * @param {string} params.tech - Nome do técnico responsável pelo chamado.
	 * @returns {Promise<Response>} - Retorna a resposta da requisição fetch.
	 */
	const ChangeLastVW = useCallback(
		async ({ id, tech }) => {
			return api.post(`/helpdesk/change-last-viewer/${id}`, {
				viewer: Data.name, // Nome do usuário que está visualizando o chamado
				technician: tech, // Nome do técnico associado ao chamado
				requester: "user", // Indica que a alteração foi feita por um usuário comum
			});
		},
		[Data],
	);

	/**
	 * Esta função realiza uma requisição HTTP GET para buscar novos chamados
	 * de acordo com os filtros armazenados no localStorage (quantity, status e order).
	 * Após obter a resposta em JSON, atualiza o estado local com os dados dos chamados.
	 * Em caso de falha, trata o erro exibindo mensagens apropriadas e faz o log no console.
	 */
	const GetNewTickets = useCallback(() => {
		setTicketList([]);
		// Recupera os filtros armazenados no localStorage para definir os parâmetros da requisição
		var quantity = localStorage.getItem("quantity");
		var status = localStorage.getItem("status");
		var order = localStorage.getItem("order");

		api
			.get(`/helpdesk/get-ticket/${quantity}/${Data.name}/${status}/${order}`, {
				headers: { Accept: "application/json" },
			})
			.then((response) => {
				// Atualiza o estado local com a lista de chamados retornados
				setTicketData(response.data.tickets);
			})
			.catch((err) => {
				logErrorFrontend(
					err.message || "Erro ao buscar novos chamados em GetNewTickets",
					err.stack || String(err),
				);
			});
	}, [Data, setTicketData, setTicketList]);

	const CloseTicket = useCallback(async () => {
		try {
			sectionTicket.current.style.filter = "blur(0)";
			setBlurNav("");
			setTicketWindow(false);
			equipament.current = "";
			observation.current = "";
			ticketResponsibleTechnician.current = "";
			setChat(false);
			showEquipament.current = false;
			mountInitialChat.current = [];
			return GetNewTickets();
		} catch (err) {
			logErrorFrontend(
				err.message || "Erro ao fechar chamado em CloseTicket",
				err.stack || String(err),
			);
		}
	}, [GetNewTickets, setBlurNav, setTicketWindow, setChat, sectionTicket]);

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
			logErrorFrontend(
				err.message || "Erro ao buscar novos chamados em CallNewTicket",
				err.stack || String(err),
			);
		}
	}

	/**
	 * Esta função é responsável por solicitar um ticket de chamado ao servidor
	 * conforme a decisão do usuário. Recebe o ID do ticket como parâmetro.
	 *
	 * @param {Object} options - Um objeto contendo as opções para a requisição.
	 * @param {string} options.id - O ID do ticket de chamado a ser recuperado.
	 * @returns {void} - Esta função não retorna nada diretamente, mas dispara uma
	 * solicitação de busca do ticket de chamado através da API do servidor.
	 */
	const HelpdeskPage = useCallback(
		({ id }) => {
			CloseTicket();
			api
				.get(`/helpdesk/ticket/${id}`)
				.then((response) => {
					const dataBack = response.data;
					try {
						/**
						 * Este trecho de código é executado quando a resposta da requisição para buscar o ticket de chamado é recebida com sucesso.
						 * Ele realiza várias ações, incluindo adicionar um efeito de desfoque ao fundo, obter a data do ticket de chamado e calcular a sua vida útil.
						 * Também redefine algumas variáveis relacionadas ao chat.
						 *
						 * @param {Object} dataBack - O objeto de resposta retornado pela requisição para buscar o ticket de chamado.
						 * @param {boolean} setMessageChat - Uma função para definir o estado de exibição da mensagem do chat.
						 * @param {Array} setMountChat - Uma função para definir o estado do chat.
						 * @returns {void} - Esta função não retorna nada diretamente, mas realiza várias operações conforme descrito acima.
						 */
						setBlurNav("addBlur");
						sectionTicket.current.style.filter = "blur(3px)";
						// Oculta a mensagem do chat
						setMessage(false);
						// Extrai a data do primeiro ticket de chamado
						const data = dataBack.data;

						// Chama a função de forma assíncrona sem bloquear o restante do código
						if (data.responsible_technician !== null) {
							ChangeLastVW({ id: id, tech: data.responsible_technician }).catch(
								(err) => {
									logErrorFrontend(
										err.message ||
											"Erro na solicitação de obter os chamados em history",
										err.stack || String(err),
									);
								},
							);
						}

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
						if (data.equipament && data.equipament.length !== 0) {
							showEquipament.current = true;
							equipament.current = data.equipament;
							dateAlocate.current = data.date_alocate;
						}
						if (data.observation && data.observation.length !== 0) {
							observation.current = data.observation;
						}
						if (
							data.responsible_technician &&
							data.responsible_technician.length !== 0
						) {
							ticketResponsibleTechnician.current = data.responsible_technician;
							if (data.open) {
								setChat(true);
							}
						}

						ticketID.current = data.id;
						if (data.file && data.file.length >= 1) {
							initialFileData.current = data.file;
							initialFileName.current = data.name_file;
							initialContentFile.current = data.content_file;
							initialFileticket.current = true;
						}
						if (
							data.chat !== null &&
							data.chat !== undefined &&
							data.chat !== "undefined"
						) {
							fetchchat.current = true;
							mountDataChat.current = true;
							mountInitialChat.current = data.chat;
						}
						setTicketWindow(true);
						setTicketWindowAtt(false);
					} catch (err) {
						logErrorFrontend(
							err.message ||
								"Erro na solicitação de obter os chamados em history",
							err.stack || String(err),
						);
					}
				})
				.catch((err) => {
					logErrorFrontend(
						err.message ||
							"Erro na solicitação de obter os chamados em history",
						err.stack || String(err),
					);
				});
		},
		[
			CloseTicket,
			ChangeLastVW,
			getAreaCodeById,
			setBlurNav,
			setMessage,
			setChat,
			setTicketWindow,
			setTicketWindowAtt,
			sectionTicket,
		],
	);

	return (
		<div
			className={`!tw-h-screen tw-w-screen tw-absolute !tw-overflow-x-hidden ${theme}`}
		>
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
				Histórico de Chamados
			</h2>
			<div className="p-3">
				<FilterTickets
					url={"history"}
					blurNav={blurNav}
					themeFilter={themeFilter}
					userName={Data.name}
					moreTickets={moreTickets}
					activeArea={userArea}
				/>
			</div>
			<section className="mt-3" ref={sectionTicket} id="dashboard">
				<div className="w-100 d-flex justify-content-center">
					<ListTable ticket={ticketData} />
				</div>
			</section>
			{ticketWindow && (
				<OpenTicketWindow
					helpdesk={"helpdesk"}
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
					userName={Data.name}
					userMail={Data.mail}
					initialFileData={initialFileData.current}
					initialFileName={initialFileName.current}
					initialContentFile={initialContentFile.current}
					mountInitialChat={mountInitialChat.current}
					techsNames={[]}
				/>
			)}
			<div className={`w-100 text-center mt-5 ${blurNav}`}>
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
		</div>
	);
}
