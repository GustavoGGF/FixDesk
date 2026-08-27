import { useEffect, useRef, useState } from "react";

import "../../styles/bootstrap/css/bootstrap.css";
import "../../styles/bootstrap/js/bootstrap.js";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowDown from "../../images/components/caret-down-square.svg";
import ImgClose from "../../images/components/close.png";
import Logo from "../../images/logos/fixdesk.png";

/**
 * Componente responsável por exibir a barra de navegação do site e informações do usuário.
 * @param {string} Name - Nome do usuário.
 * @param {string} JobTitle - Cargo do usuário.
 */
export default function NavBar() {
	/**
	 * Variáveis de referência e estado utilizadas para acessar elementos do DOM neste componente.
	 */
	const themeOption = useRef(null);
	const dropContent = useRef(null);
	const name = useRef("");
	const jobTitle = useRef("");
	const helpdeskGroup = useRef("");

	const [loading, setLoading] = useState(true);
	const [dashboardHref, setDashboardHref] = useState("/dashboard/ti");

	// UseEffect para obter dados do usuário e calcular a rota correta do dashboard
	useEffect(() => {
		const storedDataUser = localStorage.getItem("dataInfo");
		if (storedDataUser === null || storedDataUser === "null") {
			window.location.href = `/login?next=${encodeURIComponent(
				window.location.pathname,
			)}`;
			return;
		}
		const dataUserInfo = storedDataUser
			? JSON.parse(storedDataUser).data
			: null;
		name.current = dataUserInfo?.name || "";
		jobTitle.current = dataUserInfo?.job_title || "";
		helpdeskGroup.current = dataUserInfo?.helpdesk || "";

		// Define a rota do dashboard dinamicamente com base nos grupos do usuário,
		// garantindo que técnicos fiscais sejam direcionados a /dashboard/fiscal.
		const storedGroups =
			localStorage.getItem("groups") || sessionStorage.getItem("groups");
		const groups = storedGroups
			? JSON.parse(storedGroups)
			: dataUserInfo?.groups || [];

		const hasTI = groups.some(
			(g) => g === "Helpdesk_Technician_TI" || g === "Helpdesk_Leader_TI",
		);
		const hasFiscal = groups.some((g) => g === "Helpdesk_Technician_Fiscal");

		if (hasTI && hasFiscal) {
			helpdeskGroup.current = "";
		}

		if (hasFiscal && !hasTI) {
			setDashboardHref("/dashboard/fiscal");
		} else {
			setDashboardHref("/dashboard/ti");
		}

		setLoading(false);
	}, []);

	/**
	 * Evento de clique utilizado para ocultar ou exibir um elemento.
	 * - Este evento é adicionado ao elemento raiz da aplicação (id="root").
	 * - Verifica se o clique ocorreu fora de certos elementos específicos e oculta o elemento de conteúdo suspenso.
	 * - Se o elemento de conteúdo suspenso não estiver visível, ele é ocultado.
	 */
	document.getElementById("root").addEventListener("click", (event) => {
		if (
			event.target.id !== "btn-drop" &&
			event.target.id !== "drop-content" &&
			event.target.id !== "img-drop" &&
			event.target.id !== "drop-content-2" &&
			event.target.id !== "btn3" &&
			event.target.id !== "btn2" &&
			event.target.id !== "btn1" &&
			event.target.id !== "btn-1-image" &&
			event.target.id !== "drop-dwn-2"
		) {
			if (
				dropContent &&
				!dropContent.current.classList.contains("visually-hidden")
			) {
				dropContent.current.classList.add("visually-hidden");
				if (themeOption.current) {
					themeOption.current.classList.add("visually-hidden");
				}
				const btn = document.getElementById("btn-drop");
				if (btn) {
					btn.classList.remove("tw-bg-[#f8f9fa]", "tw-text-black");
					btn.classList.add(
						"tw-bg-transparent",
						"tw-text-[var(--bs-nav-link-color)]",
					);
				}
				return;
			} else {
				return;
			}
		}
		return;
	});

	/**
	 * Função acionada ao clicar na aba de sair.
	 * - Obtém um token CSRF e realiza uma solicitação POST para sair do sistema.
	 * - Se a solicitação for bem-sucedida, redireciona para a tela de login.
	 */
	async function Exit() {
		try {
			const tokenResponse = await fetch("/helpdesk/get-token/", {
				method: "GET",
				credentials: "same-origin",
				headers: { Accept: "application/json" },
			});

			if (!tokenResponse.ok) {
				throw new Error("Não foi possível obter o token CSRF.");
			}

			const { token } = await tokenResponse.json();
			const logoutResponse = await fetch("/helpdesk/exit/", {
				method: "POST",
				credentials: "same-origin",
				headers: {
					Accept: "text/html",
					"X-CSRFToken": token,
				},
			});

			if (!logoutResponse.ok) {
				throw new Error("Não foi possível encerrar a sessão.");
			}

			for (const storage of [localStorage, sessionStorage]) {
				storage.removeItem("dataInfo");
				storage.removeItem("roles");
				storage.removeItem("groups");
			}

			window.location.replace("/");
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
		}
	}

	/**
	 * Função utilizada para expandir as opções de configuração e escondê-las quando clicado fora.
	 * @param {Object} event - Evento de clique.
	 */
	function DropD(event) {
		const btn = document.getElementById("btn-drop");
		if (
			(event.target.id === "btn-drop" &&
				dropContent.current.classList.contains("visually-hidden")) ||
			(event.target.id === "img-drop" &&
				dropContent.current.classList.contains("visually-hidden"))
		) {
			dropContent.current.classList.remove("visually-hidden");
			if (btn) {
				btn.classList.remove(
					"tw-bg-transparent",
					"tw-text-[var(--bs-nav-link-color)]",
				);
				btn.classList.add("tw-bg-[#f8f9fa]", "tw-text-black");
			}
			return;
		} else if (
			(event.target.id === "btn-drop" &&
				!dropContent.current.classList.contains("visually-hidden")) ||
			(event.target.id === "img-drop" &&
				!dropContent.current.classList.contains("visually-hidden"))
		) {
			if (dropContent.current) {
				dropContent.current.classList.add("visually-hidden");
			}
			if (themeOption.current) {
				themeOption.current.classList.add("visually-hidden");
			}
			if (btn) {
				btn.classList.remove("tw-bg-[#f8f9fa]", "tw-text-black");
				btn.classList.add(
					"tw-bg-transparent",
					"tw-text-[var(--bs-nav-link-color)]",
				);
			}
			return;
		} else if (
			(event.target.id === "btn1" &&
				themeOption.current.classList.contains("visually-hidden")) ||
			(event.target.id === "btn-1-image" &&
				themeOption.current.classList.contains("visually-hidden"))
		) {
			themeOption.current.classList.remove("visually-hidden");
			return;
		} else if (
			(event.target.id === "btn1" &&
				!themeOption.current.classList.contains("visually-hidden")) ||
			(event.target.id === "btn-1-image" &&
				!themeOption.current.classList.contains("visually-hidden"))
		) {
			themeOption.current.classList.add("visually-hidden");
			return;
		}

		return;
	}

	/**
	 * Função acionada ao selecionar o tema claro.
	 * - Armazena a escolha do tema no localStorage.
	 * - Recarrega a página para aplicar as alterações do tema.
	 */
	function ThemeLight() {
		localStorage.setItem("Theme", "light");

		return window.location.reload();
	}

	/**
	 * Função acionada ao selecionar o tema escuro.
	 * - Armazena a escolha do tema no localStorage.
	 * - Recarrega a página para aplicar as alterações do tema.
	 */
	function ThemeBlack() {
		localStorage.setItem("Theme", "black");

		return window.location.reload();
	}

	return (
		<nav className="navbar bg-primary">
			<div className="container-fluid no-wrap">
				<div className="tw-flex tw-justify-between tw-w-full">
					<div>
						<a
							className="navbar-brand tw-font-bold tw-text-[var(--light-white3)] tw-text-[1.4em]"
							href="/helpdesk"
						>
							<img
								src={Logo}
								className="tw-max-w-full tw-h-auto tw-w-12 tw-h-12"
								alt=""
							/>
							FixDesk
						</a>
					</div>
					<div className="tw-flex">
						<div className="tw-flex tw-flex-col tw-mr-[1em]">
							<span className="tw-font-bold tw-text-[var(--light-white3)]">
								{loading && (
									<CircularProgress className="wdgh20" color="success" />
								)}
								{!loading && name.current}
							</span>
							<span className="tw-font-bold tw-text-[var(--light-white3)]">
								{loading && (
									<CircularProgress className="wdgh20" color="success" />
								)}
								{!loading && jobTitle.current}
							</span>
						</div>
						<button
							className="navbar-toggler"
							type="button"
							data-bs-toggle="offcanvas"
							data-bs-target="#offcanvasNavbar"
							aria-controls="offcanvasNavbar"
							aria-label="Toggle navigation"
						>
							<span className="navbar-toggler-icon"></span>
						</button>
					</div>
				</div>
				<div
					className="offcanvas offcanvas-end"
					tabIndex={-1}
					id="offcanvasNavbar"
					role="dialog"
					aria-labelledby="offcanvasNavbarLabel"
				>
					<div className="offcanvas-header bg-primary">
						<div className="d-flex align-items-center">
							<img src={Logo} className="tw-w-12 tw-h-12" alt="" />
							<h5
								className="offcanvas-title fw-bold tw-font-bold tw-text-[var(--light-white3)]"
								id="offcanvasNavbarLabel"
							>
								FixDesk
							</h5>
						</div>
						<button
							className="tw-border-none tw-bg-transparent tw-flex tw-items-center tw-justify-center tw-w-9 tw-h-9 tw-rounded-full hover:tw-bg-white/10 active:tw-bg-white/20 tw-transition-all tw-duration-200 tw-cursor-pointer"
							type="button"
							data-bs-dismiss="offcanvas"
							aria-label="Close"
						>
							<img
								className="tw-w-5 tw-h-5 tw-opacity-80 hover:tw-opacity-100 tw-transition-all tw-duration-200"
								src={ImgClose}
								alt=""
							/>
						</button>
					</div>
					<div className="offcanvas-body bg-primary">
						<ul className="navbar-nav tw-justify-start tw-flex-grow tw-pe-3 tw-h-full tw-relative">
							<li className="nav-item">
								<a
									className="tw-cursor-pointer tw-block tw-py-2 tw-px-4 tw-rounded tw-bg-transparent tw-text-[var(--bs-nav-link-color)] hover:tw-bg-[#f8f9fa] hover:tw-text-black tw-transition-all tw-duration-200 tw-w-full tw-font-medium tw-text-[15px] tw-no-underline"
									aria-current="page"
									href="/helpdesk/"
								>
									Criar Chamado
								</a>
							</li>
							<li className="nav-item">
								<a
									className="tw-cursor-pointer tw-block tw-py-2 tw-px-4 tw-rounded tw-bg-transparent tw-text-[var(--bs-nav-link-color)] hover:tw-bg-[#f8f9fa] hover:tw-text-black tw-transition-all tw-duration-200 tw-w-full tw-font-medium tw-text-[15px] tw-no-underline"
									aria-current="page"
									href="/helpdesk/history/"
								>
									Meus Chamados
								</a>
							</li>
							<li className="nav-item">
								<a
									className="tw-cursor-pointer tw-block tw-py-2 tw-px-4 tw-rounded tw-bg-transparent tw-text-[var(--bs-nav-link-color)] hover:tw-bg-[#f8f9fa] hover:tw-text-black tw-transition-all tw-duration-200 tw-w-full tw-font-medium tw-text-[15px] tw-no-underline"
									aria-current="page"
									href={dashboardHref}
								>
									Dashboard
									{helpdeskGroup.current ? ` (${helpdeskGroup.current})` : ""}
								</a>
							</li>
							<li className="nav-item tw-flex tw-justify-center tw-w-full">
								<div className="tw-w-full tw-relative tw-inline-block">
									<button
										type="button"
										className="tw-cursor-pointer tw-select-none tw-w-full tw-flex tw-items-center tw-justify-between tw-py-2 tw-px-4 tw-rounded tw-bg-transparent tw-text-[var(--bs-nav-link-color)] hover:tw-bg-[#f8f9fa] hover:tw-text-black tw-transition-all tw-duration-200 tw-border-none tw-font-medium tw-text-[15px]"
										onClick={DropD}
										id="btn-drop"
									>
										<span>Configuração</span>
										<img
											className="tw-w-4 tw-h-4 tw-transition-transform tw-duration-200"
											src={ArrowDown}
											alt="seta para abrir configurações"
											id="img-drop"
										/>
									</button>
									<div
										id="drop-content"
										className="visually-hidden tw-absolute tw-left-0 tw-mt-2 tw-w-full tw-bg-white tw-rounded-lg tw-shadow-[0px_8px_24px_rgba(0,0,0,0.12)] tw-border tw-border-gray-100 tw-p-2 tw-z-[10] tw-flex tw-flex-col tw-gap-1"
										ref={dropContent}
									>
										<a
											className="tw-cursor-pointer tw-select-none tw-w-full tw-flex tw-items-center tw-justify-between tw-py-2 tw-px-3 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-50 tw-rounded-md tw-transition-colors tw-no-underline tw-font-medium"
											href="/gerenciar-usuarios"
											id="btn-user-management"
										>
											<span>Usuários</span>
										</a>
										<div
											id="drop-dwn-2"
											className="tw-w-full tw-relative tw-inline-block"
										>
											<button
												type="button"
												className="tw-cursor-pointer tw-select-none tw-w-full tw-flex tw-items-center tw-justify-between tw-py-2 tw-px-3 tw-text-sm tw-text-gray-700 hover:tw-bg-gray-50 tw-rounded-md tw-transition-colors tw-border-none tw-bg-transparent tw-font-medium"
												id="btn1"
												onClick={DropD}
											>
												<span>Tema</span>
												<img
													className="tw-w-3.5 tw-h-3.5"
													src={ArrowDown}
													alt="seta para abrir temas"
													id="btn-1-image"
												/>
											</button>
											<div
												id="drop-content-2"
												className="visually-hidden tw-mt-1 tw-w-full tw-bg-gray-50 tw-border tw-border-gray-100 tw-rounded-md tw-p-1 tw-flex tw-flex-col tw-gap-0.5 tw-z-[20]"
												ref={themeOption}
											>
												<button
													type="button"
													className="tw-cursor-pointer tw-select-none tw-w-full tw-text-left tw-py-1.5 tw-px-3 tw-text-xs tw-text-gray-600 hover:tw-bg-gray-200 hover:tw-text-gray-900 tw-rounded tw-transition-colors tw-border-none tw-bg-transparent tw-font-normal"
													id="btn2"
													onClick={ThemeLight}
												>
													Claro
												</button>
												<button
													type="button"
													className="tw-cursor-pointer tw-select-none tw-w-full tw-text-left tw-py-1.5 tw-px-3 tw-text-xs tw-text-gray-600 hover:tw-bg-gray-200 hover:tw-text-gray-900 tw-rounded tw-transition-colors tw-border-none tw-bg-transparent tw-font-normal"
													id="btn3"
													onClick={ThemeBlack}
												>
													Escuro
												</button>
											</div>
										</div>
									</div>
								</div>
							</li>
							<li className="nav-item tw-absolute tw-bottom-4 tw-left-4 tw-right-4">
								<button
									type="button"
									className="tw-cursor-pointer tw-bg-[var(--crimson-red)] hover:tw-bg-[#a81c1c] active:tw-scale-[0.98] tw-transition-all tw-duration-200 tw-font-semibold tw-block tw-py-2.5 tw-px-4 tw-rounded-lg tw-text-white tw-text-center tw-w-full tw-border-none tw-shadow-sm"
									onClick={Exit}
								>
									Sair
								</button>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</nav>
	);
}
