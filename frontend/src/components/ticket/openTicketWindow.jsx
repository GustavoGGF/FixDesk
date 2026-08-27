import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MessageContext } from "../../context/MessageContext";
import { TicketContext } from "../../context/TicketContext";
import downTick from "../../images/components/attachment.png";
import closeIMG from "../../images/components/close.png";
import excludeImage from "../../images/components/close.png";
import setingIMG from "../../images/components/definicoes.png";
import downloadImage from "../../images/components/download.png";
import { TextObersavation } from "../../styles/dashboardTI/dashboardTI";

import {
	AdjustListFiles,
	BtnChat,
	BtnChat2,
	BtnNF,
	Close,
	CloseBTN,
	DivChat,
	DivColorGray,
	DivHR,
	DivNewFiles,
	DivOnBoardFile,
	IMGFiles,
	ImageFile,
	ImgBTNCls,
	InputFile,
	PChat,
	PChatHourL,
	PChatHourR,
	PNWFile,
	TicketOpen,
	UChat1,
	UChat2,
} from "../../styles/ticket/ticketWindow";
import { ImgMachines } from "../../styles/ticketsOptionsStyle";
import { handleDownload } from "../../utils/downloadFile";
import { fileTypeConfig } from "../../utils/fileTypes";

export default function OpenTicketWindow({
	helpdesk,
	ticketID,
	token,
	CloseTicket,
	ticketNAME,
	ticketDEPARTMENT,
	ticketMAIL,
	ticketCOMPANY,
	ticketOCCURRENCE,
	ticketPROBLEMN,
	ticketSECTOR,
	ticketAREA,
	equipament,
	dateAlocate,
	lifeTime,
	ticketResponsible_Technician,
	initialFileticket,
	showEquipament,
	observation,
	chat,
	fetchchat,
	userName,
	userMail,
	initialFileData,
	initialFileName,
	initialContentFile,
	mountDataChat,
	mountInitialChat,
	techsNames,
}) {
	// Variável de Estado Boolean
	const [isAtButton, setIsAtButton] = useState(false);
	const [newFiles, setNewFiles] = useState(false);
	const [imageopen, setImageOpen] = useState(false);
	// Variável de Estado Number
	const [initUpdateChat, setInitUpdateChat] = useState(0);
	// Variável de Estado String
	const [selectedTech, setSelectedTech] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [modelName, setModelName] = useState("");
	const [dateEquipament, setDateEquipament] = useState("");
	// Variável de Estado Array
	const [uploadNewFiles, setUploadNewFiles] = useState([]);
	const [fileticket, setFileTicket] = useState([]);
	const [mountChat, setMountChat] = useState(mountInitialChat);
	const [nameNWFiles, setNameNWFiles] = useState([]);

	const techs = Array.isArray(techsNames)
		? techsNames
		: techsNames?.[ticketAREA]
			? techsNames[ticketAREA]
			: [];
	const softGray = "#e9ecef";
	// Variável de Referência Null
	const textareaRef = useRef(null);
	const chatDiv = useRef(null);
	const inputChat = useRef(null);
	const ticketRef = useRef(null);
	const ticketOpen = useRef(null);
	const dropCont = useRef(null);
	// Variável de Referência Number
	const countchat = useRef(0);
	const count = useRef(0);
	// Variável de Referência String
	const textChat = useRef("");

	const {
		setTicketWindowAtt,
		setChangeTech,
		setChangeStatus,
		setReloadFilter,
		setForcedLoad,
		techDetails,
		setTechDetails,
	} = useContext(TicketContext);
	const { setMessageError, setMessage, setTypeError } =
		useContext(MessageContext);

	let timeoutId;
	const UpNwfile = [];

	const handleEscape = useCallback(
		(event) => {
			if (event.key === "Escape" || event.keyCode === 27) {
				try {
					if (imageopen) {
						ticketRef.current.style.filter = "blur(0)";
						ticketRef.current.style.background = "var(--pure-white)";
						ticketOpen.current.style.overflowY = "auto";
						setImageOpen(false);
						return;
					}

					if (techDetails) {
						setTechDetails(false);
						return;
					}

					if (
						dropCont.current &&
						!dropCont.current.classList.contains("visually-hidden")
					) {
						dropCont.current.classList.add("visually-hidden");
						return;
					}

					setTicketWindowAtt(true);
				} catch (err) {
					return console.error(err);
				}
			}
		},
		[techDetails, imageopen, setTechDetails, setImageOpen, setTicketWindowAtt],
	);

	const handleCloseConfigs = useCallback(
		(event) => {
			if (
				(event.target.id === "drp" &&
					dropCont.current.classList.contains("visually-hidden")) ||
				(event.target.id === "imd" &&
					dropCont.current.classList.contains("visually-hidden"))
			) {
				return dropCont.current.classList.remove("visually-hidden");
			} else if (
				event.target.id === "dropContTicketWd" ||
				event.target.id === "selectTech"
			) {
				return;
			} else {
				return dropCont.current.classList.add("visually-hidden");
			}
		},
		[dropCont],
	);

	useEffect(() => {
		document.addEventListener("click", handleCloseConfigs);
		return () => document.removeEventListener("click", handleCloseConfigs);
	}, [handleCloseConfigs]);

	// Setando se pode ou não copiar as informações do chamado
	const pointer = helpdesk === "dashboard" ? "pointer-auto" : "";

	useEffect(() => {
		if (dateAlocate && dateAlocate.length !== 0) {
			const formatDates = (dateString) => {
				try {
					const dates = dateString.split(",").map((date) => new Date(date));

					// Ordena as datas para garantir que estejam em sequência correta
					dates.sort((a, b) => a - b);

					// Formata as datas para DD/MM/YYYY
					const formattedDates = dates.map((date) =>
						date.toLocaleDateString("pt-BR", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
						}),
					);

					let isConsecutive = true;

					for (let i = 1; i < dates.length; i++) {
						const diffInDays =
							(dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
						if (diffInDays !== 1) {
							isConsecutive = false;
							break;
						}
					}

					if (formattedDates.length === 1) {
						return setDateEquipament(
							`Equipamento alocado em ${formattedDates[0]}`,
						);
					}

					if (isConsecutive) {
						return setDateEquipament(
							`Equipamento alocado de ${formattedDates[0]} a ${
								formattedDates[formattedDates.length - 1]
							}`,
						);
					}

					return setDateEquipament(
						`Equipamento alocado em ${formattedDates
							.slice(0, -1)
							.join(", ")} e ${formattedDates[formattedDates.length - 1]}`,
					);
				} catch (err) {
					return console.error(err);
				}
			};
			formatDates(dateAlocate);
		}
	}, [dateAlocate]);

	useEffect(() => {
		if (showEquipament) {
			fetch(`/helpdesk/get-image/${equipament}`, {
				method: "GET",
				headers: { Accept: "application/json" },
			})
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					setModelName(data.model.trim());
				})
				.catch((err) => {
					return console.error(err);
				});
		}
	}, [equipament, showEquipament]);

	useEffect(() => {
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [handleEscape]);

	useEffect(() => {
		if (mountDataChat) {
			ReloadChat({ data: mountInitialChat });
		} else {
			chatDiv.current.style.background = softGray;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mountDataChat]);

	const stopFetchingRef = useRef(false);

	useEffect(() => {
		if (initialFileticket) {
			ReloadFiles({
				files: initialFileData,
				name_file: initialFileName,
				content_file: initialContentFile,
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialFileticket]);

	useEffect(() => {
		if (fetchchat === true && !stopFetchingRef.current) {
			fetch(`/helpdesk/update-chat/${ticketID}`, {
				method: "GET",
				headers: { Accept: "application/json" },
			})
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					if (data !== null || data !== undefined || data !== "undefined") {
						if (data.chat !== null) {
							const newChat = parseInt(data.chat.length, 10);
							if (newChat > countchat.current) {
								countchat.current = newChat;
								ReloadChat({ data: data });
							} else {
								return;
							}
						}
						return;
					}
				})
				.catch((err) => {
					return console.error(err);
				});
			return;
		}
		return;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initUpdateChat]);

	useEffect(() => {
		AddCount();
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function AddCount() {
		if (stopFetchingRef.current) {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			return;
		}
		count.current++;

		setInitUpdateChat(count.current);
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(AddCount, 10000); // Chama a função novamente após 5 segundos
	}

	useEffect(() => {
		if (chat && isAtButton && chatDiv?.current) {
			chatDiv.current.scrollTop = chatDiv.current.scrollHeight;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mountChat]);

	useEffect(() => {
		// Verifica se a referência do textarea está definida e se o valor não está vazio
		if (
			textareaRef.current &&
			observation !== undefined &&
			observation !== ""
		) {
			// Redimensiona o textarea com base no valor atual
			ResizeTextarea(textareaRef.current);
		}
		// A lista de dependências inclui ticketWindow para executar o efeito quando ticketWindow mudar
	}, [observation]); // Inclua aqui todas as dependências necessárias

	function ResizeTextarea(textarea) {
		textarea.style.height = "auto"; // reset para pegar o scrollHeight correto
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	function DownloadFile({ content, data, sliceSize = 512 }) {
		const cleanBase64 = content.replace(/[^A-Za-z0-9+/]/g, "");

		try {
			const byteCharacters = atob(cleanBase64);
			const byteArrays = [];

			for (
				let offset = 0;
				offset < byteCharacters.length;
				offset += sliceSize
			) {
				const slice = byteCharacters.slice(offset, offset + sliceSize);

				const byteNumbers = new Array(slice.length);
				for (let i = 0; i < slice.length; i++) {
					byteNumbers[i] = slice.charCodeAt(i);
				}

				const byteArray = new Uint8Array(byteNumbers);
				byteArrays.push(byteArray);
			}

			const blob = new Blob(byteArrays, { type: data });
			return blob;
		} catch (error) {
			console.error("Erro ao converter para Blob:", error);
			return null;
		}
	}

	function DownloadTicket() {
		fetch(`/helpdesk/ticket/${ticketID}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-CSRFToken": token,
				"Download-Ticket": "download Ticket",
			},
			body: JSON.stringify({ download: "download" }),
		})
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				const blob = DownloadFile({
					data: "application/pdf",
					content: data.pdf,
				});

				const url = window.URL.createObjectURL(blob);
				handleDownload(url, `Chamado: ${ticketID}`);
			})
			.catch((err) => {
				return console.error(err);
			});
	}

	async function ReloadChat({ data }) {
		let varisAtBottom;
		if (chatDiv?.current) {
			varisAtBottom =
				chatDiv.current.scrollTop + chatDiv.current.clientHeight >=
				chatDiv.current.scrollHeight;
		}
		if (
			data.chat !== null &&
			data.chat !== undefined &&
			data.chat !== "undefined"
		) {
			try {
				countchat.current = data.chat.length;

				const regex = /\[\[([^[\]]+?)\],\[([^[\]]+?)\],\[([^[\]]+?)\]\]/g;

				const chatValue = [];
				let match = regex.exec(data.chat);

				while (match !== null) {
					const [, value1, value2, value3] = match;
					chatValue.push([value1, value2, value3, `msg-${chatValue.length}`]);
					match = regex.exec(data.chat);
				}

				setMountChat([]);
				setIsAtButton(false);

				const groupedByDate = {};

				chatValue.forEach((item) => {
					const date = item[0].split(":")[1].trim(); // Extrai a data do primeiro elemento
					if (!groupedByDate[date]) {
						groupedByDate[date] = [];
					}
					groupedByDate[date].push(item);
				});
				let UserChatComponent;
				let TechChatComponent;
				let justifyContetUser;
				let justifyContetTech;

				if (helpdesk === "helpdesk") {
					UserChatComponent = UChat1;
					TechChatComponent = UChat2;
					justifyContetUser = "justify-content-end";
					justifyContetTech = "justify-content-start";
				} else if (helpdesk === "dashboard") {
					UserChatComponent = UChat2;
					TechChatComponent = UChat1;
					justifyContetUser = "justify-content-start";
					justifyContetTech = "justify-content-end";
				}

				const renderGroupedItems = () => {
					const groupedItems = [];
					for (const date in groupedByDate) {
						groupedItems.push(
							<div key={date}>
								<div className="text-center d-flex justify-content-center text-break">
									<PChat>{date}</PChat>
								</div>
								{groupedByDate[date].map((item) => {
									// Remover "User:" ou "Tech:" do início da string
									var userOrTech = item[1];
									var time = item[2].replace("Hours:", "").trim();
									if (userOrTech.includes("System")) {
										userOrTech = userOrTech.replace("System:", "").trim();
										return (
											<div key={item[3]}>
												<div className="text-center d-flex justify-content-center text-break">
													<PChat>{`${userOrTech} ${time}`}</PChat>
												</div>
											</div>
										);
									}

									if (userOrTech.includes("User")) {
										userOrTech = userOrTech.replace("User:", "").trim();
										return (
											<div key={item[3]}>
												<div
													className={`d-flex ${justifyContetUser} w-100 text-break position-relative`}
												>
													<UserChatComponent className="position-relative">
														<p style={{ whiteSpace: "pre-wrap" }}>
															{userOrTech}
														</p>
														<PChatHourR className="position-absolute bottom-0 end-0">
															{time}
														</PChatHourR>
													</UserChatComponent>
												</div>
											</div>
										);
									} else if (userOrTech.includes("Technician")) {
										userOrTech = userOrTech.replace("Technician:", "").trim();
										return (
											<div key={item[3]}>
												<div
													className={`d-flex ${justifyContetTech} w-100 text-break position-relative`}
												>
													<TechChatComponent className="position-relative">
														<p style={{ whiteSpace: "pre-wrap" }}>
															{userOrTech}
														</p>
														<PChatHourL className="position-absolute bottom-0 start-0">
															{time}
														</PChatHourL>
													</TechChatComponent>
												</div>
											</div>
										);
									}
									return null;
								})}
							</div>,
						);
					}
					return groupedItems;
				};

				if (varisAtBottom) {
					setIsAtButton(true);
				}
				setMountChat(renderGroupedItems());

				const callAsyncFunction = async () => {
					await ChangeLastVW({
						id: ticketID,
						tech: ticketResponsible_Technician,
					});
				};

				// Chama a função, mas o código segue sem esperar a execução terminar
				callAsyncFunction();
			} catch (err) {
				return console.error(err);
			}
		}
	}

	async function ChangeLastVW({ id, tech }) {
		return fetch(`/helpdesk/change-last-viewer/${id}`, {
			method: "POST",
			headers: {
				"X-CSRFToken": token, // Token CSRF para segurança da requisição
				"Cache-Control": "no-cache", // Evita o uso de cache na requisição
				"Content-Type": "application/json", // Define o formato do corpo da requisição como JSON
			},
			body: JSON.stringify({
				viewer: userName, // Nome do usuário que está visualizando o chamado
				technician: tech, // Nome do técnico associado ao chamado
				requester: "user", // Indica que a alteração foi feita por um usuário comum
			}),
		});
	}

	function NewChat(event) {
		if (event.key === "Enter") {
			if (event.shiftKey) {
				event.preventDefault();
				textChat.current = event.target.value;
				return;
			}
			SendChat();
			event.preventDefault();
			return;
		} else {
			textChat.current = event.target.value;
			return;
		}
	}

	// Função auxiliar para adicionar um zero à esquerda para números menores que 10
	function AddZero(numero) {
		if (numero < 10) {
			return `0${numero}`;
		}
		return numero;
	}

	function SendChat() {
		try {
			// Cria uma instância de data para capturar o momento atual
			const date = new Date();

			// Obtém o dia, mês e ano atuais
			const day = date.getDate();
			const month = date.getMonth() + 1; // O mês é baseado em zero, então soma-se 1
			const year = date.getFullYear();

			// Formata a data no formato DD/MM/AAAA
			const dataFormatada = `${AddZero(day)}/${AddZero(month)}/${year}`;

			// Formata a hora no formato HH:MM
			const horaFormatada = `${AddZero(date.getHours())}:${AddZero(date.getMinutes())}`;

			// Limpa o campo de entrada do chat
			inputChat.current.value = "";

			// Se o texto do chat estiver vazio, não faz nada
			if (textChat.current.length === 0) {
				return;
			}
			// Envia a mensagem do chat para o servidor
			fetch(`/helpdesk/ticket/${ticketID}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Define o tipo de conteúdo como JSON
					"X-CSRFToken": token, // Adiciona o token CSRF para segurança da requisição
				},
				body: JSON.stringify({
					helpdesk: helpdesk,
					user: userName, // Nome do usuário que está enviando a mensagem
					chat: textChat.current, // O conteúdo do chat
					hours: horaFormatada, // Hora formatada da mensagem
					date: dataFormatada, // Data formatada da mensagem
					mail: userMail,
				}),
			})
				.then((response) => {
					// Converte a resposta para JSON
					return response.json();
				})
				.then((data) => {
					textChat.current = "";
					// Atualiza a interface do chat com os novos dados
					ReloadChat({ data: data });
				})
				.catch((err) => {
					return console.error(err); // Exibe o erro no console para depuração
				});
		} catch (err) {
			return console.error(err);
		}
	}

	function SubmitNewFiles() {
		try {
			// Cria um objeto FormData para enviar os arquivos e informações adicionais
			const formData = new FormData();

			// Adiciona os arquivos selecionados ao FormData
			for (let i = 0; i < uploadNewFiles.length; i++) {
				const file = uploadNewFiles[i];

				formData.append("files", file);
			}

			// Obtém e formata a data e a hora atuais
			const date = new Date();
			const day = date.getDate();
			const month = date.getMonth() + 1;
			const year = date.getFullYear();
			const dataFormatada = `${AddZero(day)}/${AddZero(month)}/${year}`;
			const horaFormatada = `${AddZero(date.getHours())}:${AddZero(date.getMinutes())}`;

			// Adiciona a data e hora ao FormData
			formData.append("date", dataFormatada);
			formData.append("hours", horaFormatada);

			// Envia os arquivos e dados ao servidor
			fetch(`/dashboard-ti/upload-new-files/${ticketID}`, {
				method: "POST",
				headers: {
					"X-CSRFToken": token,
				},
				body: formData,
			})
				.then((response) => {
					// Converte a resposta para JSON
					return response.json();
				})
				.then(async (data) => {
					setUploadNewFiles([]);
					setNameNWFiles();
					// Atualiza o estado para indicar que não há novos arquivos
					setNewFiles(false);
					// Recarrega a visualização dos arquivos e o chat com as novas informações
					ReloadFiles({
						files: data.image_data,
						name_file: data.name_file,
						content_file: data.content_file,
					});
					// reloadChat({ data: data.chat });
				})
				.catch((err) => {
					return console.error(err);
				});
		} catch (err) {
			return console.error(err);
		}
	}

	function ReloadFiles({ files, name_file, content_file }) {
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			let imageSrc = "";
			let altImage = "";
			let blob;
			let handleShowImage = () => {};
			let handleDonwloadFile = () => {};
			let isImage = false;
			const contentFile = content_file[i];
			const nameFile = name_file[i];
			const image = file.image;

			if (typeof file === "object") {
				const extension = nameFile.split(".").pop();
				handleShowImage = () => {
					setImageUrl(`data:image/${extension};base64,${image}`);
					ticketRef.current.style.filter = "blur(4px)";
					ticketRef.current.style.background = "rgba(0, 0, 0, 0.4)";
					ticketOpen.current.style.overflowY = "hidden";
					setImageOpen(true);
				};
				imageSrc = `data:image/${extension};base64,${file.image}`;
				altImage = `imagem: ${name_file}`;
				handleDonwloadFile = () => {
					const url = `data:image/${extension};base64,${image}`;
					handleDownload(url, nameFile);
				};
				isImage = true;
			} else {
				isImage = false;
			}

			if (!isImage) {
				const config = fileTypeConfig[file];
				if (config) {
					imageSrc = config.imageSrc;
					altImage = config.altImage;
					blob = DownloadFile({
						data: config.mime,
						content: contentFile,
					});
					handleDonwloadFile = () => {
						const url = window.URL.createObjectURL(blob);
						handleDownload(url, nameFile);
					};
				}
			}

			try {
				const Div = (
					<DivOnBoardFile className="position-relative">
						<IMGFiles onClick={handleShowImage} src={imageSrc} alt={altImage} />
						<ImageFile
							className="position-absolute bottom-0 start-50 translate-middle-x"
							src={downloadImage}
							alt="Baixar"
							onClick={handleDonwloadFile}
						/>
						<p className="text-center text-break">{nameFile}</p>
					</DivOnBoardFile>
				);
				setFileTicket((fileticket) => [...fileticket, Div]);
			} catch (err) {
				return console.error(err);
			}
		}
	}

	function UploadNewFiles(evt) {
		// Adiciona os novos arquivos ao array UpNwfile
		UpNwfile.push(evt.target.files);

		// Itera sobre os arquivos no array UpNwfile
		for (let i = 0; i < UpNwfile.length; i++) {
			// Atualiza o estado dos arquivos a serem enviados
			setUploadNewFiles((uploadNewFiles) => [
				...uploadNewFiles,
				...UpNwfile[i],
			]);
		}

		// A função não retorna nenhum valor
		return uploadNewFiles;
	}

	useEffect(() => {
		const paragraphs = [];
		if (uploadNewFiles.length !== 0) {
			try {
				// Obtém a lista de arquivos do primeiro item em uploadNewFiles
				const fileNM = uploadNewFiles;

				if (fileNM instanceof File) {
					paragraphs.push(
						<div
							key={fileNM.name}
							id={fileNM.name}
							className="d-flex w-100 justify-content-center"
						>
							<div
								className="tw-flex tw-justify-center tw-items-center tw-w-full"
								key={0}
							>
								<PNWFile>{fileNM.name}</PNWFile>
							</div>
							<div>
								<button
									className="tw-border-none tw-bg-transparent"
									type="button"
									onClick={() => {
										// Cria uma cópia do array de arquivos e remove o arquivo atual
										const newArray = Array.from(fileNM);
										newArray.splice(0, 1);

										// Cria um novo DataTransfer para atualizar a lista de arquivos
										const dataTransfer = new DataTransfer();
										newArray.forEach((file) => {
											dataTransfer.items.add(file);
										});

										// Atualiza o estado com a nova lista de arquivos
										const newFileList = dataTransfer.files;
										setUploadNewFiles([newFileList]);
									}}
								>
									<img
										className="tw-w-[2.2em]"
										src={excludeImage}
										alt="Excluir arquivo"
									/>
								</button>
							</div>
						</div>,
					);
				} else if (fileNM.length) {
					// Itera sobre cada arquivo na lista
					for (let i = 0; i < fileNM.length; i++) {
						const file = fileNM[i];
						// Adiciona um elemento JSX para cada arquivo
						paragraphs.push(
							<div
								key={file.name}
								id={file.name}
								className="d-flex w-100 justify-content-center"
							>
								<div
									className="tw-flex tw-justify-center tw-items-center tw-w-full"
									key={i}
								>
									<PNWFile>{file.name}</PNWFile>
								</div>
								<div>
									<button
										className="tw-border-none tw-bg-transparent"
										type="button"
										onClick={() => {
											RemoveFile({ fileNM: fileNM, count: i });
										}}
									>
										<img
											className="tw-w-[2.2em]"
											src={excludeImage}
											alt="Excluir arquivo"
										/>
									</button>
								</div>
							</div>,
						);
					}
				}

				// Atualiza o estado com a nova lista de elementos JSX
				setNameNWFiles(paragraphs);

				// Indica que novos arquivos foram selecionados
				setNewFiles(true);
			} catch (err) {
				return console.error(err);
			}
		} else {
			return setNewFiles(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [uploadNewFiles]);

	function RemoveFile({ fileNM, count }) {
		try {
			const newArray = [...fileNM]; // Faz uma cópia do array original
			newArray.splice(count, 1); // Remove o arquivo específico

			if (newArray.length === 0) {
				setUploadNewFiles([]); // Se não houver mais arquivos, zera o estado
				return;
			}

			// Cria um novo DataTransfer para atualizar a lista de arquivos corretamente
			const dataTransfer = new DataTransfer();
			newArray.forEach((file) => {
				dataTransfer.items.add(file);
			});

			// Atualiza o estado com a nova lista de arquivos
			setUploadNewFiles(Array.from(dataTransfer.files));
		} catch (err) {
			return console.error(err);
		}
	}

	function ChangeStatusTicket({ status }) {
		if (status === "stop" || status === "close") {
			stopFetchingRef.current = true;
		}
		try {
			const date = new Date();

			// Obtém e formata a data e hora atuais
			const dataFormatada = `${AddZero(date.getDate())}/${AddZero(
				date.getMonth() + 1,
			)}/${date.getFullYear()}`;
			const horaFormatada = `${AddZero(date.getHours())}:${AddZero(
				date.getMinutes(),
			)}`;

			// Faz uma requisição POST para atualizar o status do chamado
			fetch(`/helpdesk/ticket/${ticketID}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-CSRFToken": token, // Inclui o token CSRF para segurança
				},
				body: JSON.stringify({
					technician: userName, // Nome do técnico que está finalizando o chamado
					status: status, // Novo status do chamado
					hours: horaFormatada, // Hora de conclusão
					date: dataFormatada, // Data de conclusão
					mail: ticketMAIL, // E-mail associado ao chamado
					techMail: userMail,
				}),
			})
				.then((response) => {
					if (response.status === 304) {
						// Se o status for 304, o chamado não pertence ao usuário
						setMessageError("Ticket não pertence a você");
						setTypeError("Permissão Negada");
						setMessage(true);
						return;
					} else if (response.status === 204) {
						setMessageError("Ticket Já está em aguardo");
						setTypeError("Permissão Negada");
						setMessage(true);
						return;
					} else if (response.status === 205) {
						setMessageError("Ticket Já está Finalizado");
						setTypeError("Permissão Negada");
						setMessage(true);
						return;
					} else if (response.status === 206) {
						setMessageError("Ticket Já está Aberto");
						setTypeError("Permissão Negada");
						setMessage(true);
						return;
					} else {
						// Para outros status, tenta converter a resposta em JSON e exibir uma mensagem de erro
						return response.json();
					}
				})
				.then((data) => {
					if (data) {
						setReloadFilter(true);
						setForcedLoad(true);
						setChangeStatus(ticketID);
					}
				})
				.catch((err) => {
					return console.error(err); // Exibe o erro no console para depuração
				});
		} catch (err) {
			return console.error(err);
		}
	}

	useEffect(() => {
		if (selectedTech.length > 1) {
			try {
				const date = new Date();

				const day = date.getDate();
				const month = date.getMonth() + 1;
				const year = date.getFullYear();

				const dataFormatada = `${AddZero(day)}/${AddZero(month)}/${year}`;
				const horaFormatada = `${AddZero(date.getHours())}:${AddZero(date.getMinutes())}`;
				fetch(`/helpdesk/ticket/${ticketID}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						"X-CSRFToken": token,
					},
					body: JSON.stringify({
						responsible_technician: selectedTech,
						technician: userName,
						date: dataFormatada,
						hours: horaFormatada,
						mail: ticketMAIL,
						techMail: userMail,
					}),
				})
					.then((response) => {
						if (response.status === 200) {
							return response.json();
						} else if (response.status === 302) {
							setMessageError(
								"Metodologia desconhecida para transferir o chamado a alguém que já é responsável por ele.",
							);
							setTypeError("AÇÃO DESCONHECIDA");
							setMessage(true);
						}
					})
					.then((data) => {
						if (data) {
							setReloadFilter(true);
							setForcedLoad(true);
							setChangeTech(ticketID);
							return;
						}
					})
					.catch((err) => {
						return console.error(err);
					});
			} catch (err) {
				return console.error(err);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedTech]);

	return (
		<TicketOpen
			ref={ticketOpen}
			className="position-fixed top-50 start-50 translate-middle"
		>
			<div ref={ticketRef}>
				<div className="w-100 d-flex">
					<div className="d-flex justify-content-start w-100">
						<div className="d-flex w-100 justify-content-evenly">
							<BtnNF onClick={DownloadTicket}>
								<img src={downTick} alt="download Ticket" />
							</BtnNF>
							<div
								className="tw-relative tw-inline-block tw-text-center tw-m-auto"
								hidden={helpdesk === "helpdesk"}
							>
								{/* ID "drp" is critical: handleCloseConfigs checks event.target.id === "drp" to toggle dropdown visibility */}
								<button
									type="button"
									id="drp"
									className="tw-flex tw-items-center tw-justify-center tw-w-10 tw-h-10 tw-rounded-full tw-bg-transparent hover:tw-bg-slate-100 tw-transition-colors tw-border-none tw-outline-none"
								>
									{/* ID "imd" is critical: handleCloseConfigs checks event.target.id === "imd" to toggle dropdown visibility */}
									<img
										id="imd"
										className="tw-w-6 tw-h-6 tw-opacity-80 hover:tw-opacity-100 tw-transition-opacity"
										src={setingIMG}
										alt="Configuração"
									/>
								</button>
								{/* ID "dropContTicketWd" is critical: handleCloseConfigs checks event.target.id to prevent closing dropdown on inner click */}
								<div
									ref={dropCont}
									id="dropContTicketWd"
									className="visually-hidden position-absolute top-100 start-50 translate-middle-x tw-min-w-[200px] tw-w-48 tw-bg-white tw-rounded-xl tw-shadow-lg tw-border tw-border-slate-100 tw-z-50 tw-p-1.5 tw-flex tw-flex-col tw-gap-1 tw-items-stretch"
								>
									<button
										type="button"
										className="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-text-[14px] tw-font-semibold tw-text-emerald-700 hover:tw-bg-emerald-50 tw-rounded-lg tw-transition-all tw-duration-150 tw-flex tw-items-center tw-gap-2 tw-border-none tw-bg-transparent"
										onClick={() => {
											ChangeStatusTicket({ status: "close" });
										}}
										hidden={ticketResponsible_Technician.length === 0}
									>
										<span className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-emerald-500"></span>
										Finalizar
									</button>
									<button
										type="button"
										className="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-text-[14px] tw-font-semibold tw-text-blue-700 hover:tw-bg-blue-50 tw-rounded-lg tw-transition-all tw-duration-150 tw-flex tw-items-center tw-gap-2 tw-border-none tw-bg-transparent"
										onClick={() => {
											ChangeStatusTicket({ status: "open" });
										}}
										hidden={ticketResponsible_Technician.length === 0}
									>
										<span className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-blue-500"></span>
										Reabrir
									</button>
									<button
										type="button"
										className="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-text-[14px] tw-font-semibold tw-text-amber-700 hover:tw-bg-amber-50 tw-rounded-lg tw-transition-all tw-duration-150 tw-flex tw-items-center tw-gap-2 tw-border-none tw-bg-transparent"
										onClick={() => {
											ChangeStatusTicket({ status: "stop" });
										}}
										hidden={ticketResponsible_Technician.length === 0}
									>
										<span className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-amber-500"></span>
										Aguardar
									</button>
									<button
										type="button"
										className="tw-w-full tw-text-left tw-px-3 tw-py-2 tw-text-[14px] tw-font-semibold tw-text-rose-700 hover:tw-bg-rose-50 tw-rounded-lg tw-transition-all tw-duration-150 tw-flex tw-items-center tw-gap-2 tw-border-none tw-bg-transparent"
										onClick={() => setTechDetails(true)}
									>
										<span className="tw-w-2 tw-h-2 tw-rounded-full tw-bg-rose-500"></span>
										Detalhes Técnicos
									</button>
									<div className="tw-my-1 tw-border-t tw-border-slate-100"></div>
									<div className="tw-px-2 tw-py-1">
										<label
											htmlFor="selectTech"
											className="tw-block tw-text-[10px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-wider tw-mb-1"
										>
											Transferir Chamado
										</label>
										<select
											className="tw-w-full tw-px-2 tw-py-1.5 tw-text-[12px] tw-font-medium tw-bg-slate-50 tw-border tw-border-slate-200 tw-rounded-md tw-text-slate-700 hover:tw-bg-slate-100 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500/20 focus:tw-border-blue-500 tw-transition-all"
											id="selectTech"
											onChange={(event) => {
												setSelectedTech(event.target.value);
											}}
											value={selectedTech}
										>
											<option key={0} value="" disabled>
												Selecionar técnico
											</option>
											{techs.map((tech) => (
												<option key={tech} value={tech}>
													{tech}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="w-100 justify-content-center d-flex">
						<h3 className="text-center text-uppercase fw-bold text-danger mt-3">
							chamado {ticketID}
						</h3>
					</div>
					<div className="w-100 justify-content-end d-flex">
						<CloseBTN onClick={CloseTicket}>
							<Close src={closeIMG} alt="Fechar Chamado" />
						</CloseBTN>
					</div>
				</div>
				<div className="d-flex flex-column">
					<input
						type="text"
						value={`Usuário: ${ticketNAME}`}
						className={`form-control disabled ${pointer}`}
						readOnly
					/>
					<input
						type="text"
						value={`Departamento: ${ticketDEPARTMENT}`}
						className="form-control disabled"
						readOnly
					/>
					<input
						type="text"
						value={`Email: ${ticketMAIL}`}
						className={`form-control disabled ${pointer}`}
						hidden={ticketMAIL.length <= 1}
						readOnly
					/>
					<input
						type="text"
						value={`Unidade: ${ticketCOMPANY}`}
						className="form-control disabled"
						readOnly
					/>
					<input
						type="text"
						value={`Setor: ${ticketSECTOR}`}
						className="form-control disabled"
						readOnly
					/>
					<input
						type="text"
						value={`Ocorrência: ${ticketOCCURRENCE}`}
						className="form-control disabled"
						readOnly
					/>
					<input
						type="text"
						value={`Detalhes: ${ticketPROBLEMN}`}
						className="form-control disabled"
						readOnly
					/>
					{showEquipament && (
						<DivColorGray>
							<ImgMachines
								src={`http://sappp01:3000/home/computers/get-image/${modelName}`}
								className="img-fluid"
								alt={`imagem ${modelName}`}
							/>
							<input
								value={`Modelo: ${modelName}`}
								className={`form-control disabled ${pointer}`}
								readOnly
							/>
							<input
								value={`ID do Equipamento: ${equipament}`}
								className={`form-control disabled ${pointer}`}
								readOnly
							/>
							<input
								value={dateEquipament}
								className="form-control disabled"
								readOnly
							/>
						</DivColorGray>
					)}
					<TextObersavation
						ref={textareaRef}
						name="observation"
						className={`autosize-textarea disabled ${pointer}`}
					>
						{observation}
					</TextObersavation>
					<input
						type="text"
						value={`tempo de vida do chamado: ${lifeTime}`}
						className="form-control disabled"
						readOnly
					/>
					<div
						hidden={fileticket.length === 0}
						className="w-100 tw-px-[15px] tw-py-[7px] tw-grid tw-grid-cols-[repeat(auto-fill,minmax(200px,1fr))] tw-gap-[20px]"
					>
						{fileticket}
					</div>
					<input
						type="text"
						value={
							"Tecnico responsavel: " +
							(ticketResponsible_Technician
								? ticketResponsible_Technician
								: "Nenhum técnico atribuído")
						}
						className="form-control disabled"
						readOnly
					/>
				</div>
				<DivChat ref={chatDiv}>{mountChat}</DivChat>
				{chat && (
					<div className="w-100 d-flex">
						<div className="w-100 div-chat">
							<textarea
								style={{ whiteSpace: "pre-wrap" }}
								className="form-control h-100 fs-5 text-chat"
								onKeyUp={NewChat}
								ref={inputChat}
							/>
						</div>
						<div className="d-flex">
							<BtnChat2 className="transform-y-25 ">
								<InputFile
									className="w-100 cursor"
									type="file"
									multiple
									onInput={UploadNewFiles}
								/>
							</BtnChat2>
							<BtnChat
								className="btn transform-y-25 "
								type="submit"
								onClick={SendChat}
							></BtnChat>
						</div>
					</div>
				)}
			</div>
			{imageopen && (
				// biome-ignore lint/a11y/useSemanticElements: backdrop needs to be a div to contain the image and close button
				<div
					className="tw-fixed tw-inset-0 tw-z-[10000] tw-bg-black/75 tw-backdrop-blur-sm tw-flex tw-justify-center tw-items-center tw-p-4 tw-transition-all tw-duration-300"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							ticketRef.current.style.filter = "blur(0)";
							ticketRef.current.style.background = "var(--pure-white)";
							ticketOpen.current.style.overflowY = "auto";
							setImageOpen(false);
						}
					}}
					onKeyDown={(e) => {
						if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
							ticketRef.current.style.filter = "blur(0)";
							ticketRef.current.style.background = "var(--pure-white)";
							ticketOpen.current.style.overflowY = "auto";
							setImageOpen(false);
						}
					}}
					role="button"
					tabIndex={0}
				>
					<button
						type="button"
						onClick={() => {
							ticketRef.current.style.filter = "blur(0)";
							ticketRef.current.style.background = "var(--pure-white)";
							ticketOpen.current.style.overflowY = "auto";
							setImageOpen(false);
						}}
						className="tw-absolute tw-top-6 tw-right-6 tw-text-white/80 hover:tw-text-white tw-bg-white/10 hover:tw-bg-white/20 tw-transition-all tw-duration-200 tw-rounded-full tw-p-2 tw-flex tw-items-center tw-justify-center tw-w-10 tw-h-10 tw-border tw-border-white/20 tw-shadow-lg"
						aria-label="Fechar"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="tw-h-6 tw-w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<title>Fechar</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>

					<div className="tw-relative tw-max-w-[90%] tw-max-h-[90%] tw-flex tw-justify-center tw-items-center tw-transition-transform tw-duration-300 tw-scale-100">
						<img
							src={imageUrl}
							alt="Visualização do anexo"
							className="tw-max-w-full tw-max-h-[85vh] tw-object-contain tw-rounded-lg tw-shadow-2xl tw-border tw-border-white/10"
						/>
					</div>
				</div>
			)}
			{newFiles && (
				<DivNewFiles className="position-absolute top-50 start-50 translate-middle d-flex flex-column">
					<div className="w-100 d-flex">
						<div className="w-100 text-center mb-2">
							<h3 className="text-light fw-bold">Arquivos</h3>
						</div>
						<div className="h-100 align-items-start justify-content-end d-flex">
							<BtnNF
								className="bg-transparent pe-auto"
								onClick={() => {
									setUploadNewFiles("");
									setNewFiles(false);
								}}
							>
								<ImgBTNCls src={closeIMG} alt="Fechar" />
							</BtnNF>
						</div>
					</div>
					<AdjustListFiles>{nameNWFiles}</AdjustListFiles>
					<div className="d-flex justify-content-end align-items-center flex-column">
						<DivHR></DivHR>
						<button
							type="button"
							className="btn btn-success w-50 mt-2"
							onClick={() => {
								setFileTicket([]);
								SubmitNewFiles();
							}}
						>
							Enviar
						</button>
					</div>
				</DivNewFiles>
			)}
		</TicketOpen>
	);
}
