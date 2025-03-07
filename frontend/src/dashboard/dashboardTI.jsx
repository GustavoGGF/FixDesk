/**
 * Importações internas necessárias para este componente.
 * - React, useEffect, useState, useRef: importações do React.
 * - DayPicker: componente de seleção de data.
 * - ptBR: localização em português brasileiro para o componente DayPicker.
 * - "react-day-picker/dist/style.css": estilos CSS para o componente DayPicker.
 */
import React, { useEffect, useState, useRef, useContext } from "react";
import "react-day-picker/dist/style.css";

/**
 * Importações de elementos DOM, componentes e imagens necessárias para este componente.
 * - Navbar: componente de barra de navegação.
 * - Div, DropdownConten, Dropdown, DropdownButton, DivDrop, P1, DivFilter, IMGConfig, DropBTN, DropContent2, DivModify,
 *   InputTicket, ZIndex, DivDetaisl, DivChatDetails, ImgSend, TextObersavation:
 *   importações de elementos DOM do módulo "../styles/dashboardTI.js".
 * - Loading: componente de carregamento.
 * - DashBoardPie: componente de gráfico de pizza do painel de instrumentos.
 * - TicketOpen, CloseBTN, Close, DivChat, BtnChat, PSelectView, PQuantity, DivSelectView, DivCard, H5Card, SpanCard,
 *   DivList, SpanList, ImgSelectView, Input1, Select1, DivContainerImages, DivImages, IMGS1, Button1, Button2,
 *   DivOnBoardFile, IMGFiles, ImageFile, DivFile, DivImageOpen, BtnOpen, ImageOpen, BtnChat2, InputFile, DivNewFiles,
 *   DivHR, PNWFile, AdjustListFiles, ImgBTNCls, BtnNF, PBloq, DivINp, DivAlocate, IMGFiles2, Calendar, DivCal,
 *   DivFlex1, DivFlex2, PChatHourR, PChatHourL:
 *   importações de elementos DOM do módulo "../styles/historyStyle".
 * - DropDown: importação de elementos DOM do módulo "../styles/navbarStyle.js".
 * - DivNameFile, BtnFile, ImgFile, Select, TitlePage: importações de elementos DOM do módulo "../styles/helpdeskStyle.js".
 * - CloseIMG: importação da imagem "close.png" localizada em "../images/components".
 * - Message: componente de mensagem.
 * - "../styles/bootstrap/css/bootstrap.css": importação do arquivo CSS do Bootstrap.
 * - "../styles/bootstrap/js/bootstrap": importação do arquivo JavaScript do Bootstrap.
 * - IMG1, IMG2, IMG3, IMG4: importações de imagens do painel de instrumentos.
 * - Registration: componente de registro de equipamento.
 * - List: importação da imagem "lista-de-itens.png" localizada em "../images/components".
 * - Card: importação da imagem "identificacao.png" localizada em "../images/components".
 * - DashboardBar: componente de barra do painel de instrumentos.
 * - Mail, XLS, ZIP, TXT, WORD, PDF, Download, Exclude, DownTick, Seeting, Send: importações de imagens de componentes.
 */
import { ButtonDet, Div, DivChatDetails, DivDetaisl, DivFilter, DropBTN, DropContent2, IMGConfig, ImgSend, TextObersavation, ZIndex } from "../styles/dashboardTI.js";
import DashBoardPie from "../components/dashboardPie";
import Loading from "../components/loading";
import Navbar from "../components/navbar";
import {
  AdjustListFiles,
  BtnChat,
  BtnChat2,
  BtnNF,
  Button1,
  Button2,
  Close,
  CloseBTN,
  DivCard,
  DivChat,
  DivContainerImages,
  DivFile,
  DivFlex1,
  DivFlex2,
  DivHR,
  DivImageOpen,
  DivImages,
  DivNewFiles,
  DivOnBoardFile,
  DivSelectView,
  H5Card,
  IMGFiles,
  IMGS1,
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
  SpanCard,
  Select1,
  TD,
  TH,
  TR,
  TRSPACE,
  Table,
  TicketOpen,
  BtnOpen,
} from "../styles/historyStyle.js";
import { DropDown } from "../styles/navbarStyle.js";
import { BtnFile, DivNameFile, ImgFile, TitlePage } from "../styles/helpdeskStyle.js";
import CloseIMG from "../images/components/close.png";
import Message from "../components/message";
import "../styles/bootstrap/css/bootstrap.css";
import "../styles/bootstrap/js/bootstrap";
import Card from "../images/components/identificacao.png";
import DashboardBar from "../components/dashboardBar.jsx";
import Download from "../images/components/download.png";
import DownTick from "../images/components/attachment.png";
import Exclude from "../images/components/close.png";
import IMG1 from "../images/dashboard_TI/quantity_1.png";
import IMG2 from "../images/dashboard_TI/quantity_2.png";
import IMG3 from "../images/dashboard_TI/quantity_3.png";
import IMG4 from "../images/dashboard_TI/quantity_4.png";
import List from "../images/components/lista-de-itens.png";
import Mail from "../images/components/mail.png";
import PDF from "../images/components/pdf.png";
import Seeting from "../images/components/definicoes.png";
import Send from "../images/components/enviar.png";
import TXT from "../images/components/arquivo-txt.png";
import WORD from "../images/components/palavra.png";
import XLS from "../images/components/xlsx.png";
import ZIP from "../images/components/zip.jpg";
import { TickerContext } from "../services/TickerContext.js";
import LoadingChat from "../components/loadingChat.jsx";
/**
 * Função para ajustar o tema com base na configuração de tema armazenada.
 * - Utiliza o hook useEffect para executar a lógica uma vez após a renderização inicial.
 * - Define o título da página como "DashBoard TI".
 * - Verifica se há uma configuração de tema armazenada no localStorage.
 *   - Se não houver configuração de tema ou se for "black", define o tema como "black" e chama a função ThemeBlack().
 *   - Caso contrário, chama a função ThemeLight().
 */

