import NavBar from "../components/general/navbar";
import Loading from "../components/loading/loading";
import Info from "../components/utility/info";
import Message from "../components/utility/message";
import Cloud from "../images/components/cloud-uploading.png";
import File from "../images/components/upload-de-arquivo.png";
import Exclude from "../images/components/lixo.png";
import "react-day-picker/dist/style.css";
import { useContext, useEffect, useRef, useState } from "react";
import "../styles/bootstrap/css/bootstrap.css";
import "../styles/dragAndDrop.css";
import TicketsOptions from "../components/ticket/ticketsOptions";
import { MessageContext } from "../context/MessageContext";
import { OptionsContext } from "../context/OptionsContext";
import api from "../services/api";
import { logErrorFrontend } from "../services/errorLogger";

export default function Helpdesk() {
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

	useEffect(() => {
		// Este useEffect é executado uma vez após o componente ser montado.
		// O array de dependências vazio ([]) garante que o código dentro deste useEffect
		// seja executado apenas na montagem inicial do componente e não em atualizações subsequentes.

		// Define o título da página
		document.title = "Abrir Chamado";

		// Recupera o tema armazenado no localStorage
		const theme = localStorage.getItem("Theme");

		// Se o tema for "light", aplica o tema claro
		if (theme === "light") {
			ThemeLight();
		} else {
			// Caso contrário, define o tema como "black" e aplica o tema preto
			// Isso cobre o caso onde o tema é "null" ou qualquer outro valor que não seja "light"
			localStorage.setItem("Theme", "black");
			ThemeBlack();
		}
	}, []); // Array de dependências vazio

	// Declarando variáveis de estado String
	const [nameOnDropFiles, setNameOnDropFiles] = useState("");
	const [nameOnInutFiles, setNameOnInputFiles] = useState("");
	const [theme, setTheme] = useState("");
	const [themeTicket, setThemeTicket] = useState("");

	// Contexto das Opções Selecionadas
	const {
		messagetitle,
		sector,
		setAlertVerify,
		alertverify,
		alert,
		selectedDay,
		messageinfo1,
		messageinfo2,
		messageinfo3,
		linkAcess,
		machineAlocate,
		respectiveArea,
		problemn,
		occurrence,
		setReset,
	} = useContext(OptionsContext);

	// Contesto das Menssagens
	const { typeError, messageError, setMessage, message } =
		useContext(MessageContext);

	// Declarando variaveis de estado Boolean
	const [dashboard, setDashboard] = useState(false);
	const [fileSizeNotify, setFileSizeNotify] = useState(false);
	const [info, setInfo] = useState(false);
	const [inputDropControl, setInputDropControl] = useState(true);
	const [inputManualControl, setInputManualControl] = useState(false);
	const [loading, setLoading] = useState(true);

	// Declarando variaveis de estado Vazias
	const [dataUser, setdataUser] = useState();

	// Declarando varaiveis de estado array
	const [fileimg, setFileImg] = useState([]);
	const [fileName, setFileName] = useState([]);

	// Declarando Variaveis Null
	const observationRef = useRef(null);
	const primaryContainerRef = useRef(null);

	// Variáveis de Referência String
	const csrfToken = useRef("");
	const infoClass = useRef("");
	const infoClass2 = useRef("");
	const observation = useRef("");

	// Variáveis de Referência Array
	const arrayInput = useRef([]);
	const file_name = useRef([]);

	// Variáveis de Referência Int
	const infoID = useRef(0);

	// Função que muda o tema pra escuro
	function ThemeBlack() {
		setThemeTicket("");
		setTheme("themeBlack");
	}

	// Função que muda o tema para claro
	function ThemeLight() {
		setThemeTicket("themeLightTicket");
		setTheme("themeLight");
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await api.get("get-token/");
				const data = response.data;
				csrfToken.current = data.token;

				// Processa dados do localStorage com segurança
				const storedDataUser = localStorage.getItem("dataInfo");
				if (storedDataUser === null || storedDataUser === "null") {
					window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
					return;
				}
				const dataUserInfo = storedDataUser
					? JSON.parse(storedDataUser).data
					: null;
				setdataUser(dataUserInfo);
			} catch (error) {
				logErrorFrontend(
					error.message || "Erro na solicitação",
					error.stack || String(error),
				);
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		// Verifica se dataUser existe e contém pelo menos uma chave
		if (dataUser && Object.keys(dataUser).length > 0) {
			// Atualiza os estados somente se a condição for atendida
			setLoading(false);
			setDashboard(true);
		}
	}, [dataUser]); // Dependência de dataUser para atualizar o efeito quando dataUser mudar

	// Função para dicionar um zero a esquerda
	function AddZero(numero) {
		if (numero < 10) {
			return `0${numero}`;
		}
		return numero;
	}

	// Função inicia quando dashboard é renderizado, realiza animação e funcionalidade para imagens adicionadas quando soltadas
	useEffect(() => {
		if (dashboard === true) {
			//DOM
			const $ = document.querySelector.bind(document);

			//APP
			const App = {};
			App.init = (() => {
				//Init
				function handleFileSelect(evt) {
					evt.preventDefault();

					// Verifica se é o Firefox
					const isFirefox = navigator.userAgent
						.toLowerCase()
						.includes("firefox");

					// Obtém os arquivos dependendo do navegador
					const files = isFirefox
						? Array.from(evt.dataTransfer.items)
								.map((item) => item.getAsFile())
								.filter((file) => file)
						: evt.target.files;

					if (!files || files.length <= 0) {
						return;
					}

					// Template dos arquivos (aqui assumimos que os arquivos têm `name` para o template)
					const template = `${Object.keys(files)
						.map((fileIndex) => files[fileIndex].name)
						.join("")}`;

					document.querySelector("#drop").classList.add("hidden");
					document.querySelector("footer").classList.add("hasFiles");
					document.querySelector(".importar").classList.add("active");

					setTimeout(() => {
						document.querySelector("#list-files").innerHTML = template;
					}, 1000);

					Object.keys(files).forEach((fileIndex) => {
						const load = 2000 + fileIndex * 2000; // Simula um carregamento

						setTimeout(() => {
							const fileElement = document.querySelector(`.file--${fileIndex}`);
							if (fileElement) {
								fileElement
									.querySelector(".progress")
									.classList.remove("active");
								fileElement.querySelector(".done").classList.add("anim");
							}
						}, load);
					});
				}

				// drop events
				$("#drop").ondragleave = (evt) => {
					$("#drop").classList.remove("active");
					$("#divider").classList.remove("overflow-hidden");
					evt.preventDefault();
				};
				$("#drop").ondragover = $("#drop").ondragenter = (evt) => {
					$("#drop").classList.add("active");
					evt.preventDefault();
				};
				$("#drop").ondrop = (evt) => {
					for (let i = 0; i < evt.dataTransfer.files.length; i++) {
						setFileImg((itens) => [...itens, evt.dataTransfer.files[i]]);
					}

					$("footer").classList.add("hasFiles");
					$("#divider").classList.remove("overflow-hidden");
					$("#divider").classList.add("line-top");
					$("#drop").classList.remove("active");
					evt.preventDefault();
				};

				//upload more
				$(".importar").addEventListener("click", () => {
					// $("#list-files").innerHTML = "";
					$("footer").classList.remove("hasFiles");
					$(".importar").classList.remove("active");
					setTimeout(() => {
						$("#drop").classList.remove("hidden");
					}, 500);
				});

				// input change
				$("input[type=file]").addEventListener("change", handleFileSelect);
			})();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dashboard]);

	/**
	 * Esta função é responsável por enviar um novo ticket de chamado.
	 *
	 * @param {Event} event - O evento associado ao envio do formulário ou à ação que aciona a função.
	 * @returns {Promise<void>} - Esta função realiza o envio do ticket de chamado.
	 */
	async function SubmitTicket(event) {
		event.preventDefault();
		try {
			if (respectiveArea.current.length === 0) {
				setAlertVerify(true);
				messagetitle.current = "Selecione a Área Responsável pelo Chamado";
				return;
			}
			if (sector.current.length === 0) {
				setAlertVerify(true);
				messagetitle.current = "Selecione um tipo de ocorrencia";
				return;
			}
			if (occurrence.current.length === 0) {
				setAlertVerify(true);
				messagetitle.current = "Selecione um tipo de problema";
				return;
			}
			if (problemn.current.length === 0) {
				setAlertVerify(true);
				messagetitle.current = "Selecione o problema em especifico";
				return;
			}
			setAlertVerify(false);

			const dataUserAtual = new Date();
			const dia = String(dataUserAtual.getDate()).padStart(2, "0");
			const mes = String(dataUserAtual.getMonth() + 1).padStart(2, "0");
			const ano = dataUserAtual.getFullYear();
			const horaFormatada = `${AddZero(dataUserAtual.getHours())}:${AddZero(dataUserAtual.getMinutes())}`;
			const dataUserFormatada = `${ano}-${mes}-${dia} ${horaFormatada}`;

			const NewDatesAlocate = [];
			const formdataUser = new FormData();
			let total_size = 0;

			if (fileName.length > 0) {
				for (let i = 0; i < fileimg.length; i++) {
					const file = fileimg[i];
					total_size += file.size;
					formdataUser.append("image", file);
				}
			}
			if (selectedDay.current.length > 0) {
				for (const dateObj of selectedDay.current) {
					const day = dateObj.getDate().toString().padStart(2, "0");
					const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
					const year = dateObj.getFullYear();
					const dateFormated = `${year}-${month}-${day}`;
					NewDatesAlocate.push(dateFormated);
				}
				formdataUser.append("id_equipament", machineAlocate.current);
				formdataUser.append("days_alocated", NewDatesAlocate);
			}

			if (total_size > 10 * 1024 * 1024) {
				setMessage(true);
				typeError.current = "Capacidade Máxima Ultrapassada";
				messageError.current =
					"Capacidade Máxima de Arquivos Anexado é de 20MB";
				return;
			}
			formdataUser.append("ticketRequester", dataUser.name);
			formdataUser.append("department", dataUser.departament);
			if (dataUser.departament.length === 0) {
				messageError.current =
					"Informar TI para atualizar localidade {Departament}";
				typeError.current = "Falta de Dados";
				setMessage(true);
				return;
			}
			formdataUser.append("mail", dataUser.mail);
			if (dataUser.mail.length === 0) {
				messageError.current = "Informar TI para atualizar localidade {Mail}";
				typeError.current = "Falta de Dados";
				setMessage(true);
				return;
			}
			if (dataUser.company.length === 0) {
				messageError.current =
					"Informar TI para atualizar localidade {Company}";
				typeError.current = "Falta de Dados";
				setMessage(true);
				return;
			}
			formdataUser.append("company", dataUser.company);
			formdataUser.append("sector", sector.current);
			formdataUser.append("occurrence", occurrence.current);
			formdataUser.append("problemn", problemn.current);
			if (observation.current.length < 2) {
				messageError.current =
					"Obrigatório Escrever Obversação conforme o chamado";
				typeError.current = "Falta de Dados";
				setMessage(true);
				return;
			}
			formdataUser.append("observation", observation.current);
			formdataUser.append("start_date", dataUserFormatada);
			formdataUser.append("respective_area", respectiveArea.current);

			const response = await api.post("submit-ticket/", formdataUser, {
				headers: {
					"X-CSRFToken": csrfToken.current,
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.status === 200) {
				const data = response.data;
				resetInfos();
				infoID.current = data.id;
				infoClass.current = "animate__lightSpeedInRight";
				infoClass2.current = "closeInfo";
				setInfo(true);
				if (data.denied_files && data.denied_files.length > 0) {
					typeError.current = "Tipo de Arquivo";
					messageError.current = `Arquivos Negados: ${data.denied_files}`;
					setMessage(true);
				}
				setTimeout(() => {
					setInfo(false);
				}, 6000);
			}
		} catch (err) {
			logErrorFrontend(
				err.message || "Erro ao cadastrar chamado",
				err.stack || String(err),
			);
		}
	}

	// Reseta variaveis
	function resetInfos() {
		observation.current = "";
		observationRef.current.value = "";
		setReset(true);
		setNameOnInputFiles("");
		setNameOnDropFiles("");
		setFileSizeNotify(false);
		setFileImg([]);
		setFileName([]);
		file_name.current = [];
		arrayInput.current = [];
	}

	function InputDrop() {
		try {
			setInputDropControl(true);
			setInputManualControl(false);
			file_name.current = fileimg.map((fileItem) => fileItem.name);
			setFileName(file_name.current);

			const paragraphs = file_name.current.map((fileName, index) => {
				const file = fileimg[index];
				const fileKey = file
					? `${file.name}-${file.lastModified}-${file.size}`
					: index;
				return (
					<div
						className="tw-flex tw-justify-center tw-items-center tw-w-full"
						key={fileKey}
					>
						<div className="text-break tw-mr-[1em]">{fileName}</div>
						<div>
							{(() => {
								const file = fileimg[index];
								const sizeInBytes = file.size;
								let size;
								let unit;

								if (sizeInBytes >= 1024 * 1024) {
									size = sizeInBytes / (1024 * 1024);
									unit = "MB";
								} else {
									size = sizeInBytes / 1024;
									unit = "KB";
								}

								return `${size.toFixed(2)} ${unit}`;
							})()}
						</div>
						<button
							className="tw-border-none tw-bg-transparent"
							type="button"
							onClick={() => {
								fileimg.splice(index, 1);
								InputDrop();
								const divider = document.getElementById("divider");
								divider.classList.remove("line-top");
							}}
						>
							<img
								className="tw-w-[2.2em]"
								src={Exclude}
								alt="Excluir arquivo"
							/>
						</button>
					</div>
				);
			});

			const Div = <div className="w-100">{paragraphs}</div>;

			setNameOnDropFiles(Div);
			setFileSizeNotify(true);
		} catch (err) {
			return console.error(err);
		}
	}

	// Apos enviar um arquivo para upload é chamado essa função que mostra qual arquivo foi anexado
	// e seu tamanho
	function InputManual(event) {
		try {
			setInputManualControl(true);

			const files = event.target.files;

			const fileList = Array.from(files);
			arrayInput.current = fileList;

			const drop = document.getElementById("drop");
			drop.classList.add("hidden");
			const divider = document.getElementById("divider");
			divider.classList.add("line-top");

			const paragraphs = fileList.map((file, index) => (
				<div
					className="tw-flex tw-justify-center tw-items-center tw-w-full"
					key={`${file.name}-${file.size}-${file.lastModified}`}
				>
					<div className="text-break tw-mr-[1em]">{file.name}</div>
					<div>
						{(() => {
							const file = fileList[index];
							const sizeInBytes = file.size;
							let size;
							let unit;

							if (sizeInBytes >= 1024 * 1024) {
								size = sizeInBytes / (1024 * 1024);
								unit = "MB";
							} else {
								size = sizeInBytes / 1024;
								unit = "KB";
							}

							return `${size.toFixed(2)} ${unit}`;
						})()}
					</div>
					<button
						className="tw-border-none tw-bg-transparent"
						type="button"
						onClick={() => {
							const drop = document.getElementById("drop");
							drop.classList.remove("hidden");
							const divider = document.getElementById("divider");
							divider.classList.remove("line-top");
							RemoveFile(index);
						}}
					>
						<img className="tw-w-[2.2em]" src={Exclude} alt="Excluir arquivo" />
					</button>
				</div>
			));

			setNameOnInputFiles(paragraphs);
			setFileSizeNotify(true);
		} catch (err) {
			return console.error(err);
		}
	}

	// Função que remove arquivo anexado para upload
	function RemoveFile(indexToRemove) {
		try {
			if (arrayInput.current.length < 1) {
				setNameOnInputFiles("");
				setInputManualControl(false);
				return;
			}

			const updatedFiles = arrayInput.current.filter(
				(_, index) => index !== indexToRemove,
			);
			arrayInput.current = updatedFiles;

			const updatedParagraphs = updatedFiles.map((file, index) => (
				<div
					className="tw-flex tw-justify-center tw-items-center tw-w-full"
					key={`${file.name}-${file.size}-${file.lastModified}`}
				>
					<div className="text-break tw-mr-[1em]">{file.name}</div>
					<button
						className="tw-border-none tw-bg-transparent"
						type="button"
						onClick={() => RemoveFile(index)}
					>
						<img className="tw-w-[2.2em]" src={Exclude} alt="Excluir arquivo" />
					</button>
				</div>
			));

			const drop = document.getElementById("drop");
			drop.classList.add("hidden");
			const divider = document.getElementById("divider");
			divider.classList.add("line-top");

			setNameOnInputFiles(updatedParagraphs);
		} catch (err) {
			return console.error(err);
		}
	}

	return (
		<div
			className={`!tw-h-screen tw-w-screen tw-absolute !tw-overflow-x-hidden ${theme}`}
		>
			<NavBar />
			{info && (
				<Info
					id={infoID.current}
					cls={infoClass.current}
					cls2={infoClass2.current}
					funct={() => {
						setInfo(false);
					}}
				/>
			)}
			{loading && (
				<div className="position-absolute top-50 start-50 translate-middle">
					<Loading />
				</div>
			)}
			{message && (
				<div className="position-fixed top-50 start-50 translate-middle z-3">
					<Message
						CloseMessage={() => {
							setMessage(false);
						}}
					/>
				</div>
			)}
			{dashboard && (
				<form
					className={`mx-auto d-flex flex-column align-items-center justify-content-around tw-w-[80%] tw-min-h-[80%] tw-bg-[var(--light-white2)] tw-rounded-[1em] tw-mt-[2em] tw-mb-[2em] tw-p-[1em] ${themeTicket}`}
					ref={primaryContainerRef}
					onSubmit={(e) => e.preventDefault()}
				>
					<h2 className="tw-text-[2.3em] tw-font-bold tw-font-['Lugrasimo',cursive] tw-text-center tw-text-[var(--pure-black)]">
						Criação de Chamados
					</h2>
					<div className="mb-3 tw-w-[320px]">
						<input type="hidden" name="_csrf" value={csrfToken.current} />
						<label htmlFor="nameInput" className="form-label">
							Nome
						</label>
						<input
							type="name"
							className="form-control tw-w-[320px]"
							id="nameInput"
							value={dataUser.name}
							disabled
						/>
					</div>
					<div className="mb-3 tw-w-[320px]">
						<label htmlFor="departmentInput" className="form-label">
							Departamento
						</label>
						<input
							type="text"
							className="form-control tw-w-[320px]"
							id="departmentInput"
							value={dataUser.departament || ""}
							disabled={dataUser.departament}
						/>
					</div>
					<div className="mb-3 tw-w-[320px]">
						<label htmlFor="mailInput" className="form-label">
							Email
						</label>
						<input
							type="text"
							className="form-control tw-w-[320px]"
							id="mailInput"
							value={dataUser.mail || ""}
							disabled={dataUser.mail}
						/>
					</div>
					<div className="mb-3 tw-w-[320px]">
						<label htmlFor="companyInput" className="form-label">
							Empresa
						</label>
						<input
							type="text"
							className="form-control tw-w-[320px]"
							id="companyInput"
							value={dataUser.company || ""}
							disabled={dataUser.company}
						/>
					</div>
					<TicketsOptions />
					{alert && (
						<div className="alert alert-info d-flex flex-column" role="alert">
							<h5 className="fw-bold text-center">{messagetitle.current}</h5>
							<span>{messageinfo1.current}</span>
							<a
								href={linkAcess.current}
								target="_blank"
								rel="noopener noreferrer"
								hidden={!linkAcess.current}
							>
								Formulário Lupatech
							</a>
							<span>{messageinfo2.current}</span>
							<span>{messageinfo3.current}</span>
						</div>
					)}
					{alertverify && (
						<div className="alert alert-danger" role="alert">
							<h5 className="fw-bold">{messagetitle.current}</h5>
						</div>
					)}
					<div className="d-flex flex-column">
						<div className="form-floating mb-3 mx-auto tw-w-[320px]">
							<textarea
								ref={observationRef}
								className="form-control !tw-h-[8em] tw-w-[320px] tw-resize-none"
								id="floatingTextarea2"
								onChange={(event) => {
									observation.current = event.target.value;
								}}
							></textarea>
							<label htmlFor="floatingTextarea2">Observação</label>
						</div>
						<h3 className="text-center mt-1">Upload de Arquivo</h3>
						<div className="upload tw-relative tw-box-border tw-rounded-[0.5em] tw-shadow-[0_2px_5px_rgba(var(--pure-black),0.2)] tw-bg-[var(--pure-white)] tw-translate-y-[2em] tw-opacity-0">
							<div className="upload-files">
								<header className="tw-bg-[var(--ocean-green)] tw-rounded-t-[0.5em] tw-text-center tw-h-[10em] tw-flex tw-p-[1.2em]">
									<p className="position-relative pointer w-100 h-100 tw-text-[var(--pure-white)] tw-text-[4em]">
										<img
											className="tw-w-[1.5em] tw-mr-[1em]"
											src={Cloud}
											alt=""
										/>
										<input
											className="w-100 h-100 position-absolute pointer tw-opacity-0 !tw-z-10 tw-top-0 tw-left-0 tw-cursor-pointer tw-absolute tw-w-full tw-h-full"
											type="file"
											multiple
											onChange={InputManual}
										/>
										<span className="up tw-font-bold tw-translate-x-[-2em] tw-inline-block tw-mr-[1em]">
											up
										</span>
										<span className="load tw-inline-block tw-font-thin tw-ml-[-0.7em] tw-translate-x-[-2em]">
											load
										</span>
									</p>
								</header>
								<section
									className="tw-text-center tw-pt-[5em] tw-pb-[3em] tw-px-0 tw-relative"
									id="drop"
									onDrop={() => InputDrop()}
									aria-label="Área de upload de arquivos"
								>
									<img className="tw-w-[10em]" src={File} alt="" />
									<p className="pointer-none tw-text-[1em] tw-pt-[1em] tw-leading-[1.4]">
										<b className="tw-text-[var(--ocean-green)]">
											Arraste e Solte
										</b>
										os arquivos aqui para fazer upload{" "}
									</p>
									<input
										className="tw-invisible"
										type="file"
										id="inputManual"
										multiple
									/>
								</section>
								<footer id="footerFiles" className="tw-mb-[1em] tw-text-center">
									<div
										className="divider overflow-hidden tw-mx-auto tw-w-0 tw-border-t tw-border-solid tw-border-gray-200 tw-transition-[width] tw-duration-500"
										id="divider"
									/>
									{inputDropControl && (
										<div
											className="list-files tw-w-[320px] tw-mx-auto tw-mt-[15px] tw-text-center tw-overflow-x-hidden"
											id="list-files"
										>
											{nameOnDropFiles}
										</div>
									)}
									{inputManualControl && (
										<div className="tw-w-[320px] tw-mx-auto tw-mt-[15px] tw-text-center tw-overflow-x-hidden">
											{nameOnInutFiles}
										</div>
									)}
									{fileSizeNotify && (
										<div className="mt-2">
											Limite Máximo de arquivo é de 20MB
										</div>
									)}
								</footer>
							</div>
						</div>
					</div>
					<input
						type="submit"
						className="importar btn btn-primary mt-3 mb-3"
						onClick={SubmitTicket}
						value={"Enviar"}
					/>
				</form>
			)}
		</div>
	);
}
