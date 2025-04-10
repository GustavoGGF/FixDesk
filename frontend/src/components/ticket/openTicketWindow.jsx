import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import {
  TicketOpen,
  BtnNF,
  CloseBTN,
  DivFile,
  DivChat,
  BtnChat2,
  InputFile,
  DivImageOpen,
  BtnOpen,
  ImageOpen,
  Close,
  BtnChat,
  PNWFile,
  DivNewFiles,
  ImgBTNCls,
  AdjustListFiles,
  DivHR,
  DivOnBoardFile,
  IMGFiles,
  ImageFile,
  PChatHourL,
  PChatHourR,
  IMGConfig,
  DivDetaisl,
  ButtonDet,
  DivChatDetails,
  ImgSend,
  DivColorGray,
} from "../../styles/ticket/ticketWindow";
import { DivNameFile, BtnFile, ImgFile } from "../../styles/helpdeskStyle";
import { DropDown, DropBTN, DropContent2 } from "../../styles/navbarStyle";
import { MessageContext } from "../../context/MessageContext";
import downTick from "../../images/components/attachment.png";
import closeIMG from "../../images/components/close.png";
import { TextObersavation } from "../../styles/dashboardTI";
import mailImage from "../../images/components/mail.png";
import downloadImage from "../../images/components/download.png";
import XLSImage from "../../images/components/xlsx.png";
import ZIPImage from "../../images/components/zip.jpg";
import TXTImage from "../../images/components/arquivo-txt.png";
import wordImage from "../../images/components/palavra.png";
import PDFImage from "../../images/components/pdf.png";
import excludeImage from "../../images/components/close.png";
import setingIMG from "../../images/components/definicoes.png";
import sendIMG from "../../images/components/enviar.png";
import { TicketContext } from "../../context/TicketContext";
import { ImgMachines } from "../../styles/ticketsOptionsStyle";

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
  const [isAtButton, setIsAtButton] = useState(false);
  const [newFiles, setNewFiles] = useState(false);
  const [imageopen, setImageOpen] = useState(false);
  const [techDetails, setTechDetails] = useState(false);

  const [countchat, setCountChat] = useState(0);
  const [initUpdateChat, setInitUpdateChat] = useState(0);

  const [textChat, setTextChat] = useState("");
  const [mountDetails, setMountDetails] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [detailsChat, setDetailsChat] = useState("");
  const [modelName, setModelName] = useState("");
  const [dateEquipament, setDateEquipament] = useState("");

  const [uploadNewFiles, setUploadNewFiles] = useState([]);
  const [fileticket, setFileTicket] = useState([]);
  const [mountChat, setMountChat] = useState(mountInitialChat);
  const [nameNWFiles, setNameNWFiles] = useState([]);

  const techs = techsNames;
  const softGray = "#e9ecef";

  const textareaRef = useRef(null);
  const chatDiv = useRef(null);
  const inputChat = useRef(null);
  const ticketRef = useRef(null);
  const ticketOpen = useRef(null);
  const dropCont = useRef(null);
  const inputRef = useRef(null);

  const { setTicketWindowAtt, setChangeTech, setReloadFilter, setForcedLoad } =
    useContext(TicketContext);
  const { setMessageError, setMessage, setTypeError } =
    useContext(MessageContext);

  let count = 0;
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
          return console.log(err);
        }
      }
    },
    [techDetails, imageopen, setTechDetails, setImageOpen, setTicketWindowAtt]
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
    [dropCont]
  );

  useEffect(() => {
    document.addEventListener("click", handleCloseConfigs);
    return () => document.removeEventListener("click", handleCloseConfigs);
  }, [handleCloseConfigs]);

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
            })
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
              `Equipamento alocado em ${formattedDates[0]}`
            );
          }

          if (isConsecutive) {
            return setDateEquipament(
              `Equipamento alocado de ${formattedDates[0]} a ${
                formattedDates[formattedDates.length - 1]
              }`
            );
          }

          return setDateEquipament(
            `Equipamento alocado em ${formattedDates
              .slice(0, -1)
              .join(", ")} e ${formattedDates[formattedDates.length - 1]}`
          );
        } catch (err) {
          return console.log(err);
        }
      };
      formatDates(dateAlocate);
    }
  }, [dateAlocate]);

  useEffect(() => {
    if (showEquipament) {
      fetch("/helpdesk/get-image/" + equipament, {
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
          return console.log(err);
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
    if (fetchchat === true) {
      fetch("/helpdesk/update-chat/" + ticketID, {
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data !== null || data !== undefined || data !== "undefined") {
            if (data.chat !== null) {
              var newChat = parseInt(data.chat.length);
              if (newChat > countchat) {
                setCountChat(newChat);
                ReloadChat({ data: data });
              } else {
                return;
              }
            }
            return;
          }
        })
        .catch((err) => {
          setMessageError(err);
          setTypeError("Fatal ERROR");
          setMessage(true);
          return console.log(err);
        });
      return;
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initUpdateChat]);

  useEffect(() => {
    AddCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function AddCount() {
    count++;

    setInitUpdateChat(count);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    return (timeoutId = setTimeout(AddCount, 10000)); // Chama a função novamente após 5 segundos
  }

  useEffect(() => {
    if (chat && isAtButton && chatDiv && chatDiv.current) {
      chatDiv.current.scrollTop = chatDiv.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountChat]);

  useEffect(() => {
    // Verifica se a referência do textarea está definida e se o valor não está vazio
    if (
      textareaRef.current &&
      textareaRef.current.value !== undefined &&
      textareaRef.current.value !== ""
    ) {
      // Redimensiona o textarea com base no valor atual
      ResizeTextarea(textareaRef.current);
    }
    // A lista de dependências inclui ticketWindow para executar o efeito quando ticketWindow mudar
  }, []); // Inclua aqui todas as dependências necessárias

  function ResizeTextarea(textarea) {
    // Obtém o estilo de altura da linha do textarea, assumindo que esteja definido em pixels
    const lineHeight = parseFloat(window.getComputedStyle(textarea).lineHeight);

    // Conta o número de linhas no textarea
    const lines = textarea.value.split("\n").length;

    // Ajusta a altura do textarea com base no número de linhas
    textarea.style.height = `${lineHeight * lines}px`;
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
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
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
        const a = document.createElement("a");
        a.href = url;
        a.download = "Chamado: " + ticketID;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  async function ReloadChat({ data }) {
    let varisAtBottom;
    if (chatDiv && chatDiv.current) {
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
        setCountChat(data.chat.length);

        const regex = /\[\[([^[\]]+?)\],\[([^[\]]+?)\],\[([^[\]]+?)\]\]/g;

        const chatValue = [];
        let match;

        while ((match = regex.exec(data.chat)) !== null) {
          const [, value1, value2, value3] = match;
          chatValue.push([value1, value2, value3]);
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
        let userClass;
        let techClass;
        let justifyContetUser;
        let justifyContetTech;

        if (helpdesk === "helpdesk") {
          userClass = "u-chat1";
          techClass = "u-chat2";
          justifyContetUser = "justify-content-end";
          justifyContetTech = "justify-content-start";
        } else if (helpdesk === "dashboard") {
          userClass = "u-chat2";
          techClass = "u-chat1";
          justifyContetUser = "justify-content-start";
          justifyContetTech = "justify-content-end";
        }

        const renderGroupedItems = () => {
          const groupedItems = [];
          for (const date in groupedByDate) {
            groupedItems.push(
              <div key={date}>
                <div className="text-center d-flex justify-content-center text-break">
                  <p className="p-chat">{date}</p>
                </div>
                {groupedByDate[date].map((item, index) => {
                  // Remover "User:" ou "Tech:" do início da string
                  var userOrTech = item[1];
                  var time = item[2].replace("Hours:", "").trim();
                  if (userOrTech.includes("System")) {
                    userOrTech = userOrTech.replace("System:", "").trim();
                    return (
                      <div key={index}>
                        <div className="text-center d-flex justify-content-center text-break">
                          <div className="p-chat">
                            <p>{userOrTech + " " + time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (userOrTech.includes("User")) {
                    userOrTech = userOrTech.replace("User:", "").trim();
                    return (
                      <div key={index}>
                        <div
                          className={`d-flex ${justifyContetUser} w-100 text-break position-relative`}
                        >
                          <div className={`${userClass} position-relative`}>
                            <p style={{ whiteSpace: "pre-wrap" }}>
                              {userOrTech}
                            </p>
                            <PChatHourR className="position-absolute bottom-0 end-0">
                              {time}
                            </PChatHourR>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (userOrTech.includes("Technician")) {
                    userOrTech = userOrTech.replace("Technician:", "").trim();
                    return (
                      <div key={index}>
                        <div
                          className={`d-flex ${justifyContetTech} w-100 text-break position-relative`}
                        >
                          <div className={`${techClass} position-relative`}>
                            <p style={{ whiteSpace: "pre-wrap" }}>
                              {userOrTech}
                            </p>
                            <PChatHourL className="position-absolute bottom-0 start-0">
                              {time}
                            </PChatHourL>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
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
        return console.log(err);
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
        setTextChat(event.target.value);
        return;
      }
      SendChat();
      event.preventDefault();
      return;
    } else {
      setTextChat(event.target.value);
      return;
    }
  }

  // Função auxiliar para adicionar um zero à esquerda para números menores que 10
  function AddZero(numero) {
    if (numero < 10) {
      return "0" + numero;
    }
    return numero;
  }

  function SendChat() {
    try {
      // Cria uma instância de data para capturar o momento atual
      var date = new Date();

      // Obtém o dia, mês e ano atuais
      var day = date.getDate();
      var month = date.getMonth() + 1; // O mês é baseado em zero, então soma-se 1
      var year = date.getFullYear();

      // Formata a data no formato DD/MM/AAAA
      var dataFormatada = AddZero(day) + "/" + AddZero(month) + "/" + year;

      // Formata a hora no formato HH:MM
      var horaFormatada =
        AddZero(date.getHours()) + ":" + AddZero(date.getMinutes());

      // Limpa o campo de entrada do chat
      inputChat.current.value = "";

      // Se o texto do chat estiver vazio, não faz nada
      if (textChat.length === 0) {
        return;
      }

      // Envia a mensagem do chat para o servidor
      fetch("/helpdesk/ticket/" + ticketID, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Define o tipo de conteúdo como JSON
          "X-CSRFToken": token, // Adiciona o token CSRF para segurança da requisição
        },
        body: JSON.stringify({
          helpdesk: helpdesk,
          user: userName, // Nome do usuário que está enviando a mensagem
          chat: textChat, // O conteúdo do chat
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
          setTextChat("");
          // Atualiza a interface do chat com os novos dados
          ReloadChat({ data: data });
        })
        .catch((err) => {
          // Se ocorrer um erro, exibe a mensagem de erro no frontend
          setMessageError(err);
          setTypeError("Fatal ERROR");
          setMessage(true);
          return console.log(err); // Exibe o erro no console para depuração
        });
    } catch (err) {
      return console.log(err);
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
      var date = new Date();
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var dataFormatada = AddZero(day) + "/" + AddZero(month) + "/" + year;
      var horaFormatada =
        AddZero(date.getHours()) + ":" + AddZero(date.getMinutes());

      // Adiciona a data e hora ao FormData
      formData.append("date", dataFormatada);
      formData.append("hours", horaFormatada);

      // Envia os arquivos e dados ao servidor
      fetch("/dashboard-ti/upload-new-files/" + ticketID, {
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
            files: data.files,
            name_file: data.name_file,
            content_file: data.content_file,
          });
          // reloadChat({ data: data.chat });
        })
        .catch((err) => {
          // Exibe mensagem de erro e loga o erro no console
          setMessageError(err);
          setTypeError("FATAL ERROR");
          setMessage(true);
          return console.log(err);
        });
    } catch (err) {
      return console.log(err);
    }
  }

  function ReloadFiles({ files, name_file, content_file }) {
    for (let i = 0; i < files.length; i++) {
      var file = files[i];
      var imageSrc = "";
      var altImage = "";
      let blob;
      let handleShowImage;
      let handleDonwloadFile;
      var isImage = false;
      const contentFile = content_file[i];
      const nameFile = name_file[i];
      const image = file.image;

      if (typeof file === "object") {
        const extension = nameFile.split(".")[-1];
        handleShowImage = () => {
          setImageUrl(`data:image/${extension};base64,${image}`);
          ticketRef.current.style.filter = "blur(4px)";
          ticketRef.current.style.background = "rgba(0, 0, 0, 0.4)";
          ticketOpen.current.style.overflowY = "hidden";
          setImageOpen(true);
        };
        imageSrc = `data:image/${extension};base64,${file.image}`;
        altImage = "imagem: " + name_file;
        handleDonwloadFile = () => {
          const link = document.createElement("a");
          link.href = `data:image/${extension};base64,${image}`;
          link.download = nameFile;
          link.click();
          link.remove();
          return;
        };
        isImage = true;
      } else {
        isImage = false;
      }
      if (!isImage) {
        switch (file) {
          default:
            break;
          case "mail":
            imageSrc = mailImage;
            altImage = "Ícone de um arquivo de E-mail";
            blob = DownloadFile({
              data: "message/rfc822",
              content: contentFile,
            });
            handleShowImage = () => {
              return;
            };
            handleDonwloadFile = () => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = nameFile;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              return;
            };
            break;
          case "excel":
            imageSrc = XLSImage;
            altImage = "Ícone de um arquivo Excell";
            blob = DownloadFile({
              data: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              content: contentFile,
            });
            handleShowImage = () => {
              return;
            };
            handleDonwloadFile = () => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = nameFile;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              return;
            };
            break;
          case "zip":
            imageSrc = ZIPImage;
            altImage = "ìcone de um arquivo ZIP";
            blob = DownloadFile({
              data: "application/zip",
              content: contentFile,
            });
            handleShowImage = () => {
              return;
            };
            handleDonwloadFile = () => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = nameFile;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              return;
            };
            break;
          case "txt":
            imageSrc = TXTImage;
            altImage = "Ícone de um arquivo TXT";
            blob = DownloadFile({
              data: "text/plain",
              content: contentFile,
            });
            handleShowImage = () => {
              return;
            };
            handleDonwloadFile = () => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = nameFile;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              return;
            };
            break;
          case "word":
            imageSrc = wordImage;
            altImage = "Ícone de um Arquivo Word";
            blob = DownloadFile({
              data: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              content: contentFile,
            });
            handleShowImage = () => {
              return;
            };
            handleDonwloadFile = () => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = nameFile;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              return;
            };
            break;
          case "pdf":
            imageSrc = PDFImage;
            altImage = "Ícone de um Arquivo PDF";
            blob = DownloadFile({
              data: "application/pdf",
              content: contentFile,
            });
            handleShowImage = () => {
              return;
            };
            handleDonwloadFile = () => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = nameFile;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              return;
            };
            break;
        }
      }

      try {
        console.log(blob);

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
        return console.log(err);
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
    let paragraphs = [];
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
              <DivNameFile key={0}>
                <PNWFile>{fileNM.name}</PNWFile>
              </DivNameFile>
              <div>
                <BtnFile
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
                  <ImgFile src={excludeImage} alt="Excluir arquivo" />
                </BtnFile>
              </div>
            </div>
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
                <DivNameFile key={i}>
                  <PNWFile>{file.name}</PNWFile>
                </DivNameFile>
                <div>
                  <BtnFile
                    type="button"
                    onClick={() => {
                      RemoveFile({ fileNM: fileNM, count: i });
                    }}
                  >
                    <ImgFile src={excludeImage} alt="Excluir arquivo" />
                  </BtnFile>
                </div>
              </div>
            );
          }
        }

        // Atualiza o estado com a nova lista de elementos JSX
        setNameNWFiles(paragraphs);

        // Indica que novos arquivos foram selecionados
        setNewFiles(true);
      } catch (err) {
        return console.log(err);
      }
    } else {
      return setNameNWFiles();
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
      newArray.forEach((file) => dataTransfer.items.add(file));

      // Atualiza o estado com a nova lista de arquivos
      setUploadNewFiles(Array.from(dataTransfer.files));
    } catch (err) {
      return console.log(err);
    }
  }

  function ChangeStatusTicket({ status }) {
    try {
      var date = new Date();

      // Obtém e formata a data e hora atuais
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var dataFormatada = AddZero(day) + "/" + AddZero(month) + "/" + year;
      var horaFormatada =
        AddZero(date.getHours()) + ":" + AddZero(date.getMinutes());

      // Faz uma requisição POST para atualizar o status do chamado
      fetch("/helpdesk/ticket/" + ticketID, {
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
          } else if (response.status === 200) {
            setChangeTech(ticketID);
            setReloadFilter(true);
            setForcedLoad(true);
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
        .catch((err) => {
          // Trata erros de requisição e exibe uma mensagem de erro
          setMessageError("Erro ao finalizar o Ticket");
          setTypeError("FATAL ERROR");
          setMessage(true);
          return console.log(err); // Exibe o erro no console para depuração
        });
    } catch (err) {
      return console.log(err);
    }
  }

  function TechDetails() {
    fetch("/dashboard-ti/details/" + ticketID, {
      method: "GET",
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        const status = response.status;
        if (status === 200) {
          return response.json();
        }
        return response.json();
      })
      .then((data) => {
        MountChatDetails(data.details);
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function MountChatDetails(chat) {
    setTechDetails(true); // Define que o chat técnico está sendo exibido.

    // Verifica se há mensagens no chat.
    if (chat !== null && chat !== undefined && chat !== "undefined") {
      try {
        const regex = /\[\[([^[\]]+?)\],\[([^[\]]+?)\],\[([^[\]]+?)\]\]/g;

        const chatValue = [];
        let match;

        // Extrai os dados das mensagens do chat.
        while ((match = regex.exec(chat)) !== null) {
          const [, value1, value2, value3] = match;
          chatValue.push([value1, value2, value3]);
        }

        setMountChat([]); // Limpa as mensagens já montadas.
        setIsAtButton(false);

        const groupedByDate = {};

        chatValue.forEach((item) => {
          const date = item[0].split(":")[1].trim(); // Extrai a data do primeiro elemento
          if (!groupedByDate[date]) {
            groupedByDate[date] = [];
          }
          groupedByDate[date].push(item);
        });

        // Função para renderizar as mensagens agrupadas.
        const renderGroupedItems = () => {
          const groupedItems = [];
          for (const date in groupedByDate) {
            groupedItems.push(
              <div key={date}>
                <div className="text-center d-flex justify-content-center text-break">
                  <p className="p-chat">{date}</p>
                </div>
                {groupedByDate[date].map((item, index) => {
                  // Remover "User:" ou "Tech:" do início da string
                  var chat = item[1];
                  var time = item[2];
                  time = time.replace("Hours:", "").trim();

                  return (
                    <div key={index}>
                      <div className="justify-content-start w-100 text-break position relative">
                        <div className="u-chat-2D position-relative">
                          <p>{chat}</p>
                          <PChatHourL className="position-absolute bottom-0 start-0">
                            {time}
                          </PChatHourL>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
          return groupedItems;
        };
        setMountDetails(renderGroupedItems()); // Define as mensagens montadas.
      } catch (err) {
        return console.log(err);
      }
    }
  }

  function NewChatDetails(event) {
    if (event.key === "Enter") {
      setDetailsChat(event.target.value); // Atualiza o texto do chat de detalhes técnicos.
      SendDetails(); // Envia a mensagem do chat de detalhes técnicos.
      event.preventDefault();
    } else {
      setDetailsChat(event.target.value); // Atualiza o texto do chat de detalhes técnicos enquanto é digitado.
    }
  }

  function SendDetails() {
    try {
      inputRef.current.value = ""; // Limpa o valor do campo de entrada.
      if (detailsChat.length === 0) {
        return;
      }
      // Implementação para enviar mensagens para o chat de detalhes técnicos.
      // Pega a data, dia, mês e ano e ajusta.
      var date = new Date();

      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();

      var dataFormatada = AddZero(day) + "/" + AddZero(month) + "/" + year;
      var horaFormatada =
        AddZero(date.getHours()) + ":" + AddZero(date.getMinutes());

      // Enviar informações do chat.
      fetch("/helpdesk/ticket/" + ticketID, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
          "Tech-Details": "ok",
        },
        body: JSON.stringify({
          chat: detailsChat,
          date: dataFormatada,
          hours: horaFormatada,
        }),
      })
        .then((response) => {
          const status = response.status;
          if (status === 200) {
            return response.json();
          }
          return response.json();
        })
        .then((data) => {
          MountChatDetails(data.chat);
        })
        .catch((err) => {
          return console.log(err);
        });
    } catch (err) {
      return console.log();
    }
  }

  useEffect(() => {
    if (selectedTech.length > 1) {
      try {
        var date = new Date();

        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        var dataFormatada = AddZero(day) + "/" + AddZero(month) + "/" + year;
        var horaFormatada =
          AddZero(date.getHours()) + ":" + AddZero(date.getMinutes());
        fetch("/helpdesk/ticket/" + ticketID, {
          method: "POST",
          headers: {
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
            setMessageError(err);
            setTypeError("FATAL ERROR");
            setMessage(true);
            return console.log(err);
          });
      } catch (err) {
        return console.log(err);
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
              <DropDown hidden={helpdesk === "helpdesk" ? true : false}>
                <DropBTN id="drp">
                  <IMGConfig id="imd" src={setingIMG} alt="Configuração" />
                </DropBTN>
                <DropContent2
                  ref={dropCont}
                  id="dropContTicketWd"
                  className="visually-hidden position-absolute top-100 start-50 translate-middle-x"
                >
                  <DropBTN
                    className="btn btn-success w-100"
                    onClick={() => {
                      ChangeStatusTicket({ status: "close" });
                    }}
                    hidden={ticketResponsible_Technician.length === 0}
                  >
                    Finalizar
                  </DropBTN>
                  <DropBTN
                    className="btn btn-info w-100"
                    onClick={() => {
                      ChangeStatusTicket({ status: "open" });
                    }}
                    hidden={ticketResponsible_Technician.length === 0}
                  >
                    Reabrir
                  </DropBTN>
                  <DropBTN
                    className="btn btn-primary w-100"
                    onClick={() => {
                      ChangeStatusTicket({ status: "stop" });
                    }}
                    hidden={ticketResponsible_Technician.length === 0}
                  >
                    Aguardar
                  </DropBTN>
                  <DropBTN
                    className="btn btn-danger w-100"
                    onClick={TechDetails}
                  >
                    Detalhes Tecnicos
                  </DropBTN>
                  <select
                    className="form-select"
                    id="selectTech"
                    onChange={(event) => {
                      setSelectedTech(event.target.value);
                    }}
                    value={selectedTech}
                  >
                    <option key={0} value="" disabled>
                      Transferir
                    </option>
                    {techs.map((tech, index) => (
                      <option key={index + 1} value={tech}>
                        {tech}
                      </option>
                    ))}
                  </select>
                </DropContent2>
              </DropDown>
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
            value={"Usuário: " + ticketNAME}
            className="form-control disabled"
          />
          <input
            type="text"
            value={"Departamento: " + ticketDEPARTMENT}
            className="form-control disabled"
          />
          <input
            type="text"
            value={"Email: " + ticketMAIL}
            className="form-control disabled"
            hidden={ticketMAIL.length > 1 ? false : true}
          />
          <input
            type="text"
            value={"Unidade: " + ticketCOMPANY}
            className="form-control disabled"
          />
          <input
            type="text"
            value={"Setor: " + ticketSECTOR}
            className="form-control disabled"
          />
          <input
            type="text"
            value={"Ocorrência: " + ticketOCCURRENCE}
            className="form-control disabled"
          />
          <input
            type="text"
            value={"Detalhes: " + ticketPROBLEMN}
            className="form-control disabled"
          />
          {showEquipament && (
            <DivColorGray>
              <ImgMachines
                src={`http://sappp01:3000/home/computers/get-image/${modelName}`}
                className="img-fluid"
                alt={`imagem ${modelName}`}
              />
              <input
                value={"Modelo: " + modelName}
                className="form-control disabled"
              />
              <input
                value={"ID do Equipamento: " + equipament}
                className="form-control disabled"
              />
              <input value={dateEquipament} className="form-control disabled" />
            </DivColorGray>
          )}
          <TextObersavation
            ref={textareaRef}
            name="observation"
            className="autosize-textarea disabled"
          >
            {observation}
          </TextObersavation>
          <input
            type="text"
            value={"tempo de vida do chamado: " + lifeTime}
            className="form-control disabled"
          />
          <DivFile
            hidden={fileticket.length >= 1 ? false : true}
            className="w-100"
          >
            {fileticket}
          </DivFile>
          <input
            type="text"
            value={
              "Tecnico responsavel: " +
              (ticketResponsible_Technician
                ? ticketResponsible_Technician
                : "Nenhum técnico atribuído")
            }
            className="form-control disabled"
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
        <div className="position-relative w-100 h-100">
          <DivImageOpen className="position-fixed top-50 start-50 translate-middle">
            <div className="w-100 position-relative">
              <BtnOpen
                onClick={() => {
                  ticketRef.current.style.filter = "blur(0)";
                  ticketRef.current.style.background = "var(--pure-white)";
                  ticketOpen.current.style.overflowY = "auto";
                  setImageOpen(false);
                }}
                className="position-absolute top-0 end-0"
              >
                <Close src={closeIMG} alt="Fechar" />
              </BtnOpen>
            </div>
            <ImageOpen src={imageUrl} alt="" />
          </DivImageOpen>
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
              className="btn btn-success w-50 mt-2"
              onClick={SubmitNewFiles}
            >
              Enviar
            </button>
          </div>
        </DivNewFiles>
      )}
      {techDetails && (
        <DivDetaisl className="position-fixed top-50 start-50 translate-middle">
          <div className="d-flex">
            <div className="w-100 justify-content-center">
              <h2 className="text-center">Detalhes tecnicos</h2>
            </div>
            <div>
              <ButtonDet
                onClick={() => {
                  setTechDetails(false);
                }}
              >
                <img src={closeIMG} alt="" />
              </ButtonDet>
            </div>
          </div>
          <div className="overflow-y-auto w-100 h-100 position relative">
            {mountDetails}
          </div>
          <div>
            <DivChatDetails>
              <input
                className="w-100 form-control"
                type="text"
                onKeyUp={NewChatDetails}
                ref={inputRef}
              />
              <ImgSend
                className="img-fluid"
                src={sendIMG}
                alt=""
                onClick={SendDetails}
              />
            </DivChatDetails>
          </div>
        </DivDetaisl>
      )}
    </TicketOpen>
  );
}
