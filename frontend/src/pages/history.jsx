import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar";
import Loading from "../components/loading";
import {
  AdjustListFiles,
  BtnChat,
  BtnChat2,
  BtnNF,
  BtnOpen,
  Button1,
  Button2,
  Close,
  CloseBTN,
  Div,
  DivCard,
  DivChat,
  DivContainerImages,
  DivFile,
  DivFilter,
  DivFlex1,
  DivFlex2,
  DivHR,
  DivImageOpen,
  DivImages,
  DivNewFiles,
  DivOnBoardFile,
  DivSelectView,
  H5Card,
  IMGS1,
  IMGFiles,
  ImageFile,
  ImageOpen,
  ImgBTNCls,
  ImgSelectView,
  Input1,
  InputFile,
  PChatHourL,
  PChatHourR,
  PNWFile,
  PQuantity,
  PSelectView,
  Select1,
  SpanCard,
  Table,
  TicketOpen,
  TD,
  TH,
  TR,
  TRSPACE,
} from "../styles/historyStyle";
import { BtnFile, DivNameFile, ImgFile, TitlePage } from "../styles/helpdeskStyle";
import "react-day-picker/dist/style.css";
import Card from "../images/components/identificacao.png";
import CloseIMG from "../images/components/close.png";
import Download from "../images/components/download.png";
import DownTick from "../images/components/attachment.png";
import IMG1 from "../images/dashboard_TI/quantity_1.png";
import IMG2 from "../images/dashboard_TI/quantity_2.png";
import IMG3 from "../images/dashboard_TI/quantity_3.png";
import IMG4 from "../images/dashboard_TI/quantity_4.png";
import List from "../images/components/lista-de-itens.png";
import Mail from "../images/components/mail.png";
import Message from "../components/message";
import PDF from "../images/components/pdf.png";
import TXT from "../images/components/arquivo-txt.png";
import WORD from "../images/components/palavra.png";
import XLS from "../images/components/xlsx.png";
import ZIP from "../images/components/zip.jpg";
import { TextObersavation } from "../styles/dashboardTI";
import Exclude from "../images/components/close.png";

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
      if (event.key === "F12" || (event.ctrlKey && event.shiftKey && event.key === "I")) {
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
  }, []); // O array de dependências vazio faz com que o useEffect execute apenas na montagem do componente

  // Variaveis de estado String
  const [blurNav, setBlurNav] = useState("");
  const [colorTheme, setColorTheme] = useState("");
  const [lifeTime, setLifetime] = useState("");
  const [status, setStatus] = useState("open");
  const [textChat, setTextChat] = useState("");
  const [theme, setTheme] = useState("");
  const [themeCard, setThemeCard] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [ticketCOMPANY, setTicketCOMPANY] = useState("");
  const [ticketDEPARTMENT, setTicketDEPARTMENT] = useState("");
  const [ticketID, setTicketID] = useState("");
  const [ticketMAIL, setTicketMAIL] = useState("");
  const [ticketNAME, setTicketNAME] = useState("");
  const [ticketOCCURRENCE, setTicketOCCURRENCE] = useState("");
  const [ticketPROBLEMN, setTicketPROBLEMN] = useState("");
  const [ticketSECTOR, setTicketSECTOR] = useState("");
  const [ticketResponsible_Technician, setTicketResponsible_Technician] = useState("");
  const [token, setToken] = useState("");
  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [equipament, setEquipament] = useState("");

  // Declarando variaveis de estado Boolean
  const [btnmore, setBtnMore] = useState(false);
  const [chat, setChat] = useState(true);
  const [fakeSelect, setFakeSelect] = useState(true);
  const [fetchchat, setFetchChat] = useState(false);
  const [imageopen, setImageOpen] = useState(false);
  const [inCard, setInCard] = useState(false);
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDash, setLoadingDash] = useState(true);
  const [message, setMessage] = useState(false);
  const [messageChat, setMessageChat] = useState(false);
  const [newFiles, setNewFiles] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const [problemInfra, setProblemInfra] = useState(false);
  const [problemSyst, setProblemSyst] = useState(false);
  const [ticketWindow, setTicketWindow] = useState(false);
  const [showEquipament, setShowEquipament] = useState(false);

  // Varaiveis de estado Array
  const [Data, setData] = useState([]);
  const [fileticket, setFileTicket] = useState([]);
  const [mountChat, setMountChat] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketsDash, setTicketsDash] = useState([]);
  const [uploadNewFiles, setUploadNewFiles] = useState([]);

  // Varaiveis de estado Vazias
  const [countchat, setCountChat] = useState();
  const [imageurl, setImageUrl] = useState();
  const [nameNWFiles, setNameNWFiles] = useState();
  const [initUpdateChat, setInitUpdateChat] = useState();

  // Variaveis de estado Number
  const [countTicket, setCountTicket] = useState(0);

  // Variaveis de estado Null
  const [problemTicket, setProblemTicket] = useState(null);
  const [orderby, setOrderBy] = useState(null);
  const [sectorTicket, setSectorTicket] = useState(null);

  const UpNwfile = [];

  let colorBorder = "";
  let count = 0;
  let timeoutId;

  const dashBoard = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Verifica se a referência do textarea está definida e se o valor não está vazio
    if (textareaRef.current && textareaRef.current.value !== undefined && textareaRef.current.value !== "") {
      // Redimensiona o textarea com base no valor atual
      resizeTextarea(textareaRef.current);
    }
    // A lista de dependências inclui ticketWindow para executar o efeito quando ticketWindow mudar
  }, [ticketWindow]); // Inclua aqui todas as dependências necessárias

  function resizeTextarea(textarea) {
    // Obtém o estilo de altura da linha do textarea, assumindo que esteja definido em pixels
    const lineHeight = parseFloat(window.getComputedStyle(textarea).lineHeight);

    // Conta o número de linhas no textarea
    const lines = textarea.value.split("\n").length;

    // Ajusta a altura do textarea com base no número de linhas
    textarea.style.height = `${lineHeight * lines}px`;
  }

  // Função de Tema escuro
  function ThemeBlack() {
    setThemeFilter("");
    setThemeCard("");
    setColorTheme("colorBlack");
    setTheme("themeBlack");
  }

  // Função de Tema claro
  function ThemeLight() {
    setThemeCard("themeCardLight");
    setThemeFilter("themeFilterLight");
    setColorTheme("colorLight");
    setTheme("themeLight");
  }

  useEffect(() => {
    let paragraphs = [];
    if (uploadNewFiles.length >= 1) {
      // Obtém a lista de arquivos do primeiro item em uploadNewFiles
      const fileNM = uploadNewFiles;

      if (fileNM instanceof File) {
        paragraphs.push(
          <div key={fileNM.name} className="d-flex w-100 justify-content-center">
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
                <ImgFile src={Exclude} alt="Excluir arquivo" />
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
            <div key={file.name} className="d-flex w-100 justify-content-center">
              <DivNameFile key={i}>
                <PNWFile>{file.name}</PNWFile>
              </DivNameFile>
              <div>
                <BtnFile
                  type="button"
                  onClick={() => {
                    // Cria uma cópia do array de arquivos e remove o arquivo atual
                    const newArray = Array.from(fileNM);
                    newArray.splice(i, 1);

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
                  <ImgFile src={Exclude} alt="Excluir arquivo" />
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadNewFiles]);

  function aumentarCount() {
    count++;

    setInitUpdateChat(count);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    return (timeoutId = setTimeout(aumentarCount, 10000)); // Chama a função novamente após 5 segundos
  }

  useEffect(() => {
    // Função assíncrona para buscar e processar os dados necessários ao iniciar o componente
    const fetchData = async () => {
      try {
        // Obtém os dados armazenados localmente no navegador (localStorage)
        const dataInfo = JSON.parse(localStorage.getItem("dataInfo"));

        // Se os dados não existirem, lança um erro e interrompe a execução
        if (!dataInfo) throw new Error("Informações de usuário não encontradas");

        // Atualiza o estado `data` com as informações obtidas do localStorage
        setData(dataInfo.data);

        // Criação de um objeto FormData para enviar dados ao backend
        const formData = new FormData();
        formData.append("name", dataInfo.data.name);

        // Envia os dados para o servidor através de uma requisição POST
        const response = await fetch("", {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });

        // Caso o status da resposta seja 402 (não autorizado ou sessão expirada), redireciona para a página de login
        if (response.status === 402) {
          window.location.href = "/login";
          return; // Interrompe a execução do restante da função
        }

        // Converte a resposta para JSON e armazena os dados retornados
        const data = await response.json();

        // Atualiza os estados com os dados recebidos da API
        setToken(data.token);
        setTickets(data.tickets);
        setCountTicket(10); // Define um valor padrão para contagem de tickets
        setOrderBy("-id"); // Define a ordenação padrão dos tickets

        // Modifica o estilo do botão com ID "thenView", se ele existir
        const btn = document.getElementById("thenView");
        if (btn) btn.style.backgroundColor = "#00B4D8";

        // Verifica se não há tickets e define mensagens de erro informativas para o usuário
        if (data.tickets.length === 0) {
          setTypeError("Falta de Dados");
          setMessageError("Você Ainda não abriu nenhum chamado");
          setLoadingDash(false);
          setLoading(false);
          setMessage(true);
          setNavbar(true);
        }
      } catch (error) {
        // Em caso de erro, define mensagens de erro e exibe no console para depuração
        setTypeError("Erro Fatal");
        setMessageError(error.message || "Erro desconhecido");
        setMessage(true);
        console.error("Erro na solicitação:", error);
      } finally {
        // Garante que os estados de carregamento sejam atualizados, independentemente do sucesso ou falha da requisição
        setLoadingDash(false);
        setLoading(false);
      }
    };

    // Chama a função fetchData assim que o componente for montado
    fetchData();
  }, []); // Dependências vazias garantem que o efeito será executado apenas uma vez, quando o componente for montado

  /**
   * Função responsável por habilitar a exibição da tela de imagem.
   * Atualiza o estado `imageOpen` para `true`, sinalizando que a imagem deve ser exibida.
   */
  function openImage() {
    setImageOpen(true);
  }

  /**
   * Altera o último visualizador de um chamado no sistema de helpdesk.
   *
   * @param {Object} params - Parâmetros da função.
   * @param {number} params.id - ID do chamado a ser atualizado.
   * @param {string} params.tech - Nome do técnico responsável pelo chamado.
   * @returns {Promise<Response>} - Retorna a resposta da requisição fetch.
   */
  async function changeLastVW({ id, tech }) {
    return fetch(`/helpdesk/change-last-viewer/${id}`, {
      method: "POST",
      headers: {
        "X-CSRFToken": token, // Token CSRF para segurança da requisição
        "Cache-Control": "no-cache", // Evita o uso de cache na requisição
        "Content-Type": "application/json", // Define o formato do corpo da requisição como JSON
      },
      body: JSON.stringify({
        viewer: Data.name, // Nome do usuário que está visualizando o chamado
        technician: tech, // Nome do técnico associado ao chamado
        requester: "user", // Indica que a alteração foi feita por um usuário comum
      }),
    });
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
  function helpdeskPage({ id }) {
    fetch("/helpdesk/ticket/" + id, {
      method: "GET",
      headers: {
        "X-CSRF-Token": token,
        pid: Data.pid,
        Accept: "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((dataBack) => {
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
        dashBoard.current.style.filter = "blur(3px)";
        // Oculta a mensagem do chat
        setMessageChat(false);
        // Reseta o estado do chat
        setMountChat([]);
        // Extrai a data do primeiro ticket de chamado
        const data = dataBack.data[0];
        // Chama a função de forma assíncrona sem bloquear o restante do código
        const callAsyncFunction = async () => {
          await changeLastVW({ id: id, tech: data.responsible_technician });
        };

        // Chama a função, mas o código segue sem esperar a execução terminar
        callAsyncFunction();
        const start_date = new Date(data.start_date);
        // Obtém a data atual
        var CurrentDate = new Date();
        // Calcula a diferença de tempo entre a data atual e a data de criação do chamado
        var calcDate = CurrentDate - start_date;
        // Calcula o tempo de vida do chamado em dias
        var lifetime = Math.floor(calcDate / (1000 * 60 * 60 * 24));

        setTicketNAME(data.ticketRequester);
        setTicketDEPARTMENT(data.department);
        setTicketMAIL(data.mail);
        setTicketCOMPANY(data.company);
        setTicketSECTOR(data.sector);
        setTicketOCCURRENCE(data.occurrence);
        setTicketPROBLEMN(data.problemn);
        if (data.problemn === "Alocação de Máquina") {
          setEquipament(data.equipament);
          setShowEquipament(true);
        }
        textareaRef.current.value = "Observação: " + data.observation;
        setLifetime(lifetime);
        setTicketResponsible_Technician(data.responsible_technician);
        setTicketID(data.id);
        if (data.file !== null && data.file.length >= 1) {
          const files = data.file;
          for (let i = 0; i < files.length; i++) {
            var file = files[i];
            if (file === "mail") {
              const contentFileMail = data.content_file[i];
              const nameFileMail = data.name_file[i];
              const Div = (
                <div className="text-center">
                  <DivOnBoardFile className="position-relative">
                    <IMGFiles src={Mail} alt="" />
                    <ImageFile
                      className="position-absolute bottom-0 start-50 translate-middle-x"
                      src={Download}
                      alt=""
                      onClick={() => {
                        const blob = downloadMail({
                          data: "message/rfc822",
                          content: contentFileMail,
                        });

                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = nameFileMail;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                    />
                  </DivOnBoardFile>{" "}
                  <div>{nameFileMail}</div>
                </div>
              );
              setFileTicket((fileticket) => [...fileticket, Div]);
            } else if (file === "excel") {
              const ContentFileExcel = data.content_file[i];
              const NameFileExcel = data.name_file[i];
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={XLS} alt="" />
                  <ImageFile
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                    src={Download}
                    alt=""
                    onClick={() => {
                      const blob = downloadMail({
                        data: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        content: ContentFileExcel,
                      });

                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = NameFileExcel;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  />
                  <p className="text-center text-break">{NameFileExcel}</p>
                </DivOnBoardFile>
              );
              setFileTicket((fileticket) => [...fileticket, Div]);
            } else if (file === "zip") {
              const ContentFileZip = data.content_file[i];
              const NameFileZip = data.name_file[i];
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={ZIP} alt="" />
                  <ImageFile
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                    src={Download}
                    alt=""
                    onClick={() => {
                      const blob = downloadMail({
                        data: "application/zip",
                        content: ContentFileZip,
                      });

                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = NameFileZip;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  />
                  <p className="text-center text-break">{NameFileZip}</p>
                </DivOnBoardFile>
              );
              setFileTicket((fileticket) => [...fileticket, Div]);
            } else if (file === "txt") {
              const ContentFileTXT = data.content_file[i];
              const NameFileTXT = data.name_file[i];
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={TXT} alt="" />
                  <ImageFile
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                    src={Download}
                    alt=""
                    onClick={() => {
                      const blob = downloadMail({
                        data: "text/plain",
                        content: ContentFileTXT,
                      });

                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = NameFileTXT;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  />
                  <p className="text-center text-break">{NameFileTXT}</p>
                </DivOnBoardFile>
              );
              setFileTicket((fileticket) => [...fileticket, Div]);
            } else if (file === "word") {
              const ContentFileWord = data.content_file[i];
              const NameFileWord = data.name_file[i];
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={WORD} alt="" />
                  <ImageFile
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                    src={Download}
                    alt=""
                    onClick={() => {
                      const blob = downloadMail({
                        data: "application/pdf",
                        content: ContentFileWord,
                      });

                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = NameFileWord;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  />{" "}
                  <p className="text-center text-break">{NameFileWord}</p>
                </DivOnBoardFile>
              );
              setFileTicket((fileticket) => [...fileticket, Div]);
            } else if (file === "pdf") {
              const ContentFilePDF = data.content_file[i];
              const NameFilePDF = data.name_file[i];
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={PDF} alt="" />
                  <ImageFile
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                    src={Download}
                    alt=""
                    onClick={() => {
                      const blob = downloadMail({
                        data: "application/pdf",
                        content: ContentFilePDF,
                      });

                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = NameFilePDF;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                  />
                  <p className="text-center text-break">{NameFilePDF}</p>
                </DivOnBoardFile>
              );
              setFileTicket((fileticket) => [...fileticket, Div]);
            } else if (typeof file === "object") {
              const image = file.image;
              const nameFile = data.name_file[i];
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles
                    src={`data:image/jpeg;base64,${file.image}`}
                    onClick={() => {
                      setImageUrl(`data:image/jpeg;base64,${image}`);
                      openImage();
                    }}
                    alt=""
                  />
                  <ImageFile
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                    src={Download}
                    alt=""
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:image/jpeg;base64,${image}`;
                      link.download = "nome-do-arquivo.jpg";
                      link.click();
                      link.remove();
                    }}
                  />
                  <p className="text-center text-break">{nameFile}</p>
                </DivOnBoardFile>
              );
              setFileTicket((fileticket) => [...fileticket, Div]);
            }
          }
        }
        if (data.chat !== null && data.chat !== undefined && data.chat !== "undefined") {
          setCountChat(data.chat.length);
          setFetchChat(true);

          const regex = /\[\[([^[\]]+?)\],\[([^[\]]+?)\],\[([^[\]]+?)\]\]/g;

          const chatValue = [];
          let match;

          while ((match = regex.exec(data.chat)) !== null) {
            const [, value1, value2, value3] = match;
            chatValue.push([value1, value2, value3]);
          }

          setMountChat([]);

          const groupedByDate = {};

          chatValue.forEach((item) => {
            const date = item[0].split(":")[1].trim(); // Extrai a data do primeiro elemento
            if (!groupedByDate[date]) {
              groupedByDate[date] = [];
            }
            groupedByDate[date].push(item);
          });

          const renderGroupedItems = () => {
            const groupedItems = [];
            for (const date in groupedByDate) {
              groupedItems.push(
                <div key={date}>
                  <div className="text-center d-flex justify-content-center text-break">
                    <p className="pChat">{date}</p>
                  </div>
                  {groupedByDate[date].map((item, index) => {
                    // Remover "User:" ou "Tech:" do início da string
                    var userOrTech = item[1];
                    var time = item[2];
                    time = time.replace("Hours:", "").trim();
                    if (userOrTech.includes("System")) {
                      userOrTech = userOrTech.replace("System:", "").trim();
                      return (
                        <div key={index}>
                          <div className="text-center d-flex justify-content-center text-break">
                            <div className="pChat">
                              <p>{userOrTech + " " + time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (userOrTech.includes("User")) {
                      userOrTech = userOrTech.replace("User:", "").trim();
                      return (
                        <div key={index}>
                          <DivFlex1 className="justify-content-end w-100 text-break position relative">
                            <div className="uChat1 position-relative">
                              <p>{userOrTech}</p>
                              <PChatHourR className="position-absolute bottom-0 end-0">{time}</PChatHourR>
                            </div>
                          </DivFlex1>
                        </div>
                      );
                    } else {
                      userOrTech = userOrTech.replace("Technician:", "").trim();
                      return (
                        <div key={index}>
                          <DivFlex2 className="justify-content-start w-100 text-break position relative">
                            <div className="uChat2 position-relative">
                              <p>{userOrTech}</p>
                              <PChatHourL className="position-absolute bottom-0 start-0">{time}</PChatHourL>
                            </div>
                          </DivFlex2>
                        </div>
                      );
                    }
                  })}
                </div>
              );
            }
            return groupedItems;
          };

          setMountChat(renderGroupedItems());

          setChat(true);

          aumentarCount();
        } else {
          const chatDiv = document.getElementById("chatDiv");
          chatDiv.style.background = "#e9ecef";
          setMessageError("O CHAT ESTÁ INDIPONIVÉL ATÉ O TECNICO INICIAR UMA CONVERSA");
          setTypeError("PERMISSÃO NEGADA");
          setMessageChat(true);
          setChat(false);
        }
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });

    return setTicketWindow(true);
  }

  function downloadMail({ content, data, sliceSize = 512 }) {
    const cleanBase64 = content.replace(/[^A-Za-z0-9+/]/g, ""); // Remove caracteres inválidos

    try {
      const byteCharacters = atob(cleanBase64);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
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

  useEffect(() => {
    if (fetchchat === true) {
      fetch("/helpdesk/update_chat/" + ticketID, {
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data !== null || data !== undefined || data !== "undefined") {
            var newChat = parseInt(data.chat.length);
            if (newChat > countchat) {
              setCountChat(newChat);
              reloadChat({ data: data });
            } else {
              return;
            }
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

  async function Close_ticket() {
    const dash = document.getElementById("dashboard");
    dash.style.filter = "blur(0)";
    setBlurNav("");
    setTicketWindow(false);
    setFetchChat(false);
    setImageUrl("");
    setFileTicket("");
    count = 0;
    clearTimeout(timeoutId);
    return;
  }

  useEffect(() => {
    if (tickets && Object.keys(tickets).length > 0) {
      const selectView = localStorage.getItem("selectView");
      if (selectView === null || selectView === "card") {
        return viewCard();
      } else {
        return listCard();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  function viewCard() {
    setTicketsDash([]);
    setLoading(false);
    setNavbar(true);
    setInCard(true);
    setInList(false);

    localStorage.setItem("selectView", "card");

    const btn = document.getElementById("selectView-Card");
    btn.style.backgroundColor = "#00B4D8";

    const btn2 = document.getElementById("selectView-List");
    btn2.style.backgroundColor = "transparent";

    var countTicket = 0;

    tickets.forEach((ticket) => {
      countTicket += 1;
      var date = new Date(ticket["start_date"]);

      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();

      function adicionaZero(numero) {
        if (numero < 10) {
          return "0" + numero;
        }
        return numero;
      }

      var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
      var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

      var newDate = dataFormatada + " " + horaFormatada;

      if (ticket["open"] === false) {
        colorBorder = "ticektClose";
      } else if (ticket["open"] === true && ticket["responsible_technician"] === null) {
        const currentDate = new Date();

        const diferenceMilisecond = currentDate - date;

        const diferenceDays = diferenceMilisecond / (1000 * 60 * 60 * 24);

        if (diferenceDays >= 7) {
          colorBorder = "ticketUrgent";
        } else {
          colorBorder = "ticektOpenNotView";
        }
      } else if (ticket["open"] === true && ticket["responsible_technician"] !== null) {
        colorBorder = "ticektOpenInView";
      } else if (ticket["open"] === null) {
        colorBorder = "ticketStop";
      }

      const Div = (
        <DivCard
          className={`animate__animated animate__zoomInDown ${colorBorder} ${themeCard}`}
          onClick={() => {
            helpdeskPage({ id: ticket["id"] });
          }}
        >
          <H5Card>chamado {ticket["id"]}</H5Card>
          <SpanCard>{ticket["ticketRequester"]}</SpanCard>
          <SpanCard>Ocorrência: {ticket["occurrence"]}</SpanCard>
          <SpanCard>Problema: {ticket["problemn"]}</SpanCard>
          <SpanCard>{newDate}</SpanCard>
        </DivCard>
      );

      setTicketsDash((ticketsDash) => [...ticketsDash, Div]);
      const dash = document.getElementById("dashboard");
      dash.classList.add("dashCard");

      if (countTicket > 5) {
        setBtnMore(true);
      }

      setLoadingDash(false);
      return ticketsDash;
    });
  }

  function listCard() {
    setTicketsDash([]);
    setNavbar(true);
    setLoading(false);
    setInList(true);
    setInCard(false);

    localStorage.setItem("selectView", "list");

    const btn = document.getElementById("selectView-List");
    btn.style.backgroundColor = "#00B4D8";

    const btn2 = document.getElementById("selectView-Card");
    btn2.style.backgroundColor = "transparent";

    var countTicket = 0;

    tickets.forEach((ticket) => {
      countTicket += 1;
      var date = new Date(ticket["start_date"]);

      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();

      function adicionaZero(numero) {
        if (numero < 10) {
          return "0" + numero;
        }
        return numero;
      }

      var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
      var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

      const newDate = dataFormatada + " " + horaFormatada;

      if (ticket["open"] === false) {
        colorBorder = "ticektCloseList";
      } else if (ticket["open"] === true && ticket["responsible_technician"] === null) {
        const currentDate = new Date();

        const diferenceMilisecond = currentDate - date;

        const diferenceDays = diferenceMilisecond / (1000 * 60 * 60 * 24);

        if (diferenceDays >= 7) {
          colorBorder = "ticketUrgentList";
        } else {
          colorBorder = "ticektOpenNotViewList";
        }
      } else if (ticket["open"] === true && ticket["responsible_technician"] !== null) {
        colorBorder = "ticektOpenInViewList";
      } else if (ticket["open"] === null) {
        colorBorder = "ticketStop";
      }
      const Div = (
        <TR
          key={ticket["id"]}
          className={`animate__animated animate__backInUp ${colorBorder}`}
          onClick={() => {
            helpdeskPage({ id: ticket["id"] });
          }}
        >
          <TD>{ticket["id"]}</TD>
          <TD>{ticket["ticketRequester"]}</TD>
          <TD>{ticket["occurrence"]}</TD>
          <TD>{ticket["problemn"]}</TD>
          <TD>{newDate}</TD>
        </TR>
      );

      const Space = <TRSPACE></TRSPACE>;

      setTicketsDash((ticketsDash) => [...ticketsDash, Div]); // Adiciona o cartão ao array de chamados.
      setTicketsDash((ticketsDash) => [...ticketsDash, Space]);
      const dash = document.getElementById("dashboard");
      dash.classList.add("dashCard");

      if (countTicket > 5) {
        setBtnMore(true);
      }

      setLoadingDash(false);
      return ticketsDash;
    });
  }

  function closeMessage() {
    setMessage(false);
  }

  function closeMessage2() {
    setMessageChat(false);
  }

  function NewChat(event) {
    const newText = event.target.value;
    if (event.key === "Enter") {
      setTextChat(newText);
      SendChat();
      event.preventDefault();
      return;
    } else {
      setTextChat(newText);
      return;
    }
  }

  /**
   * Função responsável por enviar e atualizar o chat de um chamado no sistema.
   * Envia uma mensagem para o servidor e, em seguida, atualiza a visualização do chat.
   */
  function SendChat() {
    // Cria uma instância de data para capturar o momento atual
    var date = new Date();

    // Função auxiliar para adicionar um zero à esquerda para números menores que 10
    function adicionaZero(numero) {
      if (numero < 10) {
        return "0" + numero;
      }
      return numero;
    }

    // Obtém o dia, mês e ano atuais
    var day = date.getDate();
    var month = date.getMonth() + 1; // O mês é baseado em zero, então soma-se 1
    var year = date.getFullYear();

    // Formata a data no formato DD/MM/AAAA
    var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;

    // Formata a hora no formato HH:MM
    var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

    // Limpa o campo de entrada do chat
    const input = document.getElementById("input-chat");
    input.value = "";

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
        User: Data.name, // Nome do usuário que está enviando a mensagem
        chat: textChat, // O conteúdo do chat
        hours: horaFormatada, // Hora formatada da mensagem
        date: dataFormatada, // Data formatada da mensagem
      }),
    })
      .then((response) => {
        // Converte a resposta para JSON
        return response.json();
      })
      .then((data) => {
        // Atualiza a interface do chat com os novos dados
        reloadChat({ data: data });
      })
      .catch((err) => {
        // Se ocorrer um erro, exibe a mensagem de erro no frontend
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        console.log(err); // Exibe o erro no console para depuração
      });
  }

  async function reloadChat({ data }) {
    if (data.chat !== null && data.chat !== undefined && data.chat !== "undefined") {
      setMessageError("");
      setTypeError("");
      setMessageChat(false);
      setCountChat(data.chat.length);
      setFetchChat(true);

      const regex = /\[\[([^[\]]+?)\],\[([^[\]]+?)\],\[([^[\]]+?)\]\]/g;

      const chatValue = [];
      let match;

      while ((match = regex.exec(data.chat)) !== null) {
        const [, value1, value2, value3] = match;
        chatValue.push([value1, value2, value3]);
      }

      setMountChat([]);

      const groupedByDate = {};

      chatValue.forEach((item) => {
        const date = item[0].split(":")[1].trim(); // Extrai a data do primeiro elemento
        if (!groupedByDate[date]) {
          groupedByDate[date] = [];
        }
        groupedByDate[date].push(item);
      });

      const renderGroupedItems = () => {
        const groupedItems = [];
        for (const date in groupedByDate) {
          groupedItems.push(
            <div key={date}>
              <div className="text-center d-flex justify-content-center text-break">
                <p className="pChat">{date}</p>
              </div>
              {groupedByDate[date].map((item, index) => {
                // Remover "User:" ou "Tech:" do início da string
                var userOrTech = item[1];
                var time = item[2];
                time = time.replace("Hours:", "").trim();
                if (userOrTech.includes("System")) {
                  userOrTech = userOrTech.replace("System:", "").trim();
                  return (
                    <div key={index}>
                      <div className="text-center d-flex justify-content-center text-break">
                        <div className="pChat">
                          <p>{userOrTech + " " + time}</p>
                        </div>
                      </div>
                    </div>
                  );
                } else if (userOrTech.includes("User")) {
                  userOrTech = userOrTech.replace("User:", "").trim();
                  return (
                    <div key={index}>
                      <DivFlex1 className="justify-content-end w-100 text-break position relative">
                        <div className="uChat1 position-relative">
                          <p>{userOrTech}</p>
                          <PChatHourR className="position-absolute bottom-0 end-0">{time}</PChatHourR>
                        </div>
                      </DivFlex1>
                    </div>
                  );
                } else {
                  userOrTech = userOrTech.replace("Technician:", "").trim();
                  return (
                    <div key={index}>
                      <DivFlex2 className="justify-content-start w-100 text-break position relative">
                        <div className="uChat2 position-relative">
                          <p>{userOrTech}</p>
                          <PChatHourL className="position-absolute bottom-0 start-0">{time}</PChatHourL>
                        </div>
                      </DivFlex2>
                    </div>
                  );
                }
              })}
            </div>
          );
        }
        return groupedItems;
      };

      setMountChat(renderGroupedItems());

      setChat(true);
    }
  }

  function imageclose() {
    setImageOpen(false);
  }

  function enableProblem() {
    const select = document.getElementById("selectOcorrence");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "infra":
        setFakeSelect(false);
        setProblemInfra(true);
        setProblemSyst(false);
        setProblemTicket(null);
        setSectorTicket("Infraestrutura");
        getTicketFilterSector({ sector: "Infraestrutura" });
        break;
      case "system":
        setFakeSelect(false);
        setProblemInfra(false);
        setProblemSyst(true);
        setProblemTicket(null);
        setSectorTicket("Sistema");
        getTicketFilterSector({ sector: "Sistema" });
        break;
      case "null":
        setFakeSelect(true);
        setProblemInfra(false);
        setProblemSyst(false);
        setProblemTicket(null);
        break;
      case "all":
        setFakeSelect(true);
        setProblemInfra(false);
        setProblemSyst(false);
        setSectorTicket("all");
        setProblemTicket(null);
        getTicketFilterSector({ sector: "all" });
        break;
    }
  }

  function changeProblemn() {
    const select = document.getElementById("selectBo");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "backup":
        setProblemTicket("Backup");
        getTicketFilterProblemn({ problemn: "Backup" });
        break;
      case "mail":
        setProblemTicket("E-mail");
        getTicketFilterProblemn({ problemn: "E-mail" });
        break;
      case "equipamento":
        setProblemTicket("Equipamento");
        getTicketFilterProblemn({ problemn: "Equipamento" });
        break;
      case "user":
        setProblemTicket("Gerenciamento de Usuario");
        getTicketFilterProblemn({ problemn: "Gerenciamento de Usuario" });
        break;
      case "internet":
        setProblemTicket("Internet");
        getTicketFilterProblemn({ problemn: "Internet" });
        break;
      case "permissao":
        setProblemTicket("Permissão");
        getTicketFilterProblemn({ problemn: "Permissão" });
        break;
      case "all":
        setProblemTicket("all");
        getTicketFilterProblemn({ problemn: "all" });
        break;
      case "sap":
        setProblemTicket("SAP");
        getTicketFilterProblemn({ problemn: "SAP" });
        break;
      case "mbi":
        setProblemTicket("MBI");
        getTicketFilterProblemn({ problemn: "MBI" });
        break;
      case "synchro":
        setProblemTicket("Synchro");
        getTicketFilterProblemn({ problemn: "Synchro" });
        break;
      case "office":
        setProblemTicket("Office");
        getTicketFilterProblemn({ problemn: "Office" });
        break;
      case "eng":
        setProblemTicket("Softwares de Eng");
        getTicketFilterProblemn({ problemn: "Softwares de Eng" });
        break;
    }
  }

  function moreTickets() {
    fetch("/helpdesk/moreTicket/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Ticket-Current": countTicket,
        "User-Data": Data.name,
        "ORDER-BY": orderby,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setCountTicket(data.count);
        setTickets(data.tickets);
        return countTicket;
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function getTicketFilterSector({ sector }) {
    setTickets([]);
    setTicketsDash([]);
    setLoadingDash(true);

    fetch("/helpdesk/getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Quantity-tickets": countTicket,
        "Order-by": orderby,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sector,
        "Status-Ticket": status,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setLoadingDash(false);
        if (data.tickets.length === 0) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
          return;
        } else {
          return setTickets(data.tickets);
        }
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function getTicketFilterProblemn({ problemn }) {
    setTickets([]);
    setTicketsDash([]);
    setLoadingDash(true);

    fetch("/helpdesk/getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Quantity-tickets": countTicket,
        "Order-by": orderby,
        "Problemn-Ticket": problemn,
        "Sector-Ticket": sectorTicket,
        "Status-Ticket": status,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.tickets.length === 0) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
          return;
        } else {
          setLoadingDash(false);
          return setTickets(data.tickets);
        }
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function getTicketFilter({ id, quantity }) {
    setTickets([]);
    setTicketsDash([]);
    setLoadingDash(true);
    const btn1 = document.getElementById("fiveView");
    btn1.style.backgroundColor = "transparent";

    const btn2 = document.getElementById("thenView");
    btn2.style.backgroundColor = "transparent";

    const btn3 = document.getElementById("fiftyView");
    btn3.style.backgroundColor = "transparent";

    const btn4 = document.getElementById("allView");
    btn4.style.backgroundColor = "transparent";

    const btn5 = document.getElementById(id);
    btn5.style.backgroundColor = "#00B4D8";

    fetch("/helpdesk/getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Quantity-tickets": quantity,
        "Order-by": orderby,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sectorTicket,
        "Status-Ticket": status,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.tickets.length === 0) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
          return;
        } else {
          setLoadingDash(false);
          return setTickets(data.tickets);
        }
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function getTicketFilterOrderTime({ order }) {
    setTickets([]);
    setTicketsDash([]);
    fetch("/helpdesk/getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Quantity-tickets": countTicket,
        "Order-By": order,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sectorTicket,
        "Status-Ticket": status,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.tickets.length === 0) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
          return;
        } else {
          setLoadingDash(false);
          return setTickets(data.tickets);
        }
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function selectOrder() {
    setTickets();
    setTicketsDash([]);
    const select = document.getElementById("select-order");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "recent":
        getTicketFilterOrderTime({ order: "-id" });
        setOrderBy("-id");
        break;
      case "ancient":
        getTicketFilterOrderTime({ order: "id" });
        setOrderBy("id");
        break;
    }
  }

  function getTicketKey(event) {
    const newText = event.target.value;

    const select1 = document.getElementById("selectOcorrence");
    select1.value = null;

    setProblemSyst(false);
    setProblemInfra(false);
    setFakeSelect(true);
    setTicketsDash([]);
    fetch("/helpdesk/getTicketFilterWords/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Word-Filter": newText,
        "Order-By": orderby,
        "Quantity-tickets": countTicket,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.tickets.length === 0) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
          return;
        } else {
          setLoadingDash(false);
          return setTickets(data.tickets);
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

  function ticketOpen() {
    setTickets();
    setTicketsDash([]);
    const btn = document.getElementById("btnopen");
    btn.classList.add("btn-open");
    const btn2 = document.getElementById("btnclose");
    btn2.classList.remove("btn-success");
    const btn3 = document.getElementById("btnstop");
    btn3.classList.remove("btn-light");
    const btn4 = document.getElementById("btnall");
    btn4.classList.remove("btn-all");

    fetch("/helpdesk/getTicketFilterStatus/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Order-By": orderby,
        "Quantity-tickets": countTicket,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sectorTicket,
        "Status-Request": "open",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.tickets.length === 0) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
          return;
        } else {
          setLoadingDash(false);
          setStatus("open");
          return setTickets(data.tickets);
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

  function ticketClose() {
    setTickets([]);
    setTicketsDash([]);
    const btn = document.getElementById("btnopen");
    btn.classList.remove("btn-open");
    const btn2 = document.getElementById("btnclose");
    btn2.classList.add("btn-success");
    const btn3 = document.getElementById("btnstop");
    btn3.classList.remove("btn-light");
    const btn4 = document.getElementById("btnall");
    btn4.classList.remove("btn-all");

    fetch("/helpdesk/getTicketFilterStatus/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Order-By": orderby,
        "Quantity-tickets": countTicket,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sectorTicket,
        "Status-Request": "close",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.tickets.length === 0) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
          return;
        } else {
          setLoadingDash(false);
          setStatus("close");
          return setTickets(data.tickets);
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

  function ticketStop() {
    setTickets([]);
    setTickets([]);
    const btn = document.getElementById("btnopen");
    btn.classList.remove("btn-open");
    const btn2 = document.getElementById("btnclose");
    btn2.classList.remove("btn-success");
    const btn3 = document.getElementById("btnstop");
    btn3.classList.add("btn-light");
    const btn4 = document.getElementById("btnall");
    btn4.classList.remove("btn-all");

    fetch("/helpdesk/getTicketFilterStatus/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Order-By": orderby,
        "Quantity-tickets": countTicket,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sectorTicket,
        "Status-Request": "stop",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.tickets.length === 0) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
        } else {
          setLoadingDash(false);
          setStatus("close");
          setTickets(data.tickets);
        }
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function statusTicketAll() {
    setTickets([]);
    setTicketsDash([]);
    const btn = document.getElementById("btnopen");
    btn.classList.remove("btn-open");
    const btn2 = document.getElementById("btnclose");
    btn2.classList.remove("btn-success");
    const btn3 = document.getElementById("btnstop");
    btn3.classList.remove("btn-light");
    const btn4 = document.getElementById("btnall");
    btn4.classList.add("btn-all");

    fetch("/helpdesk/getTicketFilterStatus/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Order-By": orderby,
        "Quantity-tickets": countTicket,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sectorTicket,
        "Status-Request": "all",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.tickets.length === 0) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
          return;
        } else {
          setLoadingDash(false);
          setStatus("all");
          return setTickets(data.tickets);
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

  function UploadNewFiles(evt) {
    // Adiciona os novos arquivos ao array UpNwfile
    UpNwfile.push(evt.target.files);

    // Itera sobre os arquivos no array UpNwfile
    for (let i = 0; i < UpNwfile.length; i++) {
      // Atualiza o estado dos arquivos a serem enviados
      setUploadNewFiles((uploadNewFiles) => [...uploadNewFiles, ...UpNwfile[i]]);
    }

    // A função não retorna nenhum valor
    return uploadNewFiles;
  }

  function closeNWFiles() {
    setUploadNewFiles("");
    setNewFiles(false);
  }

  function submitNewFiles() {
    // Cria um objeto FormData para enviar os arquivos e informações adicionais
    const formData = new FormData();

    // Adiciona os arquivos selecionados ao FormData
    for (let i = 0; i < uploadNewFiles.length; i++) {
      const file = uploadNewFiles[i];

      formData.append("files", file);
    }

    // Função para adicionar zero à esquerda de números menores que 10
    function adicionaZero(numero) {
      if (numero < 10) {
        return "0" + numero;
      }
      return numero;
    }

    // Obtém e formata a data e a hora atuais
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
    var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

    // Adiciona a data e hora ao FormData
    formData.append("date", dataFormatada);
    formData.append("hours", horaFormatada);

    // Envia os arquivos e dados ao servidor
    fetch("/dashboard_TI/upload-new-files/" + ticketID, {
      method: "POST",
      headers: {
        "X-CSRFToken": token,
        "Cache-Control": "no-cache",
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
        reloadFiles({
          files: data.files,
          name_file: data.name_file,
          content_file: data.content_file,
        });
        reloadChat({ data: data.chat });
      })
      .catch((err) => {
        // Exibe mensagem de erro e loga o erro no console
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        console.log(err);
      });
  }

  function reloadFiles({ files, name_file, content_file }) {
    for (let i = 0; i < files.length; i++) {
      var file = files[i];
      if (file === "mail") {
        const contentFileMail = content_file[i];
        const nameFileMail = name_file[i];
        const Div = (
          <div className="text-center">
            <DivOnBoardFile className="position-relative">
              <IMGFiles src={Mail} alt="" />
              <ImageFile
                className="position-absolute bottom-0 start-50 translate-middle-x"
                src={Download}
                alt=""
                onClick={() => {
                  const blob = downloadMail({
                    data: "message/rfc822",
                    content: contentFileMail,
                  });

                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = nameFileMail;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              />
            </DivOnBoardFile>{" "}
            <div>{nameFileMail}</div>
          </div>
        );
        setFileTicket((fileticket) => [...fileticket, Div]);
      } else if (file === "excel") {
        const ContentFileExcel = content_file[i];
        const NameFileExcel = name_file[i];
        const Div = (
          <DivOnBoardFile className="position-relative">
            <IMGFiles src={XLS} alt="" />
            <ImageFile
              className="position-absolute bottom-0 start-50 translate-middle-x"
              src={Download}
              alt=""
              onClick={() => {
                const blob = downloadMail({
                  data: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  content: ContentFileExcel,
                });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = NameFileExcel;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            />
            <p className="text-center text-break">{NameFileExcel}</p>
          </DivOnBoardFile>
        );
        setFileTicket((fileticket) => [...fileticket, Div]);
      } else if (file === "zip") {
        const ContentFileZip = content_file[i];
        const NameFileZip = name_file[i];
        const Div = (
          <DivOnBoardFile className="position-relative">
            <IMGFiles src={ZIP} alt="" />
            <ImageFile
              className="position-absolute bottom-0 start-50 translate-middle-x"
              src={Download}
              alt=""
              onClick={() => {
                const blob = downloadMail({
                  data: "application/zip",
                  content: ContentFileZip,
                });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = NameFileZip;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            />
            <p className="text-center text-break">{NameFileZip}</p>
          </DivOnBoardFile>
        );
        setFileTicket((fileticket) => [...fileticket, Div]);
      } else if (file === "txt") {
        const ContentFileTXT = content_file[i];
        const NameFileTXT = name_file[i];
        const Div = (
          <DivOnBoardFile className="position-relative">
            <IMGFiles src={TXT} alt="" />
            <ImageFile
              className="position-absolute bottom-0 start-50 translate-middle-x"
              src={Download}
              alt=""
              onClick={() => {
                const blob = downloadMail({
                  data: "text/plain",
                  content: ContentFileTXT,
                });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = NameFileTXT;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            />
            <p className="text-center text-break">{NameFileTXT}</p>
          </DivOnBoardFile>
        );
        setFileTicket((fileticket) => [...fileticket, Div]);
      } else if (file === "word") {
        const ContentFileWord = content_file[i];
        const NameFileWord = name_file[i];
        const Div = (
          <DivOnBoardFile className="position-relative">
            <IMGFiles src={WORD} alt="" />
            <ImageFile
              className="position-absolute bottom-0 start-50 translate-middle-x"
              src={Download}
              alt=""
              onClick={() => {
                const blob = downloadMail({
                  data: "application/pdf",
                  content: ContentFileWord,
                });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = NameFileWord;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            />{" "}
            <p className="text-center text-break">{NameFileWord}</p>
          </DivOnBoardFile>
        );
        setFileTicket((fileticket) => [...fileticket, Div]);
      } else if (file === "pdf") {
        const ContentFilePDF = content_file[i];
        const NameFilePDF = name_file[i];
        const Div = (
          <DivOnBoardFile className="position-relative">
            <IMGFiles src={PDF} alt="" />
            <ImageFile
              className="position-absolute bottom-0 start-50 translate-middle-x"
              src={Download}
              alt=""
              onClick={() => {
                const blob = downloadMail({
                  data: "application/pdf",
                  content: ContentFilePDF,
                });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = NameFilePDF;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            />
            <p className="text-center text-break">{NameFilePDF}</p>
          </DivOnBoardFile>
        );
        setFileTicket((fileticket) => [...fileticket, Div]);
      } else if (typeof file === "object") {
        const image = file.image;
        const nameFile = name_file[i];
        const Div = (
          <DivOnBoardFile className="position-relative">
            <IMGFiles
              src={`data:image/jpeg;base64,${file.image}`}
              onClick={() => {
                setImageUrl(`data:image/jpeg;base64,${image}`);
                openImage();
              }}
              alt=""
            />
            <ImageFile
              className="position-absolute bottom-0 start-50 translate-middle-x"
              src={Download}
              alt=""
              onClick={() => {
                const link = document.createElement("a");
                link.href = `data:image/jpeg;base64,${image}`;
                link.download = nameFile;
                link.click();
                link.remove();
              }}
            />
            <p className="text-center text-break">{nameFile}</p>
          </DivOnBoardFile>
        );
        setFileTicket((fileticket) => [...fileticket, Div]);
      }
    }
  }

  function downloadTicket() {
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
        const blob = downloadMail({
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

  return (
    <Div className={theme}>
      {navbar && (
        <div className={blurNav}>
          <Navbar Name={Data.name} JobTitle={Data.job_title} />
        </div>
      )}
      {message && (
        <div className="position-absolute top-0 start-50 translate-middle-x mt-5 z-3">
          <Message TypeError={typeError} MessageError={messageError} CloseMessage={closeMessage} />
        </div>
      )}
      <TitlePage className="text-center text-light mt-3">Histórico de Chamados</TitlePage>
      <DivFilter className={`${blurNav} ${themeFilter}`}>
        <div className="form-floating">
          <Input1 type="text" className="form-control" id="floatingInput" onKeyDown={getTicketKey} />
          <label htmlFor="floatingInput">Ocorrência | Problema | Data...</label>
        </div>
        <Select1 id="selectOcorrence" className="form-select" onChange={enableProblem}>
          <option value="null" selected disabled>
            Tipo de Ocorrência
          </option>
          <option value="infra">Infra</option>
          <option value="system">Sistema</option>
          <option value="all">Todos</option>
        </Select1>
        {fakeSelect && (
          <Select1 className="form-select" disabled>
            <option selected>Problema</option>
          </Select1>
        )}
        {problemInfra && (
          <Select1
            id="selectBo"
            className="form-select"
            onChange={() => {
              changeProblemn();
            }}
          >
            <option value="" selected disabled>
              Problema
            </option>
            <option value="backup">Backup/Restore</option>
            <option value="mail">E-mail</option>
            <option value="equipamento">Equipamento</option>
            <option value="user">Gerenciamento de Usuario</option>
            <option value="internet">Internet</option>
            <option value="permissao">Pasta</option>
            <option value="all">Todos</option>
          </Select1>
        )}
        {problemSyst && (
          <Select1
            id="selectBo"
            className="form-select"
            onChange={() => {
              changeProblemn();
            }}
          >
            <option value="" selected disabled>
              Problema
            </option>
            <option value="sap">SAP</option>
            <option value="mbi">MBI</option>
            <option value="synchro">Synchro</option>
            <option value="office">Office</option>
            <option value="eng">Softwares de Eng</option>
            <option value="all">Todos</option>
          </Select1>
        )}
        <Select1 name="" id="select-order" className="form-select" onChange={selectOrder}>
          <option value="none" disabled>
            Ordernar
          </option>
          <option selected value="recent">
            Data Recente
          </option>
          <option value="ancient">Data Antiga</option>
        </Select1>
        <DivContainerImages className="d-flex">
          <PSelectView className="position-absolute top-0 start-0 translate-middle">Quantidade</PSelectView>
          <DivImages
            className="btn"
            id="fiveView"
            onClick={() => {
              setCountTicket(5);
              getTicketFilter({ id: "fiveView", quantity: 5 });
            }}
          >
            <IMGS1 src={IMG1} alt="" />
            <PQuantity>5</PQuantity>
          </DivImages>
          <DivImages
            className="btn"
            id="thenView"
            onClick={() => {
              setCountTicket(10);
              getTicketFilter({ id: "thenView", quantity: 10 });
            }}
          >
            <IMGS1 src={IMG2} alt="" />
            <PQuantity>10</PQuantity>
          </DivImages>
          <DivImages
            className="btn"
            id="fiftyView"
            onClick={() => {
              setCountTicket(50);
              getTicketFilter({ id: "fiftyView", quantity: 50 });
            }}
          >
            <IMGS1 src={IMG3} alt="" />
            <PQuantity>50</PQuantity>
          </DivImages>
          <DivImages
            className="btn"
            id="allView"
            onClick={() => {
              setCountTicket(100000);
              getTicketFilter({ id: "allView", quantity: 100000 });
            }}
          >
            <IMGS1 src={IMG4} alt="" />
            <PQuantity>todos</PQuantity>
          </DivImages>
        </DivContainerImages>
        <DivSelectView>
          <PSelectView className="position-absolute top-0 start-0 translate-middle">Modo de Visualização</PSelectView>
          <button className="btn" id="selectView-List" onClick={listCard}>
            <ImgSelectView src={List} className="img-fluid" alt="" />
          </button>
          <button className="btn" id="selectView-Card" onClick={viewCard}>
            <ImgSelectView src={Card} clasName="img-fluid" alt="" />
          </button>
        </DivSelectView>
        <DivSelectView>
          <PSelectView className="position-absolute top-0 start-0 translate-middle">Status</PSelectView>
          <Button1
            className="btn btn-open"
            id="btnopen"
            onClick={() => {
              ticketOpen();
            }}
          >
            Aberto
          </Button1>
          <button
            className="btn"
            value="close"
            id="btnclose"
            onClick={() => {
              ticketClose();
            }}
          >
            Fechado
          </button>
          <button
            className="btn"
            value="close"
            id="btnstop"
            onClick={() => {
              ticketStop();
            }}
          >
            Aguardo
          </button>
          <Button2
            className="btn"
            value="all"
            id="btnall"
            onClick={() => {
              statusTicketAll();
            }}
          >
            Todos
          </Button2>
        </DivSelectView>
      </DivFilter>
      <section ref={dashBoard} id="dashboard">
        {loadingDash && (
          <div className="position-absolute top-50 start-50 translate-middle">
            <Loading />
          </div>
        )}
        {inList && (
          <Table>
            <thead>
              <TH className={colorTheme}>Chamado</TH>
              <TH className={colorTheme}>Usuario</TH>
              <TH className={colorTheme}>Ocorrencia</TH>
              <TH className={colorTheme}>Descrição</TH>
              <TH className={colorTheme}>Data Abertura</TH>
            </thead>
            <tbody>{ticketsDash}</tbody>
          </Table>
        )}
        {inCard && <>{ticketsDash}</>}
      </section>
      {ticketWindow && (
        <TicketOpen className="position-fixed top-50 start-50 translate-middle">
          {loading && <Loading />}
          <div>
            <div className="w-100 d-flex">
              <div className="d-flex justify-content-start w-100">
                <BtnNF onClick={downloadTicket}>
                  <img src={DownTick} alt="download Ticket" />
                </BtnNF>
              </div>
              <div className="w-100 justify-content-center d-flex">
                <h3 className="text-center text-uppercase fw-bold text-danger mt-3">chamado {ticketID}</h3>
              </div>
              <div className="w-100 justify-content-end d-flex">
                <CloseBTN onClick={Close_ticket}>
                  <Close src={CloseIMG} alt="" />
                </CloseBTN>
              </div>
            </div>
            <div className="d-flex flex-column">
              <input type="text" value={"Usuário: " + ticketNAME} className="form-control" disabled />
              <input type="text" value={"Departamento: " + ticketDEPARTMENT} className="form-control" disabled />
              <input type="text" value={"Email: " + ticketMAIL} className="form-control" disabled hidden={ticketMAIL.length > 1 ? false : true} />
              <input type="text" value={"Unidade: " + ticketCOMPANY} className="form-control" disabled />
              <input type="text" value={"Setor: " + ticketSECTOR} className="form-control" disabled />
              <input type="text" value={"Ocorrência: " + ticketOCCURRENCE} className="form-control" disabled />
              <input type="text" hidden={!showEquipament} value={"Detalhes: " + ticketPROBLEMN} className="form-control" disabled />
              {showEquipament && (
                <div>
                  <input type="text" value={"Detalhes: " + ticketPROBLEMN} className="form-control" disabled />
                  <input value={"ID do Equipamento: " + equipament} className="form-control" disabled />
                </div>
              )}
              <TextObersavation ref={textareaRef} name="observation" className="autosize-textarea" disabled></TextObersavation>
              <input type="text" value={"tempo de vida do chamado: " + lifeTime + " dias"} className="form-control" disabled />
              <DivFile hidden={fileticket.length >= 1 ? false : true} className="w-100">
                {fileticket}
              </DivFile>
              <input type="text" value={"Tecnico responsavel: " + (ticketResponsible_Technician ? ticketResponsible_Technician : "Nenhum técnico atribuído")} className="form-control" disabled />
            </div>
            <DivChat id="chatDiv">
              {mountChat}
              {messageChat && (
                <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                  <Message TypeError={typeError} MessageError={messageError} CloseMessage={closeMessage2} />
                </div>
              )}
            </DivChat>
            {chat && (
              <div className="w-100 d-flex">
                <div className="w-100">
                  <input className="form-control h-100 fs-5" type="text" onKeyUp={NewChat} id="input-chat" />
                </div>
                <BtnChat2>
                  <InputFile className="w-100 cursor" type="file" multiple onInput={UploadNewFiles} />
                </BtnChat2>
                <div>
                  <BtnChat className="btn" type="submit" onClick={SendChat}></BtnChat>
                </div>
              </div>
            )}
          </div>
          {newFiles && (
            <DivNewFiles className="position-absolute top-50 start-50 translate-middle d-flex flex-column">
              <div className="w-100 d-flex">
                <div className="w-100 text-center mb-2">
                  <h3 className="text-light fw-bold">Arquivos</h3>
                </div>
                <div className="h-100 align-items-start justify-content-end d-flex">
                  <BtnNF className="bg-transparent pe-auto" onClick={closeNWFiles}>
                    <ImgBTNCls src={CloseIMG} alt="Fechar" />
                  </BtnNF>
                </div>
              </div>
              <AdjustListFiles>{nameNWFiles}</AdjustListFiles>
              <div className="d-flex justify-content-end align-items-center flex-column">
                <DivHR></DivHR>
                <button className="btn btn-success w-50 mt-2" onClick={submitNewFiles}>
                  Enviar
                </button>
              </div>
            </DivNewFiles>
          )}
        </TicketOpen>
      )}
      {btnmore && (
        <div className={`w-100 text-center ${blurNav}`}>
          <button className="btn btn-info mb-5" onClick={moreTickets}>
            Carregar Mais
          </button>
        </div>
      )}
      {imageopen && (
        <DivImageOpen className="position-fixed top-50 start-50 translate-middle">
          <div className="w-100 position-relative">
            <BtnOpen onClick={imageclose} className="position-absolute top-0 end-0">
              <Close src={CloseIMG} alt="" />
            </BtnOpen>
          </div>
          <ImageOpen src={imageurl} alt="" />
        </DivImageOpen>
      )}
    </Div>
  );
}