export default function DashboardTI() {
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
    document.title = "DashBoard TI";
    const theme = localStorage.getItem("Theme");
    if (theme === null || theme === "black") {
      localStorage.setItem("Theme", "black");
      return ThemeBlack();
    } else {
      return ThemeLight();
    }
  }, []);

  /**
   * Variáveis de estado para o componente DashboardTI.
   */

  /**
   * Variáveis de estado Boolean
   */
  const [btnmore, setBtnMore] = useState(true);
  const [chat, setChat] = useState(false);
  const [fakeSelect, setFakeSelect] = useState(true);
  const [fetchChat, setFetchChat] = useState(false);
  const [imageopen, setImageOpen] = useState(false);
  const [inCard, setInCard] = useState(false);
  const [isAtButton, setIsAtButton] = useState(false);
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingDash, setLoadingDash] = useState(true);
  const [message, setMessage] = useState(false);
  const [messageChat, setMessageChat] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const [newFiles, setNewFiles] = useState(false);
  const [problemInfra, setProblemInfra] = useState(false);
  const [problemSyst, setProblemSyst] = useState(false);
  const [techDetails, setTechDetails] = useState(false);
  const [ticketWindow, setTicketWindow] = useState(false);
  const [showEquipament, setShowEquipament] = useState(false);
  /**
   * Variáveis de estado String
   */
  const [classBlur, setClassBlur] = useState("");
  const [colorTheme, setColorTheme] = useState("");
  const [detailsChat, setDetailsChat] = useState("");
  const [lifeTime, setLifetime] = useState("");
  const [messageError, setMessageError] = useState("");
  const [mountDetails, setMountDetails] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
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
  const [ticketResponsible_Technician, setTicketResponsible_Technician] = useState("");
  const [ticketSECTOR, setTicketSECTOR] = useState("");
  const [token, setToken] = useState("");
  const [typeError, setTypeError] = useState("");
  const [equipament, setEquipament] = useState("");
  /**
   * Variáveis de estado Void.
   */
  const [countChat, setCountChat] = useState();
  const [imageurl, setImageUrl] = useState();
  const [initUpdateChat, setInitUpdateChat] = useState();
  const [nameNWFiles, setNameNWFiles] = useState();
  const [ticketOpen, setTicketOpen] = useState();
  /**
   * Variáveis de estado Int.
   */
  const [countTicket, setCountTicket] = useState(0);
  /**
   * Variáveis de estado Array.
   */
  const [fileticket, setFileTicket] = useState([]);
  const [mountChat, setMountChat] = useState([]);
  const [ticketsDash, setTicketsDash] = useState([]);
  const [techs, setTechs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [uploadNewFiles, setUploadNewFiles] = useState([]);
  const [userData, setUserData] = useState([]);
  /**
   * Variáveis de estado Null.
   */
  const [orderby, setOrderBy] = useState(null);
  const [problemTicket, setProblemTicket] = useState(null);
  const [sectorTicket, setSectorTicket] = useState(null);
  /**
   * Variáveis de referência para o componente DashboardTI.
   */
  const allView = useRef(null);
  const btnAll = useRef(null);
  const btnClose = useRef(null);
  const btnOpen = useRef(null);
  const btnStop = useRef(null);
  const dropCont = useRef(null);
  const inputChat = useRef(null);
  const inputRef = useRef(null);
  const fiftyView = useRef(null);
  const fiveView = useRef(null);
  const selectBo = useRef(null);
  const selectOcorrence = useRef(null);
  const selectOrderO = useRef(null);
  const sectionTicket = useRef(null);
  const selectViewCard = useRef(null);
  const selectViewList = useRef(null);
  const textareaRef = useRef(null);
  const thenView = useRef(null);
  const divRefs = useRef({});

  // Declarando variaveis de Contexto
  const { setCreate_user_acess } = useContext(TickerContext);
  const { setAlocate_Machine_Acess } = useContext(TickerContext);

  /**
   * Função ativada quando a tela de ticket for ativada.
   * Se o textarea tiver conteúdo, a função para ajustar o tamanho do textarea é ativada.
   */
  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== null) {
      resizeTextarea();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketWindow]);

  // useEffect que verifica se ouve mudança no chat
  useEffect(() => {
    if (chat && isAtButton) {
      // entra na condição caso chat estejá ativo e caso o usuario tivesse na ultima menssagem do chat
      var div = document.getElementById("chatDiv");
      div.scrollTop = div.scrollHeight; //então mostra a ultima menssagem
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mountChat]);

  /**
   * Função para ajustar o tamanho do textarea com base no conteúdo.
   * @param {HTMLTextAreaElement} textarea - O elemento textarea para redimensionar.
   */
  function resizeTextarea() {
    // Força o navegador a recalcular o lineHeight após um pequeno atraso
    setTimeout(() => {
      const lineHeight = parseInt(window.getComputedStyle(textareaRef.current).lineHeight);
      const lines = textareaRef.current.value.split("\n").length;
      const lastLineLength = textareaRef.current.value.split("\n").pop().length;
      const extraLines = textareaRef.current.value.endsWith("\n") ? 1 : 0; // Contabiliza uma linha extra se o texto terminar com uma quebra de linha
      const totalLines = lines + extraLines;
      const height = lineHeight * totalLines + (lastLineLength === 0 ? lineHeight : 0); // Adiciona altura extra se a última linha estiver vazia

      textareaRef.current.style.height = height + "px";
    }, 0);
  }

  /**
   * Função para alterar o tema da aplicação para o modo escuro.
   * Limpa os filtros e estilos de cartões existentes e define o tema como "themeBlack".
   */
  function ThemeBlack() {
    setThemeFilter("");
    setThemeCard("");
    setColorTheme("colorBlack");
    setTheme("themeBlack");
  }

  /**
   * Função para alterar o tema da aplicação para o modo claro.
   * Define os estilos de cartões e filtros como claros e define o tema como "themeLight".
   */
  function ThemeLight() {
    setThemeCard("themeCardLight");
    setThemeFilter("themeFilterLight");
    setColorTheme("colorLight");
    setTheme("themeLight");
  }

  // Declaração de variáveis para uso posterior no código.
  let count = 0; // Variável para armazenar contagem.
  let timeoutId; // Variável para armazenar identificador de tempo limite.
  const UpNwfile = []; // Array para armazenar novos arquivos.
  let colorBorder = ""; // Variável para armazenar cor da borda.

  /**
   * Função para aumentar o contador de atualização de conversas no chat do chamado ativo.
   * Atualiza o estado com o novo valor de contagem.
   * Limpa o identificador de tempo limite, se existir.
   * Configura um novo identificador de tempo limite para chamar recursivamente esta função após 10 segundos.
   * @returns O identificador de tempo limite para a próxima chamada da função.
   */
  function aumentarCount() {
    count++;

    setInitUpdateChat(count);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    return (timeoutId = setTimeout(aumentarCount, 10000)); // Chama a função novamente após 10 segundos
  }

  /**
   * useEffect para carregar os dados do usuário armazenados localmente ao carregar a página.
   * Faz uma solicitação ao backend para obter os nomes dos técnicos e o token CSRF.
   * Define os dados dos técnicos e o token CSRF nos useState correspondentes.
   * Em caso de erro, exibe uma mensagem de erro fatal.
   */
  useEffect(() => {
    const dataInfo = JSON.parse(localStorage.getItem("dataInfo"));
    setUserData(dataInfo.data);
    fetch("", {
      method: "POST",
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setTechs(data.techs);
        setToken(data.token);
        return userData;
      })
      .catch((err) => {
        setTypeError("FATAL ERROR");
        setMessageError(err);
        setMessage(true);
        return console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * useEffect ativado quando os dados do usuário são alterados para buscar os chamados.
   * Verifica se os dados do usuário estão disponíveis e não vazios.
   * Define as flags de exibição da barra de navegação e do botão de menu suspenso como verdadeiras.
   * Faz uma solicitação ao backend para obter os chamados de TI.
   * Define os parâmetros de contagem, ordenação e estilo de visualização dos chamados.
   * Define os chamados no estado correspondente.
   * Em caso de erro, exibe uma mensagem de erro fatal.
   */
  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      // Verifica se os dados do usuário estão disponíveis e não vazios.
      var quantity = localStorage.getItem("quantity");
      if (quantity === null) {
        localStorage.setItem("quantity", "10");
        quantity = 10;
      }

      var status = localStorage.getItem("status");
      if (status === null) {
        localStorage.setItem("status", "open");
        status = "open";
      }
      setNavbar(true); // Define a flag de exibição da barra de navegação como verdadeira.
      fetch("get_ticket_TI/" + quantity + "/" + status, {
        // Faz uma solicitação ao backend para obter os chamados de TI.
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          return response.json(); // Converte a resposta para JSON.
        })
        .then((data) => {
          setCountTicket(quantity); // Define a contagem inicial de chamados como 10.
          setOrderBy("-id"); // Define a ordenação inicial dos chamados.

          // Mapeia valores de quantity para os refs correspondentes
          const refMapQuantity = {
            5: fiveView,
            10: thenView,
            50: fiftyView,
            100000: allView, // Supondo que "all" seja um valor possível
          };

          // Obtém o ref correspondente ao valor de quantity
          const selectedRefQuantity = refMapQuantity[quantity];

          // Aplica o estilo apenas se o ref existir
          if (selectedRefQuantity?.current) {
            selectedRefQuantity.current.style.backgroundColor = "#00B4D8";
          }

          switch (status) {
            default:
              break;
            case "open":
              btnOpen.current.classList.add("btn-open"); // Marca o botão "Open" como ativo
              break;
            case "stop":
              btnStop.current.classList.add("btn-light"); // Remove o estilo de luz do botão "Stop"
              break;
            case "close":
              btnClose.current.classList.add("btn-success"); // Remove o estilo de sucesso do botão "Close"
              break;
            case "all":
              btnAll.current.classList.add("btn-all"); // Remove o estilo do botão "All"
              break;
          }

          setTickets(data.tickets); // Define os chamados no estado correspondente.
        })
        .catch((err) => {
          // Trata erros.
          setTypeError("FATAL ERROR"); // Define o tipo de erro como "FATAL ERROR".
          setMessageError(err); // Define a mensagem de erro.
          setMessage(true); // Define a flag de exibição de mensagem como verdadeira.
          return console.log(err); // Registra o erro no console.
        });
    } else {
      return;
    }
  }, [userData]);

  useEffect(() => {
    // Verificar se existem tickets e se o local storage foi inicializado
    if (tickets && Object.keys(tickets).length > 0) {
      // Obter o valor do local storage
      const selectView = localStorage.getItem("selectView");

      // Verificar se o valor do local storage está definido
      if (selectView === null || (selectView === "card" && selectView !== "list")) {
        // Se não estiver definido ou se for um valor inválido, definir como "card"
        viewCard();
      } else if (selectView === "list") {
        // Se for "list", ativar a função de lista
        listCard();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  /**
   * Função para montar os chamados em forma de card.
   */
  function viewCard() {
    // Limpar o estado e preparar o ambiente
    setTicketsDash([]);
    setLoading(false);
    setNavbar(true);
    setInCard(true);
    setInList(false);

    // Definir o tipo de visualização como "card" no local storage
    localStorage.setItem("selectView", "card");

    // Estilizar os botões de seleção de visualização
    selectViewCard.current.style.backgroundColor = "#00B4D8";
    selectViewList.current.style.backgroundColor = "transparent";
    sectionTicket.current.style.display = "flex";
    sectionTicket.current.style.justifyContent = "center";

    // Mapear os tickets para elementos de cartão
    tickets.forEach((ticket) => {
      // Variáveis para montar a data dos chamados.
      var date = new Date(ticket["start_date"]); // Obtém a data de início do chamado.
      var day = date.getDate(); // Obtém o dia do mês.
      var month = date.getMonth() + 1; // Obtém o mês (0 = janeiro, 1 = fevereiro, etc.) e adiciona 1 para corresponder ao formato convencional.
      var year = date.getFullYear(); // Obtém o ano.

      /**
       * Função para adicionar um zero na frente do número caso seja menor que 10.
       * @param {number} numero - O número a ser formatado.
       * @returns {string} O número formatado com zero à esquerda, se necessário.
       */
      function adicionaZero(numero) {
        if (numero < 10) {
          return "0" + numero; // Adiciona um zero à esquerda se o número for menor que 10.
        }
        return numero.toString(); // Retorna o número como string se não for menor que 10.
      }

      // Variáveis que contêm data e hora formatadas utilizando a função adicionaZero.
      var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
      var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

      // Combinação da data e hora formatadas.
      const newDate = dataFormatada + " " + horaFormatada; // Combina a data e a hora formatadas separadas por um espaço.

      // Ajuste da borda do ticket com base no estado do chamado.
      if (ticket["open"] === false) {
        // Se o chamado não estiver aberto, ele foi finalizado.
        colorBorder = "ticektClose"; // Define a borda como indicativa de chamado finalizado.
      } else if (ticket["open"] === true && ticket["responsible_technician"] === null) {
        // Se o chamado estiver aberto e sem técnico responsável.
        const currentDate = new Date(); // Obtém a data atual.
        const differenceMilisecond = currentDate - date; // Calcula a diferença em milissegundos entre a data atual e a data de início do chamado.
        const differenceDays = differenceMilisecond / (1000 * 60 * 60 * 24); // Converte a diferença para dias.
        if (differenceDays >= 7) {
          // Se o chamado estiver aberto há mais de 7 dias.
          colorBorder = "ticketUrgent"; // Define a borda como indicativa de chamado urgente.
        } else {
          // Se o chamado estiver aberto há menos de 7 dias.
          colorBorder = "ticektOpenNotView"; // Define a borda como indicativa de chamado aberto, mas não visualizado.
        }
      } else if (ticket["open"] === true && ticket["responsible_technician"] !== null) {
        // Se o chamado estiver aberto e com técnico responsável.
        colorBorder = "ticektOpenInView"; // Define a borda como indicativa de chamado aberto e em atendimento.
      } else if (ticket["open"] === null) {
        // Se o estado do chamado for nulo.
        colorBorder = "ticketStop"; // Define a borda como indicativa de chamado interrompido.
      }

      const Div = (
        <DivCard
          key={ticket["id"]}
          ref={(el) => (divRefs.current[`tck${ticket.id}`] = el)}
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

      setTicketsDash((ticketsDash) => [...ticketsDash, Div]); // Adiciona o cartão ao array de chamados.
      sectionTicket.current.classList.add("dashCard"); // Adiciona a classe "dashCard" ao elemento HTML.
      setLoadingDash(false); // Define o estado de carregamento como falso.
    });
  }

  /**
   * Função para montar os chamados em forma de lista.
   */
  function listCard() {
    // Limpar o estado e preparar o ambiente
    setTicketsDash([]);
    setNavbar(true);
    setLoading(false);
    setInList(true);
    setInCard(false);

    // Definir o tipo de visualização como "list" no local storage
    localStorage.setItem("selectView", "list");

    // Estilizar os botões de seleção de visualização
    selectViewList.current.style.backgroundColor = "#00B4D8";
    selectViewCard.current.style.backgroundColor = "transparent";
    sectionTicket.current.style.display = "block";
    sectionTicket.current.style.justifyContent = "center";

    // Mapear os tickets para elementos de lista
    tickets.forEach((ticket) => {
      // Variáveis para montar a data dos chamados.
      var date = new Date(ticket["start_date"]); // Obtém a data de início do chamado.
      var day = date.getDate(); // Obtém o dia do mês.
      var month = date.getMonth() + 1; // Obtém o mês (0 = janeiro, 1 = fevereiro, etc.) e adiciona 1 para corresponder ao formato convencional.
      var year = date.getFullYear(); // Obtém o ano.

      /**
       * Função para adicionar um zero na frente do número caso seja menor que 10.
       * @param {number} numero - O número a ser formatado.
       * @returns {string} O número formatado com zero à esquerda, se necessário.
       */
      function adicionaZero(numero) {
        if (numero < 10) {
          return "0" + numero; // Adiciona um zero à esquerda se o número for menor que 10.
        }
        return numero.toString(); // Retorna o número como string se não for menor que 10.
      }

      // Variáveis que contêm data e hora formatadas utilizando a função adicionaZero.
      var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
      var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

      const newDate = dataFormatada + " " + horaFormatada; // Combina a data e a hora formatadas separadas por um espaço.

      // Ajuste da borda do ticket com base no estado do chamado.
      if (ticket["open"] === false) {
        // Se o chamado não estiver aberto, ele foi finalizado.
        colorBorder = "ticektClose"; // Define a borda como indicativa de chamado finalizado.
      } else if (ticket["open"] === true && ticket["responsible_technician"] === null) {
        // Se o chamado estiver aberto e sem técnico responsável.
        const currentDate = new Date(); // Obtém a data atual.
        const differenceMilisecond = currentDate - date; // Calcula a diferença em milissegundos entre a data atual e a data de início do chamado.
        const differenceDays = differenceMilisecond / (1000 * 60 * 60 * 24); // Converte a diferença para dias.
        if (differenceDays >= 7) {
          // Se o chamado estiver aberto há mais de 7 dias.
          colorBorder = "ticketUrgent"; // Define a borda como indicativa de chamado urgente.
        } else {
          // Se o chamado estiver aberto há menos de 7 dias.
          colorBorder = "ticektOpenNotView"; // Define a borda como indicativa de chamado aberto, mas não visualizado.
        }
      } else if (ticket["open"] === true && ticket["responsible_technician"] !== null) {
        // Se o chamado estiver aberto e com técnico responsável.
        colorBorder = "ticektOpenInView"; // Define a borda como indicativa de chamado aberto e em atendimento.
      } else if (ticket["open"] === null) {
        // Se o estado do chamado for nulo.
        colorBorder = "ticketStop"; // Define a borda como indicativa de chamado interrompido.
      }

      const Div = (
        <TR
          key={ticket["id"]}
          ref={(el) => (divRefs.current[`tck${ticket.id}`] = el)}
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
      sectionTicket.current.classList.remove("dashCard"); // remove a classe "dashCard" ao elemento HTML.
      setLoadingDash(false); // Define o estado de carregamento como falso.
    });
  }

  /**
   * Função para habilitar o DOM que mostrará a imagem clicada.
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
        viewer: userData.name, // Nome do usuário que está visualizando o chamado
        technician: tech, // Nome do técnico associado ao chamado
        requester: "tech", // Indica que a alteração foi feita por um usuário tecnico
        mail: userData.mail,
      }),
    });
  }

  /**
   * Função para buscar os dados do chamado selecionado.
   * @param {object} id - O ID do chamado a ser buscado.
   */
  async function helpdeskPage({ id }) {
    fetch("/helpdesk/ticket/" + id, {
      method: "GET",
      headers: {
        "X-CSRFToken": token,
        pid: userData.pid,
        "Cache-Control": "no-cache", // Adiciona o cabeçalho para evitar cache
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((dataBack) => {
        setClassBlur("addBlur");
        sectionTicket.current.style.filter = "blur(3px)";
        const data = dataBack.data;
        // Chama a função de forma assíncrona sem bloquear o restante do código
        if (data.responsible_technician !== null) {
          const callAsyncFunction = async () => {
            await changeLastVW({ id: id, tech: data.responsible_technician });
          };

          // Chama a função, mas o código segue sem esperar a execução terminar
          callAsyncFunction();
        }

        setSelectedTech("");
        setMessageChat(false);
        setMountChat([]);
        setIsAtButton(false);
        setFileTicket([]);

        // Calculando o tempo de vida do chamado.
        const start_date = new Date(data.start_date); // Obtém a data de início do chamado.
        const currentDate = new Date(); // Obtém a data atual.
        const calcDate = currentDate - start_date; // Calcula a diferença em milissegundos entre as duas datas.
        const lifetime = Math.floor(calcDate / (1000 * 60 * 60 * 24)); // Calcula o tempo de vida do chamado em dias.

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
        } else {
          setShowEquipament(false);
        }

        textareaRef.current.value = "Observação: " + data.observation;
        setLifetime(lifetime);
        setTicketResponsible_Technician(data.responsible_technician);
        setTicketID(data.id);
        setTicketOpen(data.open);

        var name_verify = userData.name;

        // Verifica se o ticket contém arquivos do tipo e-mail e gera a visualização correspondente, se aplicável.
        if (data.file.length >= 1) {
          // Verifica se há arquivos no ticket.
          const files = data.file; // Obtém a lista de arquivos.
          for (let i = 0; i < files.length; i++) {
            // Itera sobre cada arquivo.
            var file = files[i]; // Obtém o arquivo atual.
            if (file === "mail") {
              // Verifica se o arquivo é do tipo e-mail.
              const contentFileMail = data.content_file[i]; // Obtém o conteúdo do e-mail.
              const nameFileMail = data.name_file[i]; // Obtém o nome do arquivo de e-mail.
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={Mail} className="cursor" alt="imagem de email" />
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
                  <p className="text-center text-break">{nameFileMail}</p>
                </DivOnBoardFile>
              );
              setFileTicket((fileticket) => [...fileticket, Div]); // Adiciona a visualização do arquivo ao estado correspondente.
            } else if (file === "excel") {
              // Verifica se o arquivo é do tipo Excel.
              const ContentFileExcel = data.content_file[i]; // Obtém o conteúdo do arquivo Excel.
              const NameFileExcel = data.name_file[i]; // Obtém o nome do arquivo Excel.
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={XLS} className="cursor" alt="imagem Excell" />
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
              setFileTicket((fileticket) => [...fileticket, Div]); // Adiciona a visualização do arquivo Excel ao estado correspondente.
            } else if (file === "zip") {
              // Verifica se o arquivo é do tipo ZIP.
              const ContentFileZip = data.content_file[i]; // Obtém o conteúdo do arquivo ZIP.
              const NameFileZip = data.name_file[i]; // Obtém o nome do arquivo ZIP.
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={ZIP} className="cursor" alt="imagem ZIP" />
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
              setFileTicket((fileticket) => [...fileticket, Div]); // Adiciona a visualização do arquivo ZIP ao estado correspondente.
            } else if (file === "txt") {
              // Verifica se o arquivo é do tipo TXT.
              const ContentFileTXT = data.content_file[i]; // Obtém o conteúdo do arquivo TXT.
              const NameFileTXT = data.name_file[i]; // Obtém o nome do arquivo TXT.
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={TXT} className="cursor" alt="Arquivo TXT" />
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
              setFileTicket((fileticket) => [...fileticket, Div]); // Adiciona a visualização do arquivo TXT ao estado correspondente.
            } else if (file === "word") {
              // Verifica se o arquivo é do tipo Word.
              const ContentFileWord = data.content_file[i]; // Obtém o conteúdo do arquivo Word.
              const NameFileWord = data.name_file[i]; // Obtém o nome do arquivo Word.
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={WORD} className="cursor" alt="Arquivo Word" />
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
                  />
                  <p className="text-center text-break">{NameFileWord}</p>
                </DivOnBoardFile>
              );
              setFileTicket((fileticket) => [...fileticket, Div]); // Adiciona a visualização do arquivo Word ao estado correspondente.
            } else if (file === "pdf") {
              // Verifica se o arquivo é do tipo PDF.
              const ContentFilePDF = data.content_file[i]; // Obtém o conteúdo do arquivo PDF.
              const NameFilePDF = data.name_file[i]; // Obtém o nome do arquivo PDF.
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles src={PDF} className="cursor" alt="Arquivo PDF" />
                  <ImageFile
                    src={Download}
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                    alt="botão de download"
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
              setFileTicket((fileticket) => [...fileticket, Div]); // Adiciona a visualização do arquivo PDF ao estado correspondente.
            } else if (typeof file === "object") {
              // Verifica se o arquivo é um objeto (imagem).
              const image = file.image; // Obtém a imagem do arquivo.
              const nameImage = data.name_file[i]; // Obtém o nome da imagem.
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles
                    src={`data:image/jpeg;base64,${file.image}`}
                    onClick={() => {
                      setImageUrl(`data:image/jpeg;base64,${image}`);
                      openImage();
                    }}
                    className="cursor"
                    alt="Arquivo de Imagem"
                  />
                  <ImageFile
                    className="position-absolute bottom-0 start-50 translate-middle-x"
                    src={Download}
                    alt=""
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:image/jpeg;base64,${image}`;
                      link.download = nameImage;
                      link.click();
                      link.remove();
                    }}
                  />
                  <p className="text-center text-break">{nameImage}</p>
                </DivOnBoardFile>
              );
              setFileTicket((fileticket) => [...fileticket, Div]); // Adiciona a visualização da imagem ao estado correspondente.
            }
          }
        }
        // Identifica o chat, verifica se contém valores e os separa em grupos de Data, Receptor e Horário.
        if (data.chat !== null && data.chat !== undefined && data.chat !== "undefined") {
          setCountChat(data.chat.length); // Define a contagem de mensagens do chat.
          setFetchChat(true); // Define o estado de busca do chat como verdadeiro.

          const regex = /\[\[([^[\]]+?)\],\[([^[\]]+?)\],\[([^[\]]+?)\]\]/g; // Expressão regular para extrair os grupos de dados.

          const chatValue = [];
          let match;

          while ((match = regex.exec(data.chat)) !== null) {
            const [, value1, value2, value3] = match; // Extrai os valores dos grupos.
            chatValue.push([value1, value2, value3]); // Adiciona os valores ao array chatValue.
          }

          setMountChat([]); // Limpa os dados de montagem do chat.
          setIsAtButton(false);

          const groupedByDate = {}; // Objeto para agrupar as mensagens por data.

          chatValue.forEach((item) => {
            // Itera sobre cada mensagem do chat.
            const date = item[0].split(":")[1].trim(); // Extrai a data da mensagem.
            if (!groupedByDate[date]) {
              groupedByDate[date] = [];
            }
            groupedByDate[date].push(item); // Agrupa as mensagens por data.
          });

          // Monta o HTML com cada parte em seu respectivo lugar.
          const renderGroupedItems = () => {
            const groupedItems = [];
            for (const date in groupedByDate) {
              // Remover "User:" ou "Tech:" do início da string
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

                    const key = `${date}-${index}`;
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
                    } else if (userOrTech.includes("Technician")) {
                      userOrTech = userOrTech.replace("Technician:", "").trim();
                      return (
                        <div key={key}>
                          <DivFlex1 className="w-100 text-break position relative">
                            <div className="uChat1 position-relative">
                              <p>{userOrTech}</p>
                              <PChatHourR className="position-absolute bottom-0 end-0">{time}</PChatHourR>
                            </div>
                          </DivFlex1>
                        </div>
                      );
                    } else if (userOrTech.includes("User")) {
                      userOrTech = userOrTech.replace("User:", "").trim();
                      return (
                        <div key={index}>
                          <DivFlex2 className="w-100 text-break position relative">
                            <div className="uChat2 position-relative">
                              <p>{userOrTech}</p>
                              <PChatHourL className="position-absolute bottom-0 start-0">{time}</PChatHourL>
                            </div>
                          </DivFlex2>
                        </div>
                      );
                    }
                    return userOrTech;
                  })}
                </div>
              );
            }
            return groupedItems;
          };
          setMountChat(renderGroupedItems());
          setChat(true);
          aumentarCount();
        }

        // Verifica se o nome que consta no técnico é o mesmo que está logado.
        var nameVer = name_verify.split(" ");

        if (data.responsible_technician !== null) {
          var techVer = data.responsible_technician.split(" ");

          var allFind = true;
          for (var i = 0; i < techVer.length; i++) {
            if (nameVer.indexOf(techVer[i]) === -1) {
              allFind = false;
              break;
            }
          }
        }

        if (allFind) {
          setChat(true);
        } else if (data.responsible_technician == null) {
          setChat(false);
        } else {
          setChat(false);
        }

        setTicketWindow(true);
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
    setTicketWindow(true);
  }

  /**
   * Função para desabilitar o DOM que mostrará a imagem clicada.
   */
  function imageclose() {
    setImageOpen(false);
  }

  // Função que ajusta o download dos arquivos.
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
      return blob; // Retorna o Blob criado.
    } catch (error) {
      setMessageError(error);
      setTypeError("FATAL ERROR");
      setMessage(true);
      console.error("Erro ao converter para Blob:", error);
      return null;
    }
  }

  // useEffect para atualizar o chat.
  useEffect(() => {
    if (fetchChat === true) {
      fetch("/helpdesk/update_chat/" + ticketID, {
        method: "GET",
        headers: { Accept: "application/json", "Cache-Control": "no-cache" },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.status === 302) {
            return window.location.href("/login");
          }
          var newChat = parseInt(data.chat.length);
          if (newChat > countChat) {
            setCountChat(newChat);
            reloadChat({ data: data });
          }
        })
        .catch((err) => {
          setMessageError(err);
          setTypeError("FATAL ERROR");
          setMessage(true);
          return console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initUpdateChat]);

  // Função que fecha o chamado e suas dependências quando ele está aberto.
  function Close_ticket() {
    setClassBlur(""); // Remove a classe de desfoque.
    sectionTicket.current.style.filter = "blur(0)"; // Remove o efeito de desfoque do chamado.
    setTicketWindow(false); // Fecha a janela do chamado.
    setFetchChat(false); // Define o estado de busca do chat como falso.
    count = 0; // Reinicia a contagem do chat.
    clearTimeout(timeoutId); // Limpa o timeout para atualização do chat.
    setTechDetails(false); // Define o estado de detalhes técnicos como falso.
    setImageOpen(false); //Fecha a imagem do arquivo em anexo
  }

  // Função que salva a mudança do técnico selecionado.
  function ChangeTechnician(event) {
    setSelectedTech(event.target.value); // Atualiza o estado do técnico selecionado.
  }

  // Função que fecha a mensagem.
  function closeMessage() {
    setMessageChat(false); // Define o estado de mensagem do chat como falso.
  }

  // useEffect acionado quando o técnico é mudado.
  useEffect(() => {
    if (selectedTech.length > 1) {
      var date = new Date();

      function adicionaZero(numero) {
        if (numero < 10) {
          return "0" + numero;
        }
        return numero;
      }
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();

      var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
      var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());
      fetch("/helpdesk/ticket/" + ticketID, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-CSRFToken": token,
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          responsible_technician: selectedTech,
          technician: userData.name,
          date: dataFormatada,
          hours: horaFormatada,
          mail: ticketMAIL,
          techMail: userData.mail,
        }),
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
          if (response.status === 304) {
            setTypeError("Operação Inválida");
            setMessageError("O Chamado Já está com você");
            return setMessage(true);
          }
        })
        .then((data) => {
          if (data) {
            setTicketResponsible_Technician(data.technician);
            reloadChat({ data: data });
            const divToChange = divRefs.current[`tck${data.id}`];
            divToChange.classList.remove("ticketStop");
            divToChange.classList.remove("ticektOpenInView");
            divToChange.classList.remove("ticketUrgent");
            divToChange.classList.add("ticektOpenInView");
            dropCont.current.classList.add("visually-hidden");
            return;
          }
        })
        .catch((err) => {
          setMessageError(err);
          setTypeError("FATAL ERROR");
          setMessage(true);
          return console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTech]);

  // Função que salva as mensagens digitadas no chat do chamado e envia ao pressionar Enter ou clicar no botão de enviar.
  function NewChat(event) {
    const newText = event.target.value;
    if (event.key === "Enter") {
      setTextChat(newText); // Atualiza o texto do chat.
      SendChat(); // Envia a mensagem do chat.
      event.preventDefault();
    } else {
      setTextChat(newText); // Atualiza o texto do chat enquanto é digitado.
    }
  }

  // Função semelhante ao NewChat, porém para o chat de detalhes técnicos.
  function NewChatDetails(event) {
    const newText = event.target.value;
    if (event.key === "Enter") {
      setDetailsChat(newText); // Atualiza o texto do chat de detalhes técnicos.
      SendDetails(); // Envia a mensagem do chat de detalhes técnicos.
      event.preventDefault();
    } else {
      setDetailsChat(newText); // Atualiza o texto do chat de detalhes técnicos enquanto é digitado.
    }
  }

  // Função que envia mensagens para o chat de detalhes técnicos.
  function SendDetails() {
    inputRef.current.value = ""; // Limpa o valor do campo de entrada.
    if (detailsChat.length === 0) {
      return;
    }
    // Implementação para enviar mensagens para o chat de detalhes técnicos.
    // Pega a data, dia, mês e ano e ajusta.
    var date = new Date();
    function adicionaZero(numero) {
      if (numero < 10) {
        return "0" + numero;
      }
      return numero;
    }
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
    var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

    // Enviar informações do chat.
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": token, "Tech-Details": "ok", "Cache-Control": "no-cache" },
      body: JSON.stringify({ chat: detailsChat, date: dataFormatada, hours: horaFormatada }),
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
  }

  // Função para montar o chat técnico.
  function MountChatDetails(chat) {
    setTechDetails(true); // Define que o chat técnico está sendo exibido.

    // Verifica se há mensagens no chat.
    if (chat !== null && chat !== undefined && chat !== "undefined") {
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
                <p className="pChat">{date}</p>
              </div>
              {groupedByDate[date].map((item, index) => {
                // Remover "User:" ou "Tech:" do início da string
                var chat = item[1];
                var time = item[2];
                time = time.replace("Hours:", "").trim();

                return (
                  <div key={index}>
                    <DivFlex2 className="w-100 text-break position relative">
                      <div className="uChat2D position-relative">
                        <p>{chat}</p>
                        <PChatHourL className="position-absolute bottom-0 start-0">{time}</PChatHourL>
                      </div>
                    </DivFlex2>
                  </div>
                );
              })}
            </div>
          );
        }
        setLoadingChat(false); // Define que o carregamento do chat foi concluído.
        return groupedItems;
      };
      setMountDetails(renderGroupedItems()); // Define as mensagens montadas.
    }
  }

  // Função para enviar mensagem no chat.
  function SendChat() {
    var date = new Date();
    function adicionaZero(numero) {
      if (numero < 10) {
        return "0" + numero;
      }
      return numero;
    }
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
    var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

    inputChat.current.value = "";

    // Verifica se o texto da mensagem está vazio.
    if (textChat.length === 0) {
      return;
    }

    // Envia a mensagem para o backend.
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        technician: userData.name,
        chat: textChat,
        hours: horaFormatada,
        date: dataFormatada,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // Recarrega o chat após o envio da mensagem.
        setTextChat("");
        return reloadChat({ data: data });
      })
      .catch((err) => {
        setTextChat("");
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  // Função para recarregar o chat após o envio de uma mensagem.
  function reloadChat({ data }) {
    const div = document.getElementById("chatDiv");

    const varisAtBottom = div.scrollTop + div.clientHeight >= div.scrollHeight;

    if (data.chat !== null && data.chat !== undefined && data.chat !== "undefined") {
      setFetchChat(false);
      setCountChat(data.chat.length);
      setLoadingChat(true);

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
                } else if (userOrTech.includes("Technician")) {
                  userOrTech = userOrTech.replace("Technician:", "").trim();
                  return (
                    <div key={index}>
                      <DivFlex1 className="w-100 text-break position relative">
                        <div className="uChat1 position-relative">
                          <p>{userOrTech}</p>
                          <PChatHourR className="position-absolute bottom-0 end-0">{time}</PChatHourR>
                        </div>
                      </DivFlex1>
                    </div>
                  );
                } else {
                  userOrTech = userOrTech.replace("User:", "").trim();
                  return (
                    <div key={index}>
                      <DivFlex2 className="w-100 text-break position relative">
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
      setFetchChat(true);
      aumentarCount();
      setLoadingChat(false);
      // // Atualiza o estado do chat com as novas mensagens.
      if (varisAtBottom) {
        setIsAtButton(true);
      }
      setMountChat(renderGroupedItems());
      setChat(true);
      const callAsyncFunction = async () => {
        await changeLastVW({ id: ticketID, tech: ticketResponsible_Technician });
      };

      // Chama a função, mas o código segue sem esperar a execução terminar
      callAsyncFunction();
    }
  }

  // Função para fechar uma mensagem.
  function closeMessage2() {
    return setMessage(false);
  }

  // Evento para fechar dropdowns quando o usuário clica fora deles.
  window.onclick = function (event) {
    if (!event.target.matches(".dropbtn") && !event.target.matches(".dropdown-content")) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains("showDP")) {
          openDropdown.classList.remove("showDP");
        }
      }
    }
    return;
  };

  // Essa função irá exibir problemas refentes a area especifica que o usuario escolher, como infra e sistema
  function enableProblem() {
    // Obtém o valor da opção selecionada no elemento select
    const option = selectOcorrence.current.options[selectOcorrence.current.selectedIndex].value;

    // Estrutura switch para lidar com diferentes opções de seleção
    switch (option) {
      default:
        // Caso padrão: não faz nada, apenas quebra o switch
        break;

      case "null":
        // Quando a opção selecionada é "null"
        // Exibe a seleção falsa (provavelmente um placeholder ou instrução)
        setFakeSelect(true);
        // Esconde as seções de problemas de Infra e Sistema
        setProblemInfra(false);
        setProblemSyst(false);
        // Limpa o problema do ticket atual
        setProblemTicket(null);
        break;

      case "infra":
        // Quando a opção selecionada é "infra"
        // Esconde a seleção falsa
        setFakeSelect(false);
        // Exibe problemas relacionados à Infraestrutura
        setProblemInfra(true);
        // Esconde problemas relacionados ao Sistema
        setProblemSyst(false);
        // Limpa o problema do ticket atual
        setProblemTicket(null);
        // Define o setor do ticket como "Infraestrutura"
        setSectorTicket("Infraestrutura");
        // Filtra tickets pelo setor "Infraestrutura"
        getTicketFilterSector({ sector: "Infraestrutura" });
        break;

      case "system":
        // Quando a opção selecionada é "system"
        // Esconde a seleção falsa
        setFakeSelect(false);
        // Esconde problemas relacionados à Infraestrutura
        setProblemInfra(false);
        // Exibe problemas relacionados ao Sistema
        setProblemSyst(true);
        // Limpa o problema do ticket atual
        setProblemTicket(null);
        // Define o setor do ticket como "Sistema"
        setSectorTicket("Sistema");
        // Filtra tickets pelo setor "Sistema"
        getTicketFilterSector({ sector: "Sistema" });
        break;

      case "all":
        // Quando a opção selecionada é "all"
        // Exibe a seleção falsa
        setFakeSelect(true);
        // Esconde problemas relacionados à Infraestrutura e Sistema
        setProblemInfra(false);
        setProblemSyst(false);
        // Define o setor do ticket como "all", que provavelmente significa todos os setores
        setSectorTicket("all");
        // Limpa o problema do ticket atual
        setProblemTicket(null);
        // Filtra tickets por todos os setores
        getTicketFilterSector({ sector: "all" });
        break;
    }
  }

  /**
   * Função responsável por buscar tickets filtrados com base no setor selecionado.
   * @param {Object} param - Objeto que contém os parâmetros da função.
   * @param {string} param.sector - O setor pelo qual os tickets serão filtrados.
   */
  function getTicketFilterSector({ sector }) {
    // Inicializa o estado dos tickets e da dashboard como arrays vazios para limpar os dados anteriores
    setTickets([]);
    setTicketsDash([]);

    // Define o estado de carregamento da dashboard como verdadeiro, indicando que a busca de dados está em andamento
    setLoadingDash(true);

    // Realiza uma requisição GET para o endpoint "getTicketFilter/"
    fetch("get-ticket-filter/" + sector, {
      method: "GET", // Define o método HTTP como GET para a requisição
      headers: {
        Accept: "application/json", // Define que a resposta esperada é no formato JSON
        "Quantity-tickets": countTicket, // Envia o número de tickets desejado no cabeçalho da requisição
        "Order-by": orderby, // Envia o critério de ordenação para a busca
        "Problemn-Ticket": problemTicket, // Envia o problema específico do ticket que deve ser filtrado
        "Status-Ticket": status, // Envia o status do ticket para a filtragem
        "Cache-Control": "no-cache", // Define que a requisição não deve utilizar o cache, garantindo dados atualizados
      },
    })
      .then((response) => {
        // Converte a resposta da requisição para JSON
        return response.json();
      })
      .then((data) => {
        // Desativa o estado de carregamento, pois os dados já foram recebidos
        setLoadingDash(false);
        // Atualiza o estado dos tickets com os dados recebidos da API
        setTickets(data.tickets);
      })
      .catch((err) => {
        // Caso ocorra um erro durante a requisição, define a mensagem de erro e seu tipo
        setMessageError(err);
        setTypeError("FATAL ERROR");
        // Exibe a mensagem de erro na interface
        setMessage(true);
        // Loga o erro no console para fins de debug
        return console.log(err);
      });
  }

  /**
   * Função responsável por buscar tickets com base em caracteres digitados pelo usuário.
   * Essa função é ativada pelo evento `keyDown`, capturando os caracteres conforme são digitados
   * e realizando uma busca por tickets relacionados a esses caracteres.
   * @param {Object} event - O evento de teclado que dispara a função.
   */
  function getTicketKey(event) {
    // Remove classes de estilo de botões específicos para redefinir seu estado visual
    btnOpen.current.classList.remove("btn-open");
    btnClose.current.classList.remove("btn-success");
    btnStop.current.classList.remove("btn-light");
    btnAll.current.classList.remove("btn-all");

    // Captura o valor do campo de entrada (input) onde o usuário está digitando
    const newText = event.target.value;

    // Realiza uma requisição GET para buscar tickets que correspondam ao texto digitado
    fetch("getTicketFilterWords/", {
      method: "GET", // Define o método HTTP como GET para a requisição
      headers: {
        Accept: "application/json", // Define que a resposta esperada é no formato JSON
        "Word-Filter": newText, // Envia o texto digitado pelo usuário como filtro de palavras
        "Order-By": orderby, // Envia o critério de ordenação para a busca
        "Quantity-tickets": countTicket, // Envia a quantidade de tickets desejada no cabeçalho da requisição
        "Sector-Filter": sectorTicket, // Envia o setor filtrado dos tickets
        "Problem-Filter": problemTicket, // Envia o filtro de problemas dos tickets
        "Cache-Control": "no-cache", // Define que a requisição não deve utilizar o cache, garantindo dados atualizados
      },
    })
      .then((response) => {
        // Converte a resposta da requisição para JSON
        return response.json();
      })
      .then((data) => {
        // Desativa o estado de carregamento, pois os dados já foram recebidos
        setLoadingDash(false);
        // Atualiza o estado dos tickets com os dados recebidos da API
        setTickets(data.tickets);
      })
      .catch((err) => {
        // Caso ocorra um erro durante a requisição, define a mensagem de erro e seu tipo
        setMessageError(err);
        setTypeError("FATAL ERROR");
        // Exibe a mensagem de erro na interface
        setMessage(true);
        // Loga o erro no console para fins de debug
        return console.log(err);
      });
  }

  /**
   * Função responsável por obter tickets com o status "open" (aberto).
   * Esta função realiza uma requisição para filtrar e buscar tickets que estão abertos,
   * atualizando o estado dos tickets na interface e gerenciando os botões de filtragem.
   */
  function ticketOpenStatus() {
    // Limpa os estados dos tickets e do dashboard antes de realizar a nova busca
    setTickets([]);
    setTicketsDash([]);

    // Atualiza as classes dos botões para refletir o estado de filtragem
    btnOpen.current.classList.add("btn-open"); // Marca o botão "Open" como ativo
    btnClose.current.classList.remove("btn-success"); // Remove o estilo de sucesso do botão "Close"
    btnStop.current.classList.remove("btn-light"); // Remove o estilo de luz do botão "Stop"
    btnAll.current.classList.remove("btn-all"); // Remove o estilo do botão "All"

    // Realiza uma requisição GET para buscar tickets com o status "open"
    fetch("getTicketFilterStatus/", {
      method: "GET", // Define o método HTTP como GET para a requisição
      headers: {
        Accept: "application/json", // Define que a resposta esperada é no formato JSON
        "Order-By": orderby, // Envia o critério de ordenação para a busca
        "Quantity-tickets": countTicket, // Envia a quantidade de tickets desejada no cabeçalho da requisição
        "Problemn-Ticket": problemTicket, // Envia o filtro de problemas dos tickets
        "Sector-Ticket": sectorTicket, // Envia o setor filtrado dos tickets
        "Status-Request": "open", // Filtra os tickets com status "open" (aberto)
        "Cache-Control": "no-cache", // Define que a requisição não deve utilizar o cache, garantindo dados atualizados
      },
    })
      .then((response) => {
        // Converte a resposta da requisição para JSON
        return response.json();
      })
      .then((data) => {
        // Verifica se não há tickets retornados com os filtros aplicados
        if (data.tickets.length === 0) {
          // Se não houver tickets, exibe uma mensagem informativa
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false); // Desativa o botão de "carregar mais"
        } else {
          // Se houver tickets, atualiza o estado da aplicação com os novos dados
          setBtnMore(true); // Ativa o botão de "carregar mais"
          setLoadingDash(false); // Desativa o estado de carregamento
          setStatus("open"); // Define o status atual como "open"
          setTickets(data.tickets); // Atualiza o estado dos tickets com os dados recebidos
          localStorage.setItem("status", "open");
        }
      })
      .catch((err) => {
        // Em caso de erro, exibe uma mensagem de erro na interface e loga o erro no console
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  /**
   * Função responsável por buscar e exibir tickets com o status "close" (fechado).
   * Esta função faz uma requisição para filtrar e recuperar tickets fechados,
   * atualizando a interface com os resultados e gerenciando os botões de filtragem.
   */
  function ticketClose() {
    // Limpa os estados dos tickets e do dashboard antes de realizar a nova busca
    setTickets([]);
    setTicketsDash([]);

    // Atualiza as classes dos botões para refletir o estado de filtragem
    btnOpen.current.classList.remove("btn-open"); // Remove o estilo do botão "Open"
    btnClose.current.classList.add("btn-success"); // Marca o botão "Close" como ativo com estilo de sucesso
    btnStop.current.classList.remove("btn-light"); // Remove o estilo de luz do botão "Stop"
    btnAll.current.classList.remove("btn-all"); // Remove o estilo do botão "All"

    // Realiza uma requisição GET para buscar tickets com o status "close"
    fetch("getTicketFilterStatus/", {
      method: "GET", // Define o método HTTP como GET para a requisição
      headers: {
        Accept: "application/json", // Define que a resposta esperada é no formato JSON
        "Order-By": orderby, // Envia o critério de ordenação para a busca
        "Quantity-tickets": countTicket, // Envia a quantidade de tickets desejada no cabeçalho da requisição
        "Problemn-Ticket": problemTicket, // Envia o filtro de problemas dos tickets
        "Sector-Ticket": sectorTicket, // Envia o setor filtrado dos tickets
        "Status-Request": "close", // Filtra os tickets com status "close" (fechado)
        "Cache-Control": "no-cache", // Define que a requisição não deve utilizar o cache, garantindo dados atualizados
      },
    })
      .then((response) => {
        // Converte a resposta da requisição para JSON
        return response.json();
      })
      .then((data) => {
        // Verifica se não há tickets retornados com os filtros aplicados
        if (data.tickets.length === 0) {
          // Se não houver tickets, exibe uma mensagem informativa
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false); // Desativa o botão de "carregar mais"
        } else {
          // Se houver tickets, atualiza o estado da aplicação com os novos dados
          setBtnMore(true); // Ativa o botão de "carregar mais"
          setLoadingDash(false); // Desativa o estado de carregamento
          setStatus("close"); // Define o status atual como "close"
          setTickets(data.tickets); // Atualiza o estado dos tickets com os dados recebidos
          localStorage.setItem("status", "close");
        }
      })
      .catch((err) => {
        // Em caso de erro, exibe uma mensagem de erro na interface e loga o erro no console
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  /**
   * Função responsável por buscar e exibir tickets com o status "stop" (em aguardo).
   * Esta função faz uma requisição para filtrar e recuperar tickets que estão em aguardo,
   * atualizando a interface com os resultados e gerenciando os botões de filtragem.
   */
  function ticketStop() {
    // Limpa os estados dos tickets e do dashboard antes de realizar a nova busca
    setTickets([]);
    setTicketsDash([]);

    // Atualiza as classes dos botões para refletir o estado de filtragem
    btnOpen.current.classList.remove("btn-open"); // Remove o estilo do botão "Open"
    btnClose.current.classList.remove("btn-success"); // Remove o estilo de sucesso do botão "Close"
    btnStop.current.classList.add("btn-light"); // Marca o botão "Stop" como ativo com estilo de luz
    btnAll.current.classList.remove("btn-all"); // Remove o estilo do botão "All"

    // Realiza uma requisição GET para buscar tickets com o status "stop" (em aguardo)
    fetch("getTicketFilterStatus/", {
      method: "GET", // Define o método HTTP como GET para a requisição
      headers: {
        Accept: "application/json", // Define que a resposta esperada é no formato JSON
        "Order-By": orderby, // Envia o critério de ordenação para a busca
        "Quantity-tickets": countTicket, // Envia a quantidade de tickets desejada no cabeçalho da requisição
        "Problemn-Ticket": problemTicket, // Envia o filtro de problemas dos tickets
        "Sector-Ticket": sectorTicket, // Envia o setor filtrado dos tickets
        "Status-Request": "stop", // Filtra os tickets com status "stop" (em aguardo)
        "Cache-Control": "no-cache", // Define que a requisição não deve utilizar o cache, garantindo dados atualizados
      },
    })
      .then((response) => {
        // Converte a resposta da requisição para JSON
        return response.json();
      })
      .then((data) => {
        // Verifica se não há tickets retornados com os filtros aplicados
        if (data.tickets.length === 0) {
          // Se não houver tickets, exibe uma mensagem informativa
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false); // Desativa o botão de "carregar mais"
        } else {
          // Se houver tickets, atualiza o estado da aplicação com os novos dados
          setBtnMore(true); // Ativa o botão de "carregar mais"
          setLoadingDash(false); // Desativa o estado de carregamento
          setStatus("close"); // Define o status atual como "close" (deve ser alterado para "stop" conforme explicado abaixo)
          setTickets(data.tickets); // Atualiza o estado dos tickets com os dados recebidos
          localStorage.setItem("status", "stop");
        }
      })
      .catch((err) => {
        // Em caso de erro, exibe uma mensagem de erro na interface e loga o erro no console
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  /**
   * Função responsável por buscar e exibir todos os tickets, independentemente do status.
   * Esta função faz uma requisição para filtrar e recuperar todos os tickets,
   * atualizando a interface com os resultados e gerenciando os botões de filtragem.
   */
  function statusTicketAll() {
    // Limpa os estados dos tickets e do dashboard antes de realizar a nova busca
    setTickets([]);
    setTicketsDash([]);

    // Atualiza as classes dos botões para refletir o estado de filtragem
    btnOpen.current.classList.remove("btn-open"); // Remove o estilo do botão "Open"
    btnClose.current.classList.remove("btn-success"); // Remove o estilo de sucesso do botão "Close"
    btnStop.current.classList.remove("btn-light"); // Remove o estilo de luz do botão "Stop"
    btnAll.current.classList.add("btn-all"); // Marca o botão "All" como ativo com estilo apropriado

    // Realiza uma requisição GET para buscar todos os tickets
    fetch("getTicketFilterStatus/", {
      method: "GET", // Define o método HTTP como GET para a requisição
      headers: {
        Accept: "application/json", // Define que a resposta esperada é no formato JSON
        "Order-By": orderby, // Envia o critério de ordenação para a busca
        "Quantity-tickets": countTicket, // Envia a quantidade de tickets desejada no cabeçalho da requisição
        "Problemn-Ticket": problemTicket, // Envia o filtro de problemas dos tickets
        "Sector-Ticket": sectorTicket, // Envia o setor filtrado dos tickets
        "Status-Request": "all", // Filtra todos os tickets, independente do status
      },
    })
      .then((response) => {
        // Converte a resposta da requisição para JSON
        return response.json();
      })
      .then((data) => {
        // Verifica se não há tickets retornados com os filtros aplicados
        if (data.tickets.length === 0) {
          // Se não houver tickets, exibe uma mensagem informativa
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false); // Desativa o botão de "carregar mais"
        } else {
          // Se houver tickets, atualiza o estado da aplicação com os novos dados
          setBtnMore(true); // Ativa o botão de "carregar mais"
          setLoadingDash(false); // Desativa o estado de carregamento
          setStatus("all"); // Define o status atual como "all"
          setTickets(data.tickets); // Atualiza o estado dos tickets com os dados recebidos
          localStorage.setItem("status", "all");
        }
      })
      .catch((err) => {
        // Em caso de erro, exibe uma mensagem de erro na interface e loga o erro no console
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  /**
   * Função responsável por alterar o filtro de problemas baseado na opção selecionada no componente select.
   * Atualiza o estado do problema e chama a função para filtrar os chamados conforme a opção selecionada.
   */
  function changeProblemn() {
    // Mapeia os valores das opções do select para descrições de problemas
    const problemMapping = {
      backup: "Backup",
      mail: "E-mail",
      equipamento: "Equipamento",
      user: "Gerenciamento de Usuario",
      internet: "Internet",
      permissao: "Permissão",
      all: "all",
      sap: "SAP",
      mbi: "MBI",
      synchro: "Synchro",
      office: "Office",
      eng: "Softwares de Eng",
      soft: "Novo SoftWare",
      dados: "Integridade de Dados",
    };

    // Obtém o valor da opção selecionada no select
    const option = selectBo.current.options[selectBo.current.selectedIndex].value;

    // Mapeia o valor da opção para o problema correspondente ou define "all" como padrão
    const problem = problemMapping[option] || "all";

    // Atualiza o estado com o problema selecionado
    setProblemTicket(problem);

    // Chama a função para filtrar os chamados com base no problema selecionado
    getTicketFilterProblemn({ problemn: problem });
  }

  /**
   * Filtra os chamados com base no técnico selecionado no componente select.
   * Faz uma requisição para obter os chamados atribuídos ao técnico e atualiza o estado da aplicação.
   *
   * @param {Event} event - Evento de mudança do select que contém o valor do técnico selecionado.
   */
  function filterTechnician(event) {
    // Limpa os dados de tickets e a visualização do dashboard
    setTickets([]);
    setTicketsDash([]);
    setLoadingDash(true);

    // Faz uma requisição GET para obter os tickets filtrados pelo técnico selecionado
    fetch("get-ticket-filter-tech/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Tech-Select": event.target.value, // Valor do técnico selecionado
        "Cache-Control": "no-cache",
      },
    })
      .then((response) => {
        return response.json(); // Converte a resposta em JSON
      })
      .then((data) => {
        // Atualiza o estado com os tickets recebidos e finaliza o carregamento
        setLoadingDash(false);
        setTickets(data.tickets);

        // Verifica se não há tickets para o técnico selecionado e exibe uma mensagem de erro
        if (data.tickets.length < 1 || data.tickets == null) {
          setMessageError("Esse Técnico não possui Chamados");
          setTypeError("Falta de Dados");
          setMessage(true);
        }
      })
      .catch((err) => {
        // Loga o erro no console, não atualiza a mensagem de erro
        console.log(err);
      });
  }

  /**
   * Obtém e filtra os chamados com base no problema especificado.
   * Essa função é chamada quando um problema é selecionado em um componente select,
   * e atualiza a lista de tickets exibida de acordo com o problema selecionado.
   *
   * @param {Object} params - Parâmetros para filtrar os tickets.
   * @param {string} params.problemn - O problema específico usado para filtrar os tickets.
   */
  function getTicketFilterProblemn({ problemn }) {
    // Limpa os dados de tickets e a visualização do dashboard antes de carregar novos dados
    setTickets([]);
    setTicketsDash([]);
    setLoadingDash(true);

    // Faz uma requisição GET para obter os tickets filtrados pelo problema especificado
    fetch("get-ticket-filter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Quantity-tickets": countTicket, // Número de tickets a ser retornado
        "Order-by": orderby, // Ordem de classificação dos tickets
        "Problemn-Ticket": problemn, // Problema específico para o filtro
        "Sector-Ticket": sectorTicket, // Setor para o filtro
        "Status-Ticket": status, // Status dos tickets para o filtro
        "Cache-Control": "no-cache", // Garante que a resposta não seja cacheada
      },
    })
      .then((response) => {
        return response.json(); // Converte a resposta em JSON
      })
      .then((data) => {
        // Atualiza o estado com os tickets recebidos e finaliza o carregamento
        setLoadingDash(false);
        setTickets(data.tickets);
      })
      .catch((err) => {
        // Atualiza o estado para exibir uma mensagem de erro em caso de falha
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        console.log(err); // Loga o erro no console para depuração
      });
  }

  /**
   * Reordena a lista de tickets com base na opção selecionada para exibir os tickets mais recentes ou mais antigos.
   * Esta função é acionada quando o usuário seleciona uma opção de ordenação em um componente select.
   *
   * @description
   * A função limpa os tickets e o dashboard exibido antes de aplicar a nova ordenação.
   * Dependendo da opção selecionada, a função chama `getTicketFilterOrderTime` para obter os tickets na ordem desejada.
   *
   * @param {Event} event - O evento de alteração do select, que contém a opção selecionada pelo usuário.
   */
  function selectOrder() {
    // Limpa os dados de tickets e a visualização do dashboard antes de aplicar a nova ordenação
    setTickets([]);
    setTicketsDash([]);

    // Obtém a opção selecionada do componente select
    const option = selectOrderO.current.options[selectOrderO.current.selectedIndex].value;

    // Aplica a ordenação com base na opção selecionada
    switch (option) {
      default:
        break;
      case "recent":
        // Ordena os tickets por ID de forma decrescente (mais recente primeiro)
        getTicketFilterOrderTime({ order: "-id" });
        setOrderBy("-id");
        break;
      case "ancient":
        // Ordena os tickets por ID de forma crescente (mais antigo primeiro)
        getTicketFilterOrderTime({ order: "id" });
        setOrderBy("id");
        break;
    }
  }

  /**
   * Busca e organiza os tickets com base nos filtros aplicados e na ordem especificada.
   * Esta função faz uma requisição à API para obter tickets filtrados e ordenados conforme os parâmetros fornecidos.
   *
   * @param {Object} params - Parâmetros para a requisição.
   * @param {string} params.order - O critério de ordenação dos tickets, pode ser "id" para mais antigo ou "-id" para mais recente.
   *
   * @description
   * A função faz uma requisição GET para o endpoint `getTicketFilter/` com os filtros e critérios de ordenação fornecidos.
   * Após obter os dados, a função atualiza o estado dos tickets e o estado de carregamento.
   *
   * A função realiza as seguintes operações:
   * 1. Limpa os dados de tickets e o dashboard.
   * 2. Faz uma requisição à API com os parâmetros de filtro e ordenação.
   * 3. Atualiza o estado dos tickets com os dados recebidos da API.
   * 4. Trata erros de requisição e exibe mensagens de erro apropriadas.
   *
   * @returns {void}
   */
  function getTicketFilterOrderTime({ order }) {
    // Limpa os dados de tickets e o dashboard antes de aplicar a nova ordenação
    setTickets([]);
    setTicketsDash([]);

    // Faz uma requisição GET para buscar os tickets filtrados e ordenados
    fetch("getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Quantity-tickets": countTicket, // Número de tickets a ser retornado
        "Order-By": order, // Critério de ordenação
        "Problemn-Ticket": problemTicket, // Filtro por problema do ticket
        "Sector-Ticket": sectorTicket, // Filtro por setor do ticket
        "Status-Ticket": status, // Filtro por status do ticket
        "Cache-Control": "no-cache", // Evita cache da requisição
      },
    })
      .then((response) => response.json()) // Converte a resposta em JSON
      .then((data) => {
        setLoadingDash(false); // Desativa o carregamento do dashboard
        setTickets(data.tickets); // Atualiza a lista de tickets com os dados recebidos
      })
      .catch((err) => {
        // Trata erros de requisição e exibe uma mensagem de erro
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        console.log(err);
      });
  }

  /**
   * Atualiza a visualização dos chamados de acordo com a quantidade especificada pelo usuário.
   *
   * Esta função é responsável por:
   * 1. Limpar a lista de chamados e a visualização do painel de chamados.
   * 2. Atualizar a cor de fundo dos filtros de visualização para indicar que não estão selecionados.
   * 3. Realizar uma requisição para o servidor para obter os chamados filtrados de acordo com a quantidade e outros parâmetros especificados.
   * 4. Atualizar o estado com os novos dados recebidos e gerenciar possíveis erros durante a requisição.
   *
   * @param {Object} params - Objeto contendo os parâmetros necessários para a requisição.
   * @param {number} params.quantity - Quantidade de chamados a ser visualizada.
   */
  function getTicketFilter({ quantity }) {
    // Limpa a lista de chamados e o painel de chamados, e indica que a visualização está carregando
    setTickets([]);
    setTicketsDash([]);
    setLoadingDash(true);

    // Define a cor de fundo dos filtros de visualização para transparente, indicando que não estão selecionados
    fiveView.current.style.backgroundColor = "transparent";
    thenView.current.style.backgroundColor = "transparent";
    fiftyView.current.style.backgroundColor = "transparent";
    allView.current.style.backgroundColor = "transparent";

    // Faz uma requisição GET para o endpoint de filtragem de chamados
    fetch("getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Quantity-tickets": quantity, // Define a quantidade de chamados a ser filtrada
        "Order-by": orderby, // Ordem de exibição dos chamados
        "Problemn-Ticket": problemTicket, // Filtro por problema do chamado
        "Sector-Ticket": sectorTicket, // Filtro por setor do chamado
        "Status-Ticket": status, // Filtro por status do chamado
      },
    })
      .then((response) => response.json()) // Converte a resposta para JSON
      .then((data) => {
        localStorage.setItem("quantity", quantity);
        setLoadingDash(false); // Desativa o estado de carregamento
        setTickets(data.tickets); // Atualiza a lista de chamados com os dados recebidos
      })
      .catch((err) => {
        setMessageError(err); // Define a mensagem de erro
        setTypeError("FATAL ERROR"); // Define o tipo de erro como fatal
        setMessage(true); // Exibe a mensagem de erro
        console.log(err); // Loga o erro no console para depuração
      });
  }

  /**
   * Busca mais tickets a partir do servidor e atualiza a lista de tickets exibida.
   *
   * Esta função faz uma requisição para o endpoint `/helpdesk/moreTicket/` para obter mais tickets com base na quantidade atual e outros parâmetros.
   * Após obter os dados, a função atualiza o estado dos tickets e o contador de tickets.
   *
   * @description
   * A função realiza uma requisição GET para buscar mais tickets. Após receber os dados, ela atualiza o estado dos tickets e o contador de tickets.
   * Se ocorrer um erro durante a requisição, uma mensagem de erro é exibida ao usuário.
   *
   * @returns {void}
   */
  function moreTickets() {
    // Faz uma requisição GET para buscar mais tickets
    fetch("/helpdesk/moreTicket/" + countTicket + "/" + orderby + "/NoN/TI", {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache", // Evita cache da requisição para obter dados atualizados
      },
    })
      .then((response) => response.json()) // Converte a resposta em JSON
      .then((data) => {
        setCountTicket(data.count); // Atualiza o contador de tickets com o novo valor
        setTickets(data.tickets); // Atualiza a lista de tickets com os novos dados
      })
      .catch((err) => {
        // Trata erros de requisição e exibe uma mensagem de erro
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        console.log(err); // Exibe o erro no console para depuração
      });
  }

  /**
   * Finaliza um chamado, atualizando seu status para "close" e registrando a data e hora de conclusão.
   *
   * Esta função realiza uma requisição POST para o endpoint `/helpdesk/ticket/{ticketID}`, onde `{ticketID}` é o ID do chamado que está sendo finalizado.
   * O corpo da requisição inclui informações sobre o técnico responsável, a data e hora da conclusão, e o e-mail associado ao chamado.
   * Após a requisição, a função trata as respostas do servidor e pode recarregar a página ou exibir uma mensagem de erro ao usuário.
   *
   * @description
   * A função envia uma requisição para atualizar o status de um chamado para "close". Se a resposta for bem-sucedida, a página será recarregada.
   * Caso contrário, exibe uma mensagem de erro adequada. Se a resposta for um erro de permissão, uma mensagem específica é exibida.
   *
   * @returns {void}
   */
  function closeTicket() {
    var date = new Date();

    // Adiciona um zero à frente de números menores que 10 para formatar corretamente a data e hora
    function adicionaZero(numero) {
      if (numero < 10) {
        return "0" + numero;
      }
      return numero;
    }

    // Obtém e formata a data e hora atuais
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
    var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

    // Define o estado inicial da mensagem como falsa
    setMessage(false);

    // Faz uma requisição POST para atualizar o status do chamado
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token, // Inclui o token CSRF para segurança
        "Cache-Control": "no-cache", // Evita cache da requisição
      },
      body: JSON.stringify({
        technician: userData.name, // Nome do técnico que está finalizando o chamado
        status: "close", // Novo status do chamado
        hours: horaFormatada, // Hora de conclusão
        date: dataFormatada, // Data de conclusão
        mail: ticketMAIL, // E-mail associado ao chamado
      }),
    })
      .then((response) => {
        console.log(response.status); // Exibe o status da resposta para depuração

        if (response.status === 304) {
          // Se o status for 304, o chamado não pertence ao usuário
          setMessageError("Ticket não pertence a você");
          setTypeError("Permissão Negada");
          setMessage(true);
          return;
        }

        if (response.status === 200) {
          // Se a resposta for bem-sucedida, recarrega a página
          return window.location.reload();
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
        console.log(err); // Exibe o erro no console para depuração
      });
  }

  /**
   * Reabre um chamado que está finalizado, atualizando seu status para "open" e registrando a data e hora da reabertura.
   *
   * Esta função realiza uma requisição POST para o endpoint `/helpdesk/ticket/{ticketID}`, onde `{ticketID}` é o ID do chamado que está sendo reaberto.
   * O corpo da requisição inclui informações sobre o técnico responsável, a data e hora da reabertura, e o e-mail associado ao chamado.
   * Após a requisição, a função trata as respostas do servidor e pode recarregar a página ou exibir uma mensagem de erro ao usuário.
   *
   * @description
   * A função envia uma requisição para atualizar o status de um chamado para "open". Se a resposta for bem-sucedida, a página será recarregada.
   * Caso contrário, exibe uma mensagem de erro adequada. Se a resposta for um erro de permissão, uma mensagem específica é exibida.
   *
   * @returns {void}
   */
  function reopenTicket() {
    var date = new Date();

    // Adiciona um zero à frente de números menores que 10 para formatar corretamente a data e hora
    function adicionaZero(numero) {
      if (numero < 10) {
        return "0" + numero;
      }
      return numero;
    }

    // Obtém e formata a data e hora atuais
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
    var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

    // Faz uma requisição POST para atualizar o status do chamado para "open"
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token, // Inclui o token CSRF para segurança
        "Cache-Control": "no-cache", // Evita cache da requisição
      },
      body: JSON.stringify({
        technician: userData.name, // Nome do técnico que está reabrindo o chamado
        status: "open", // Novo status do chamado
        hours: horaFormatada, // Hora de reabertura
        date: dataFormatada, // Data de reabertura
        mail: ticketMAIL, // E-mail associado ao chamado
        techMail: userData.mail,
      }),
    })
      .then((response) => {
        if (response.status === 304) {
          // Se o status for 304, o chamado não pertence ao usuário
          setMessage(true);
          setMessageError("Ticket não pertence a você");
          setTypeError("Permissão Negada");
        } else if (response.status === 200) {
          // Se a resposta for bem-sucedida, recarrega a página
          window.location.reload();
        } else {
          // Para outros status, tenta converter a resposta em JSON e exibir uma mensagem de erro
          return response.json();
        }
      })
      .catch((err) => {
        // Trata erros de requisição e exibe uma mensagem de erro
        setMessageError("Erro ao reabrir o Chamado");
        setTypeError("FATAL ERROR");
        setMessage(true);
        console.log(err); // Exibe o erro no console para depuração
      });
  }

  /**
   * Altera o status de um chamado para "em aguardo", registrando a data e a hora da alteração.
   *
   * Esta função realiza uma requisição POST para o endpoint `/helpdesk/ticket/{ticketID}`, onde `{ticketID}` é o ID do chamado que está sendo alterado.
   * O corpo da requisição inclui informações sobre o técnico responsável, a data e hora da alteração, e o e-mail associado ao chamado.
   * Após a requisição, a função trata as respostas do servidor e pode recarregar a página ou exibir uma mensagem de erro ao usuário.
   *
   * @description
   * A função envia uma requisição para atualizar o status de um chamado para "stop". Se a resposta for bem-sucedida, a página será recarregada.
   * Caso contrário, exibe uma mensagem de erro adequada. Se a resposta for um erro de permissão, uma mensagem específica é exibida.
   *
   * @returns {void}
   */
  function stopTicket() {
    var date = new Date();

    // Adiciona um zero à frente de números menores que 10 para formatar corretamente a data e hora
    function adicionaZero(numero) {
      if (numero < 10) {
        return "0" + numero;
      }
      return numero;
    }

    // Obtém e formata a data e hora atuais
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var dataFormatada = adicionaZero(day) + "/" + adicionaZero(month) + "/" + year;
    var horaFormatada = adicionaZero(date.getHours()) + ":" + adicionaZero(date.getMinutes());

    // Faz uma requisição POST para atualizar o status do chamado para "stop"
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token, // Inclui o token CSRF para segurança
        "Cache-Control": "no-cache", // Evita cache da requisição
      },
      body: JSON.stringify({
        technician: userData.name, // Nome do técnico que está alterando o status
        status: "stop", // Novo status do chamado
        hours: horaFormatada, // Hora da alteração
        date: dataFormatada, // Data da alteração
        mail: ticketMAIL, // E-mail associado ao chamado
      }),
    })
      .then((response) => {
        if (response.status === 304) {
          // Se o status for 304, o chamado não pertence ao usuário
          setMessageError("Ticket não pertence a você");
          setTypeError("Permissão Negada");
          setMessage(true);
        } else if (response.status === 200) {
          // Se a resposta for bem-sucedida, recarrega a página
          window.location.reload();
        } else {
          // Para outros status, tenta converter a resposta em JSON e exibir uma mensagem de erro
          return response.json();
        }
      })
      .catch((err) => {
        // Trata erros de requisição e exibe uma mensagem de erro
        setMessageError("Erro ao atualizar o Chamado");
        setTypeError("FATAL ERROR");
        setMessage(true);
        console.log(err); // Exibe o erro no console para depuração
      });
  }

  /**
   * Adiciona novos arquivos à lista de arquivos a serem enviados para o chamado.
   *
   * Esta função é acionada quando o usuário seleciona arquivos para upload. Ela adiciona os arquivos selecionados à lista existente
   * e atualiza o estado dos arquivos a serem enviados.
   *
   * @param {Event} evt - O evento de alteração do input de arquivo, que contém os arquivos selecionados pelo usuário.
   *
   * @description
   * A função `UploadNewFiles` realiza as seguintes operações:
   * 1. Adiciona os arquivos selecionados pelo usuário ao array `UpNwfile`.
   * 2. Itera sobre o array `UpNwfile` e atualiza o estado `uploadNewFiles` com a lista completa de arquivos, incluindo os novos arquivos selecionados.
   * 3. Utiliza a função `setUploadNewFiles` para garantir que o estado seja atualizado de forma imutável, preservando os arquivos já existentes e incluindo os novos.
   *
   * @returns {void}
   */
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

  /**
   * Efeito colateral para atualizar a visualização dos arquivos selecionados para envio.
   *
   * Este `useEffect` é executado sempre que a lista `uploadNewFiles` é atualizada. Ele gera a representação visual dos arquivos que foram selecionados,
   * exibindo uma lista de arquivos com um botão de exclusão ao lado de cada um. O botão de exclusão permite remover um arquivo da lista de arquivos
   * selecionados. Após atualizar a lista de arquivos exibidos, o estado `nameNWFiles` é atualizado para refletir as mudanças e o estado `newFiles`
   * é ajustado para indicar que há arquivos novos.
   *
   * @description
   * O efeito realiza as seguintes operações:
   * 1. Verifica se há arquivos na lista `uploadNewFiles`. Se houver, inicia o processo de renderização.
   * 2. Itera sobre o array de arquivos e cria um array de elementos JSX para cada arquivo. Cada elemento JSX contém:
   *    - Nome do arquivo.
   *    - Um botão de exclusão que remove o arquivo da lista de arquivos selecionados.
   * 3. Para remover um arquivo, o efeito usa `DataTransfer` para criar um novo array de arquivos sem o arquivo excluído e atualiza o estado `uploadNewFiles`.
   * 4. Atualiza o estado `nameNWFiles` com o novo array de elementos JSX.
   * 5. Define `newFiles` como `true` para indicar que novos arquivos foram selecionados.
   *
   * @param {Array<File>} uploadNewFiles - Lista de arquivos selecionados para envio.
   *
   * @returns {void}
   */
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

  /**
   * Fecha a tela de visualização e limpa a lista de arquivos selecionados.
   *
   * Esta função é acionada para fechar a tela de envio de novos arquivos e limpar os dados relacionados aos arquivos selecionados.
   * Ela redefine o estado `uploadNewFiles` para uma string vazia, indicando que não há arquivos selecionados. Além disso, define o
   * estado `newFiles` como `false`, indicando que não há novos arquivos a serem processados.
   *
   * @description
   * A função `closeNWFiles` realiza as seguintes operações:
   * 1. Limpa o estado `uploadNewFiles`, que contém a lista de arquivos selecionados, definindo-o como uma string vazia.
   * 2. Define o estado `newFiles` como `false`, sinalizando que não há novos arquivos selecionados para upload.
   * 3. Esta função é geralmente chamada quando o usuário decide cancelar o envio de arquivos ou fechar a tela de visualização de arquivos.
   *
   * @returns {void}
   */
  function closeNWFiles() {
    // Limpa a lista de arquivos selecionados
    setUploadNewFiles([]);

    // Indica que não há novos arquivos a serem processados
    setNewFiles(false);
  }

  /**
   * Envia os novos arquivos selecionados para o servidor e atualiza a interface com as novas informações.
   *
   * Esta função prepara e envia os arquivos selecionados pelo usuário para o servidor, incluindo dados adicionais como a data e hora atuais.
   * Após o envio, a função recarrega a visualização dos arquivos associados ao chamado atual e atualiza o chat com as novas informações.
   *
   * @description
   * A função `submitNewFiles` realiza as seguintes operações:
   * 1. Cria uma instância de `FormData` para enviar os arquivos e dados adicionais ao servidor.
   * 2. Itera sobre os arquivos selecionados e adiciona cada um ao `FormData` com a chave "files".
   * 3. Obtém a data e hora atuais e formata esses valores como strings. Adiciona essas informações ao `FormData` com as chaves "date" e "hours".
   * 4. Envia uma requisição `POST` para o endpoint `upload-new-files/{ticketID}`, onde `{ticketID}` é o identificador do chamado atual. Inclui o `FormData` no corpo da requisição.
   * 5. No sucesso da requisição, atualiza o estado `newFiles` para `false`, recarrega a visualização dos arquivos e o chat com as novas informações recebidas da resposta do servidor.
   * 6. Em caso de erro, exibe uma mensagem de erro para o usuário e loga o erro no console.
   *
   * @returns {void}
   */
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
    fetch("upload-new-files/" + ticketID, {
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

  /**
   * Recarrega a exibição dos arquivos associados ao chamado com base nas informações fornecidas.
   *
   * Esta função processa a lista de arquivos recebidos e atualiza a visualização dos mesmos na interface do usuário.
   * Cada tipo de arquivo é tratado de maneira específica e é criado um componente de visualização apropriado para cada tipo.
   * Após criar a representação dos arquivos, a função atualiza o estado `fileTicket` com esses componentes.
   *
   * @description
   * A função `reloadFiles` realiza as seguintes operações:
   * 1. Itera sobre a lista de arquivos e determina o tipo de cada arquivo.
   * 2. Para cada tipo de arquivo, cria um componente visual com a imagem ou ícone apropriado e um botão para download.
   *    - Arquivos de e-mail ("mail"): Exibe um ícone de e-mail com um botão para download do conteúdo.
   *    - Arquivos Excel ("excel"): Exibe um ícone de planilha com um botão para download do arquivo Excel.
   *    - Arquivos ZIP ("zip"): Exibe um ícone de arquivo compactado com um botão para download do arquivo ZIP.
   *    - Arquivos TXT ("txt"): Exibe um ícone de documento de texto com um botão para download do arquivo TXT.
   *    - Arquivos Word ("word"): Exibe um ícone de documento Word com um botão para download do arquivo.
   *    - Arquivos PDF ("pdf"): Exibe um ícone de PDF com um botão para download do arquivo PDF.
   *    - Arquivos de imagem: Exibe a imagem em si com um botão para download e uma funcionalidade para abrir a imagem em uma visualização maior.
   * 3. Cada componente criado é adicionado ao estado `fileTicket` para ser renderizado na interface.
   *
   * @param {Object} param0 - Objeto contendo informações sobre os arquivos a serem exibidos.
   * @param {Array} param0.files - Lista dos tipos de arquivos.
   * @param {Array} param0.name_file - Lista dos nomes dos arquivos.
   * @param {Array} param0.content_file - Lista do conteúdo dos arquivos.
   * @returns {void}
   */
  async function reloadFiles({ files, name_file, content_file }) {
    // Itera sobre cada arquivo e processa com base no tipo
    for (let i = 0; i < files.length; i++) {
      var file = files[i];
      // Cria um componente de visualização baseado no tipo de arquivo
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

  /**
   * Solicita e baixa o PDF do chamado atual.
   *
   * Esta função faz uma solicitação POST para o endpoint do chamado, solicitando o download do PDF associado ao chamado.
   * Após receber a resposta, que deve conter o conteúdo do PDF em formato base64, a função cria um blob a partir desse conteúdo,
   * gera um URL de objeto e cria um link temporário para iniciar o download do arquivo PDF.
   *
   * @description
   * A função `downloadTicket` realiza as seguintes etapas:
   * 1. Envia uma solicitação POST para o endpoint "/helpdesk/ticket/{ticketID}" com o cabeçalho "Download-Ticket" e o token CSRF.
   *    - A solicitação inclui um corpo JSON com a chave "download" definida como "download".
   * 2. Após a resposta, converte o conteúdo para JSON.
   * 3. Cria um blob com o conteúdo do PDF retornado pela resposta e define o tipo MIME como "application/pdf".
   * 4. Gera um URL de objeto a partir do blob e cria um link de download temporário.
   * 5. Define o nome do arquivo a ser baixado como "Chamado: {ticketID}" e simula um clique no link para iniciar o download.
   * 6. Remove o link temporário do DOM após o download.
   *
   * @returns {void}
   */
  function downloadTicket() {
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "X-CSRFToken": token,
        "Download-Ticket": "download Ticket",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({ download: "download" }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Cria um blob com o conteúdo do PDF e define o tipo MIME
        const blob = downloadMail({
          data: "application/pdf",
          content: data.pdf,
        });

        // Gera um URL de objeto para o blob
        const url = window.URL.createObjectURL(blob);

        // Cria um link temporário para o download do PDF
        const a = document.createElement("a");
        a.href = url;
        a.download = "Chamado: " + ticketID;
        document.body.appendChild(a);

        // Simula um clique no link para iniciar o download
        a.click();

        // Remove o link temporário do DOM
        document.body.removeChild(a);
      })
      .catch((err) => {
        // Define a mensagem de erro e o tipo de erro em caso de falha
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);

        // Registra o erro no console
        console.log(err);
      });
  }

  /**
   * Controla a visibilidade de um menu de configuração com base na interação do usuário.
   *
   * Esta função é acionada por um evento de clique e determina se o menu de configuração deve ser exibido ou oculto.
   * A visibilidade do menu é controlada pela classe CSS `visually-hidden`. Se o elemento de conteúdo estiver oculto
   * e o clique for feito em um dos identificadores especificados, o menu será exibido. Caso contrário, o menu será ocultado.
   *
   * @description
   * A função `OpenConfig` realiza as seguintes etapas:
   * 1. Verifica se o clique foi feito em um dos identificadores de alvo específicos (`"drp"` ou `"imd"`) e se o menu de conteúdo
   *    está atualmente oculto (ou seja, possui a classe `visually-hidden`).
   * 2. Se ambas as condições forem verdadeiras, remove a classe `visually-hidden` para tornar o menu visível.
   * 3. Se as condições não forem atendidas, adiciona a classe `visually-hidden` para ocultar o menu.
   *
   * @param {Object} event - O evento de clique que aciona a função.
   * @param {Object} event.target - O alvo do clique que contém o identificador do evento.
   *
   * @returns {void}
   */
  function OpenConfig(event) {
    if ((event.target.id === "drp" && dropCont.current.classList.contains("visually-hidden")) || (event.target.id === "imd" && dropCont.current.classList.contains("visually-hidden"))) {
      dropCont.current.classList.remove("visually-hidden");
    } else {
      dropCont.current.classList.add("visually-hidden");
    }
  }

  /**
   * Busca e exibe os detalhes técnicos de um chamado específico.
   *
   * Esta função realiza uma requisição GET para o endpoint `/details/{ticketID}`, onde `{ticketID}` é o ID do chamado para o qual
   * os detalhes técnicos estão sendo requisitados. O cabeçalho da requisição inclui `Accept: "application/json"` para indicar que
   * o cliente espera uma resposta no formato JSON e `Cache-Control: "no-cache"` para garantir que a resposta não seja obtida do cache.
   *
   * Após a resposta ser recebida, a função verifica o status da resposta:
   * - Se o status for 200 (OK), a função converte a resposta para JSON e passa os dados para a função `MountChatDetails`.
   * - Se o status não for 200, a função ainda tenta converter a resposta para JSON (embora, idealmente, deve-se tratar adequadamente os erros HTTP).
   *
   * Em caso de erro na requisição, a função captura a exceção e a imprime no console para depuração.
   *
   * @description
   * A função `TechDetails` realiza as seguintes etapas:
   * 1. Envia uma requisição GET para buscar os detalhes técnicos de um chamado específico.
   * 2. Verifica o status da resposta. Se for 200, processa os dados JSON e chama a função `MountChatDetails` com os detalhes técnicos.
   * 3. Em caso de falha, registra o erro no console para revisão.
   *
   * @returns {void}
   */
  function TechDetails() {
    fetch("details/" + ticketID, { method: "GET", headers: { Accept: "application/json", "Cache-Control": "no-cache" } })
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

  function closeDetails() {
    setTechDetails(false);
  }

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        if (techDetails) {
          closeDetails(); // Fecha apenas techDetails se estiver aberto
        } else if (ticketWindow) {
          Close_ticket(); // Fecha ticketWindow se techDetails não estiver aberto
        }
      }
    }

    // Adiciona o listener apenas se ticketWindow ou techDetails estiverem abertos
    if (ticketWindow || techDetails) {
      document.addEventListener("keydown", handleEscape);
    }

    // Função de limpeza para remover o listener
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketWindow, techDetails]); // Dependências ajustadas para ambos os estados

  return (
    <Div className={`position-relative ${theme}`}>
      {navbar && (
        <div className={classBlur}>
          <Navbar Name={userData.name} JobTitle={userData.job_title} />
        </div>
      )}
      {message && (
        <ZIndex className="position-fixed top-0 start-50 translate-middle-x mt-5">
          <Message TypeError={typeError} MessageError={messageError} CloseMessage={closeMessage2} />
        </ZIndex>
      )}
      <TitlePage className="text-center text-light mt-3">Central de Gerenciamento de Chamados TI</TitlePage>
      <div className={`d-flex flex-column justify-content-center w-100 ${classBlur}`}>
        <div className="d-flex justify-content-center w-100">
          <DashBoardPie sector={"TI"} clss={colorTheme} />
        </div>
        <div className="d-flex justify-content-center">
          <DashboardBar />
        </div>
      </div>
      <DivFilter className={`${classBlur} ${themeFilter}`}>
        <div className="form-floating">
          <Input1 type="text" className="form-control" id="floatingInput" onKeyUp={getTicketKey} />
          <label htmlFor="floatingInput">Ocorrência | Problema | Data...</label>
        </div>
        <Select1 ref={selectOcorrence} className="form-select" onChange={enableProblem}>
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
            ref={selectBo}
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
            <option value="soft">Software e Aplicativos</option>
            <option value="dados">Integridade de Dados</option>
            <option value="all">Todos</option>
          </Select1>
        )}
        {problemSyst && (
          <Select1
            ref={selectBo}
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
        <Select1 name="" ref={selectOrderO} className="form-select" onChange={selectOrder}>
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
            ref={fiveView}
            onClick={async () => {
              setCountTicket(5);
              await getTicketFilter({ quantity: 5 });
              fiveView.current.style.backgroundColor = "#00B4D8";
            }}
          >
            <IMGS1 src={IMG1} alt="" />
            <PQuantity>5</PQuantity>
          </DivImages>
          <DivImages
            className="btn"
            ref={thenView}
            onClick={async () => {
              setCountTicket(10);
              await getTicketFilter({ quantity: 10 });
              thenView.current.style.backgroundColor = "#00B4D8";
            }}
          >
            <IMGS1 src={IMG2} alt="" />
            <PQuantity>10</PQuantity>
          </DivImages>
          <DivImages
            className="btn"
            ref={fiftyView}
            onClick={async () => {
              setCountTicket(50);
              await getTicketFilter({ quantity: 50 });
              fiftyView.current.style.backgroundColor = "#00B4D8";
            }}
          >
            <IMGS1 src={IMG3} alt="" />
            <PQuantity>50</PQuantity>
          </DivImages>
          <DivImages
            className="btn"
            ref={allView}
            onClick={async () => {
              setCountTicket(100000);
              await getTicketFilter({ quantity: 100000 });
              allView.current.style.backgroundColor = "#00B4D8";
            }}
          >
            <IMGS1 src={IMG4} alt="" />
            <PQuantity>todos</PQuantity>
          </DivImages>
        </DivContainerImages>
        <DivSelectView>
          <PSelectView className="position-absolute top-0 start-0 translate-middle">Modo de Visualização</PSelectView>
          <button className="btn" ref={selectViewList} onClick={listCard}>
            <ImgSelectView src={List} className="img-fluid" alt="" />
          </button>
          <button className="btn" ref={selectViewCard} onClick={viewCard}>
            <ImgSelectView src={Card} clasName="img-fluid" alt="" />
          </button>
        </DivSelectView>
        <DivSelectView>
          <select className="form-select" onChange={filterTechnician}>
            <option key={0} value="" selected disabled>
              Tecnico Responsavel
            </option>
            {techs.map((tech, index) => (
              <option key={index + 1} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </DivSelectView>
        <DivSelectView>
          <PSelectView className="position-absolute top-0 start-0 translate-middle">Status</PSelectView>
          <Button1
            className="btn"
            ref={btnOpen}
            onClick={() => {
              ticketOpenStatus();
            }}
          >
            Aberto
          </Button1>
          <button
            className="btn"
            value="close"
            ref={btnClose}
            onClick={() => {
              ticketClose();
            }}
          >
            Fechado
          </button>
          <button
            className="btn"
            value="close"
            ref={btnStop}
            onClick={() => {
              ticketStop();
            }}
          >
            Aguardo
          </button>
          <Button2
            className="btn"
            value="all"
            ref={btnAll}
            onClick={() => {
              statusTicketAll();
            }}
          >
            Todos
          </Button2>
        </DivSelectView>
      </DivFilter>
      <section ref={sectionTicket} className="mt-3 position-relative">
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
          <div className="w-100 d-flex">
            <div className="d-flex justify-content-start w-100">
              <BtnNF onClick={downloadTicket}>
                <img src={DownTick} alt="download Ticket" />
              </BtnNF>
              <DropDown>
                <DropBTN id="drp" onClick={OpenConfig}>
                  <IMGConfig id="imd" src={Seeting} alt="" />
                </DropBTN>
                <DropContent2 ref={dropCont} className="visually-hidden">
                  <DropBTN
                    className="btn btn-success w-100"
                    onClick={() => {
                      closeTicket();
                    }}
                    hidden={ticketOpen === true ? false : true}
                  >
                    Finalizar
                  </DropBTN>
                  <DropBTN
                    className="btn btn-info w-100"
                    onClick={() => {
                      reopenTicket();
                    }}
                    hidden={ticketOpen}
                  >
                    Reabrir
                  </DropBTN>
                  <DropBTN
                    className="btn btn-primary w-100"
                    onClick={() => {
                      stopTicket();
                    }}
                    hidden={ticketOpen === true || false ? false : true}
                  >
                    Aguardar
                  </DropBTN>
                  <DropBTN
                    className="btn btn-danger w-100"
                    onClick={() => {
                      setCreate_user_acess(false);
                      setAlocate_Machine_Acess(false);
                    }}
                  >
                    Modificar
                  </DropBTN>
                  <DropBTN className="btn btn-danger w-100" onClick={TechDetails}>
                    Detalhes Tecnicos
                  </DropBTN>
                  <select className="form-select" onChange={ChangeTechnician} value={selectedTech} hidden={ticketOpen === true ? false : true}>
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
            <div className="w-100 justify-content-center d-flex">
              <h3 className="text-center text-uppercase fw-bold text-danger mt-3">chamado {ticketID}</h3>
            </div>
            <div className="w-100 justify-content-end d-flex">
              <CloseBTN onClick={Close_ticket}>
                <Close src={CloseIMG} alt="" />
              </CloseBTN>
            </div>
          </div>
          {loading && <Loading />}
          <div className="overflow-hidden">
            <div className="d-flex flex-column">
              <input type="text" value={"Usuário: " + ticketNAME} className="form-control" disabled />
              <input type="text" value={"Departamento: " + ticketDEPARTMENT} className="form-control" disabled />
              <input type="text" value={"Email: " + ticketMAIL} className="form-control" disabled />
              <input type="text" value={"Unidade: " + ticketCOMPANY} className="form-control" disabled />
              <input type="text" value={"Setor: " + ticketSECTOR} className="form-control" disabled />
              <input type="text" value={"Ocorrência: " + ticketOCCURRENCE} className="form-control" disabled />
              <input type="text" value={"Problema: " + ticketPROBLEMN} className="form-control" disabled />
              {showEquipament && (
                <div>
                  <input type="text" value={"Detalhes: " + ticketPROBLEMN} className="form-control" disabled />
                  <a href={`http://sappp01:3000/home/computers/view-machine/${equipament}`}>Equipamento</a>
                </div>
              )}
              <TextObersavation ref={textareaRef} name="observation" disabled></TextObersavation>
              <input type="text" value={"tempo de vida do chamado: " + lifeTime + " dias"} className="form-control" disabled />
              <DivFile hidden={fileticket.length >= 1 ? false : true} className="w-100">
                {fileticket}
              </DivFile>
              <input type="text" value={"Tecnico responsavel: " + (ticketResponsible_Technician ? ticketResponsible_Technician : "Nenhum técnico atribuído")} className="form-control" disabled />
            </div>
            <DivChat id="chatDiv">
              {loadingChat && <LoadingChat />}
              {mountChat}
              {messageChat && (
                <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                  <Message TypeError={typeError} MessageError={messageError} CloseMessage={closeMessage} />
                </div>
              )}
            </DivChat>
            {chat && (
              <div className="w-100 d-flex">
                <div className="w-100">
                  <input className="form-control h-100 fs-5" type="text" onKeyUp={NewChat} ref={inputChat} />
                </div>
                <BtnChat2>
                  <InputFile className="w-100" type="file" multiple onInput={UploadNewFiles} />
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
                    <ImgBTNCls src={Exclude} alt="Fechar" />
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
        <div className={`w-100 text-center ${classBlur}`}>
          <button className="btn btn-info mb-5" onClick={moreTickets}>
            Carregar Mais
          </button>
        </div>
      )}
      {imageopen && (
        <DivImageOpen className="position-fixed top-50 start-50 translate-middle">
          <div className="w-100 positon-relative">
            <BtnOpen onClick={imageclose} className="position-absolute top-0 end-0">
              <Close src={CloseIMG} alt="" />
            </BtnOpen>
          </div>
          <ImageOpen src={imageurl} alt="" />
        </DivImageOpen>
      )}
      {techDetails && (
        <DivDetaisl className="position-fixed top-50 start-50 translate-middle">
          <div className="d-flex">
            <div className="w-100 justify-content-center">
              <h2 className="text-center">Detalhes tecnicos</h2>
            </div>
            <div>
              <ButtonDet onClick={closeDetails}>
                <img src={CloseIMG} alt="" />
              </ButtonDet>
            </div>
          </div>
          <div className="overflow-y-auto w-100 h-100 position relative">{mountDetails}</div>
          <div>
            <DivChatDetails>
              <input className="w-100 form-control" type="text" onKeyUp={NewChatDetails} ref={inputRef} />
              <ImgSend className="img-fluid" src={Send} alt="" onClick={SendDetails} />
            </DivChatDetails>
          </div>
        </DivDetaisl>
      )}
    </Div>
  );
}
