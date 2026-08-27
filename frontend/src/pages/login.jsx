import { useContext, useEffect, useRef, useState } from "react";
import "animate.css";

import "../styles/bootstrap/css/bootstrap.css";
import Loading from "../components/loading/loading";
import Message from "../components/utility/message";
import { MessageContext } from "../context/MessageContext";
import { logErrorFrontend } from "../services/errorLogger";
import api from "../services/api";

export default function Login() {
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
	}, []); // Dependências vazias garantem que este efeito será executado apenas uma vez no ciclo de vida do componente

	// Essa função verifica o armazenamento local(localStorage) em busca da preferência de tema do usuário.
	// Se não encontrar, configura automaticamente o tema como "black".
	useEffect(() => {
		// Definindo nome da Pagina
		document.title = "FixDesk";
		const theme = localStorage.getItem("Theme");
		if (!theme) {
			localStorage.setItem("Theme", "black");
			SetThemeBlack();
		} else {
			if (theme === "black") {
				SetThemeBlack();
			} else if (theme === "light") {
				SetThemeLight();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Essas são variáveis de estado que são alteradas dinamicamente ao longo do código.

	// Constantes Boolean
	const [awaitValidation, setAwaitValidation] = useState(false);
	const [passlimit, setPassLimit] = useState(false);
	// Constantes String

	const [theme, setTheme] = useState("");

	const userRef = useRef(null);
	const passRef = useRef(null);

	const animation = useRef("");
	const color = useRef("");

	const { messageError, typeError, setMessage, message } =
		useContext(MessageContext);

	// Esta função é responsável por alterar o tema do site para "black".
	function SetThemeBlack() {
		color.current = "colorBlack";
		setTheme("themeBlack");
	}
	// Esta função é responsável por alterar o tema do site para "white".
	function SetThemeLight() {
		color.current = "colorLight";
		setTheme("themeLight");
	}

	/**
	 * Processa o envio do formulário de login, realizando a autenticação via API fetch
	 * e gerenciando o fluxo de redirecionamento ou exibição de erros.
	 *
	 * @param {React.FormEvent} event - Evento de submissão do formulário.
	 */
	function Verifylogin(event) {
		// Evita o recarregamento padrão do formulário HTML
		event.preventDefault();

		const user = userRef.current.value;
		const pass = passRef.current.value;

		// Reseta estado de erro visual de tamanho de senha e ativa indicador de carregamento
		setPassLimit(false);
		setAwaitValidation(true);

		// Envia credenciais para validação via requisição HTTP POST usando o serviço customizado
		api
			.post(
				"validation/",
				{
					user: user,
					password: pass,
				},
				{
					withCredentials: true,
				},
			)
			.then((response) => {
				const data = response.data;
				if (data) {
					// Salva informações do usuário logado na sessão local
					localStorage.setItem("dataInfo", JSON.stringify(data));
					const clientData = data.data || data;
					const roles = clientData.roles || [];
					const groups = clientData.groups || [];

					// Armazena roles e grupos no localStorage e sessionStorage
					localStorage.setItem("roles", JSON.stringify(roles));
					localStorage.setItem("groups", JSON.stringify(groups));
					sessionStorage.setItem("roles", JSON.stringify(roles));
					sessionStorage.setItem("groups", JSON.stringify(groups));

					// Todos os usuários (técnicos e comuns) são direcionados para "/helpdesk" por padrão após a autenticação
					const defaultRoute = "/helpdesk";

					const urlParams = new URLSearchParams(window.location.search);
					const nextPath = urlParams.get("next");

					// Whitelist de rotas permitidas para mitigar falhas de Open Redirect
					const allowedRoutes = [
						"/helpdesk",
						"/helpdesk/history",
						"/dashboard",
						"/dashboard/ti",
						"/dashboard/fiscal",
						"/dashboard-ti",
						"/login",
						"/",
					];

					const isLoginOrRoot =
						!nextPath || nextPath === "/" || nextPath === "/login";

					// Valida e redireciona de forma segura para o destino correto
					if (
						!isLoginOrRoot &&
						nextPath?.startsWith("/") &&
						!nextPath?.startsWith("//") &&
						allowedRoutes.includes(nextPath)
					) {
						window.location.href = nextPath;
						return;
					}
					// Redireciona todos os usuários para /helpdesk
					window.location.href = defaultRoute;
					return;
				}
			})
			.catch((err) => {
				// Mapeamento preliminar de erros HTTP conhecidos do backend via Axios
				if (err.response) {
					if (err.response.status === 401) {
						InvalidCredentials();
						return;
					}
					if (err.response.status === 425) {
						AccessRestricted();
						return;
					}
				}
			});
	}

	// Funçaõ mostrada após erro de login por erro na credencial
	function InvalidCredentials() {
		setMessage(true);
		typeError.current = "Credencial Inválida";
		messageError.current = "Usuário e/ou Senha Inválido(s)";
		setPassLimit(true);
		animation.current = "";
		setAwaitValidation(false);
	}

	// Função mostrada após erro de acesso indevido
	function AccessRestricted() {
		setMessage(true);
		typeError.current = "Acesso Restrito";
		messageError.current = "Você não possui permissão para essa Ferramenta";
		setPassLimit(true);
		animation.current = "";
		setAwaitValidation(false);
	}

	function VerifyPass() {
		try {
			const pass = passRef.current.value;

			if (pass.length > 10) {
				setPassLimit(true);
				animation.current = "animate__bounceIn";
			} else {
				animation.current = "animate__bounceOut";
			}
		} catch (err) {
			logErrorFrontend(err.message, err.stack);
		}
	}

	useEffect(() => {
		if (animation.current === "animate__bounceOut") {
			setTimeout(() => {
				setPassLimit(false);
			}, 500);
		}
	}, [animation]);

	useEffect(() => {
		const handleEnterPress = (event) => {
			if (event.key === "Enter" && passlimit) {
				Verifylogin(event);
			}
		};

		document.addEventListener("keydown", handleEnterPress);
		return () => {
			document.removeEventListener("keydown", handleEnterPress);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [passlimit]);

	return (
		<div className={`${theme} tw-h-screen tw-w-screen tw-absolute`}>
			{message && (
				<Message
					className="tw-absolute tw-top-0 tw-left-1/2 tw-transform tw--translate-x-1/2"
					CloseMessage={() => {
						return setMessage(false);
					}}
				/>
			)}
			{!awaitValidation && (
				<div className="tw-absolute tw-top-1/2 tw-left-1/2 tw-transform tw--translate-x-1/2 tw--translate-y-1/2 tw-flex tw-flex-col animate__animated">
					<form>
						<span className={`${color.current} tw-font-bold tw-text-[1.3em]`}>
							Usuário
						</span>
						<input
							ref={userRef}
							type="text"
							className="tw-block tw-w-full tw-px-3 tw-py-1.5 tw-text-base tw-font-normal tw-bg-white tw-border tw-border-solid tw-border-gray-300 tw-rounded tw-transition tw-duration-150 tw-ease-in-out focus:tw-outline-none"
							name="user"
						/>
						<span className={`${color.current} tw-font-bold tw-text-[1.3em]`}>
							Senha
						</span>
						<input
							ref={passRef}
							type="password"
							className="tw-block tw-w-full tw-px-3 tw-py-1.5 tw-text-base tw-font-normal tw-bg-white tw-border tw-border-solid tw-border-gray-300 tw-rounded tw-transition tw-duration-150 tw-ease-in-out focus:tw-outline-none tw-mb-12"
							name="pass"
							onKeyUp={VerifyPass}
						/>

						{passlimit && (
							<button
								type="button"
								className={`tw-inline-block tw-font-normal tw-text-center tw-align-middle tw-cursor-pointer tw-select-none tw-border tw-border-transparent tw-px-3 tw-py-1.5 tw-text-base tw-rounded tw-transition tw-duration-150 tw-ease-in-out tw-bg-green-600 tw-text-white hover:tw-bg-green-700 active:tw-bg-green-800 tw-w-full ${animation.current}`}
								onClick={Verifylogin}
							>
								Logar
							</button>
						)}
					</form>
				</div>
			)}
			{awaitValidation && (
				<div className="tw-absolute tw-top-1/2 tw-left-1/2 tw-transform tw--translate-x-1/2 tw--translate-y-1/2">
					<Loading />
				</div>
			)}
		</div>
	);
}
