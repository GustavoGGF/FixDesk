import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from "react";
import "react-day-picker/dist/style.css";
import { Div } from "../styles/dashboardTI.js";
import DashBoardPie from "../components/dashboard/dashboardPie.jsx";
import Navbar from "../components/general/navbar.jsx";
import {
  DivCard,
  H5Card,
  SpanCard,
  TD,
  TH,
  TR,
  TRSPACE,
  Table,
  DivZ,
} from "../styles/historyStyle.js";
import { TitlePage } from "../styles/helpdeskStyle.js";
import Message from "../components/utility/message.jsx";
import "../styles/bootstrap/css/bootstrap.css";
import "../styles/bootstrap/js/bootstrap.js";
import DashboardBar from "../components/dashboard/dashboardBar.jsx";
import FilterTickets from "../components/ticket/filter.jsx";
import { TicketContext } from "../context/TicketContext.js";
import { MessageContext } from "../context/MessageContext.js";
import OpenTicketWindow from "../components/ticket/openTicketWindow.jsx";
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
    document.title = "DashBoard TI";
    const theme = localStorage.getItem("theme");
    if (theme === null || theme === "black") {
      localStorage.setItem("theme", "black");
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
  const [chat, setChat] = useState(false);
  const [inCard, setInCard] = useState(false);
  const [inList, setInList] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const [ticketWindow, setTicketWindow] = useState(false);
  const [showEquipament, setShowEquipament] = useState(false);
  const [btnMore, setBtnMore] = useState(false);
  const [initialFileticket, setInitialFileTicket] = useState(false);
  const [mountDataChat, setMountDataChat] = useState(false);
  const [fetchchat, setFetchChat] = useState(false);
  /**
   * Variáveis de estado String
   */
  const [blurNav, setBlurNav] = useState("");
  const [colorTheme, setColorTheme] = useState("");
  const [lifeTime, setLifetime] = useState("");
  const [theme, setTheme] = useState("");
  const [themeCard, setThemeCard] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [ticketCOMPANY, setTicketCOMPANY] = useState("");
  const [ticketDEPARTMENT, setTicketDEPARTMENT] = useState("");
  const [ticketID, setTicketID] = useState("");
  const [ticketMAIL, setTicketMAIL] = useState("");
  const [ticketOCCURRENCE, setTicketOCCURRENCE] = useState("");
  const [ticketPROBLEMN, setTicketPROBLEMN] = useState("");
  const [ticketResponsible_Technician, setTicketResponsible_Technician] =
    useState("");
  const [ticketSECTOR, setTicketSECTOR] = useState("");
  const [token, setToken] = useState("");
  const [equipament, setEquipament] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [statusFIlter, setStatusFIlter] = useState("");
  const [ticketNAME, setTicketNAME] = useState("");
  const [observation, setObservation] = useState("");
  const [initialFileData, setInitialFileData] = useState("");
  const [initialFileName, setInitialFileName] = useState("");
  const [initialContentFile, setInitialContentFile] = useState("");
  const [dateAlocate, setDateAlocate] = useState("");
  /**
   * Variáveis de estado Int.
   */
  const [quantityMap, setQuantityMap] = useState(0);
  const [moreTickets, SetMoreTickets] = useState(0);
  /**
   * Variáveis de estado Array.
   */
  const [ticketsDash, setTicketsDash] = useState([]);
  const [userData, setUserData] = useState([]);
  const [mountInitialChat, setMountInitialChat] = useState([]);
  const [techsNames, setTechsNames] = useState([]);
  /**
   * Variáveis de referência para o componente DashboardTI.
   */

  const sectionTicket = useRef(null);
  const divRefs = useRef({});

  const {
    ticketData,
    setTicketData,
    ticketWindowAtt,
    setTicketWindowAtt,
    changeTech,
    setChangeTech,
    cardOrList,
    setCardOrList,
    forcedLoad,
    setForcedLoad,
  } = useContext(TicketContext);

  const { setTypeError, setMessageError, setMessage, message } =
    useContext(MessageContext);

  useEffect(() => {
    if (cardOrList && cardOrList.length !== 0) {
      if (cardOrList === "List") {
        ListView();
        setCardOrList("");
      } else if (cardOrList === "Card") {
        CardView();
        setCardOrList("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardOrList]);

  useEffect(() => {
    if (ticketWindowAtt) {
      setTicketWindowAtt(false);
      CloseTicket();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketWindowAtt]); // Dependências ajustadas para ambos os estados

  useEffect(() => {
    if (changeTech && changeTech.length !== 0) {
      CloseTicket();
      HelpdeskPage({ id: changeTech });
      setChangeTech("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeTech]);

  useEffect(() => {
    if (quantityMap > 0) {
      if (localStorage.getItem("quantity") < 5) {
        setBtnMore(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantityMap]);
  /**
   * Função ativada quando a tela de ticket for ativada.
   * Se o textarea tiver conteúdo, a função para ajustar o tamanho do textarea é ativada.
   */

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
    setThemeCard("theme-card-light");
    setThemeFilter("theme-filter-light");
    setColorTheme("color-light");
    setTheme("theme-light");
  }

  var colorBorder = ""; // Variável para armazenar cor da borda.

  /**
   * useEffect para carregar os dados do usuário armazenados localmente ao carregar a página.
   * Faz uma solicitação ao backend para obter os nomes dos técnicos e o token CSRF.
   * Define os dados dos técnicos e o token CSRF nos useState correspondentes.
   * Em caso de erro, exibe uma mensagem de erro fatal.
   */
  useEffect(() => {
    const dataInfo = JSON.parse(localStorage.getItem("dataInfo"));
    if (dataInfo === null || dataInfo === "null") {
      return (window.location.href = "/login");
    }
    setUserData(dataInfo.data);
    fetch("get-info/", {
      method: "GET",
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setTechsNames(data.techs);
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
      try {
        // Verifica se os dados do usuário estão disponíveis e não vazios.
        var quantity = localStorage.getItem("quantity");
        if (quantity === null) {
          localStorage.setItem("quantity", "10");
          quantity = 10;
        }
        setQuantityMap(quantity);

        var status = localStorage.getItem("status");
        if (status === null) {
          localStorage.setItem("status", "open");
          status = "open";
        }
        setStatusFIlter(status);

        var order = localStorage.getItem("order");
        if (order === null) {
          order = "-id";
        }
        setDateValue(order);

        setNavbar(true); // Define a flag de exibição da barra de navegação como verdadeira.
        fetch("get-ticket-ti/" + quantity + "/" + status + "/" + order, {
          // Faz uma solicitação ao backend para obter os chamados de TI.
          method: "GET",
          headers: { Accept: "application/json" },
        })
          .then((response) => {
            return response.json(); // Converte a resposta para JSON.
          })
          .then((data) => {
            setTicketData(data.tickets); // Define os chamados no estado correspondente.
          })
          .catch((err) => {
            // Trata erros.
            setTypeError("FATAL ERROR"); // Define o tipo de erro como "FATAL ERROR".
            setMessageError(err); // Define a mensagem de erro.
            setMessage(true); // Define a flag de exibição de mensagem como verdadeira.
            return console.log(err); // Registra o erro no console.
          });
      } catch (err) {
        setTypeError("FATAL ERROR"); // Define o tipo de erro como "FATAL ERROR".
        setMessageError(err); // Define a mensagem de erro.
        setMessage(true); // Define a flag de exibição de mensagem como verdadeira.
        return console.log(err); // Registra o erro no console.
      }
    } else {
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  useEffect(() => {
    // Verificar se existem tickets e se o local storage foi inicializado
    if (ticketData && Object.keys(ticketData).length > 0) {
      // Obter o valor do local storage
      const selectView = localStorage.getItem("selectView");

      // Verificar se o valor do local storage está definido
      if (
        selectView === null ||
        (selectView === "card" && selectView !== "list")
      ) {
        // Se não estiver definido ou se for um valor inválido, definir como "card"
        return CardView();
      } else if (selectView === "list") {
        // Se for "list", ativar a função de lista
        return ListView();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketData]);

  /**
   * Função para adicionar um zero na frente do número caso seja menor que 10.
   * @param {number} numero - O número a ser formatado.
   * @returns {string} O número formatado com zero à esquerda, se necessário.
   */
  function AddZero(numero) {
    if (numero < 10) {
      return "0" + numero; // Adiciona um zero à esquerda se o número for menor que 10.
    }
    return numero.toString(); // Retorna o número como string se não for menor que 10.
  }

  /**
   * Função para montar os chamados em forma de card.
   */
  function CardView() {
    try {
      // Limpar o estado e preparar o ambiente
      setTicketsDash([]);
      setNavbar(true);
      setInCard(true);
      setInList(false);

      // Definir o tipo de visualização como "card" no local storage
      localStorage.setItem("selectView", "card");

      const btn = document.getElementById("select-view-list");
      btn.style.backgroundColor = "transparent";

      const btn2 = document.getElementById("select-view-card");
      btn2.style.backgroundColor = "#00B4D8";

      // Mapear os tickets para elementos de cartão
      ticketData.forEach((ticket) => {
        // Variáveis para montar a data dos chamados.
        var date = new Date(ticket["start_date"]); // Obtém a data de início do chamado.
        var day = date.getDate(); // Obtém o dia do mês.
        var month = date.getMonth() + 1; // Obtém o mês (0 = janeiro, 1 = fevereiro, etc.) e adiciona 1 para corresponder ao formato convencional.
        var year = date.getFullYear(); // Obtém o ano.

        // Variáveis que contêm data e hora formatadas utilizando a função adicionaZero.
        var dataFormatada = AddZero(day) + "/" + AddZero(month) + "/" + year;
        var horaFormatada =
          AddZero(date.getHours()) + ":" + AddZero(date.getMinutes());

        // Combinação da data e hora formatadas.
        const newDate = dataFormatada + " " + horaFormatada; // Combina a data e a hora formatadas separadas por um espaço.

        // Ajuste da borda do ticket com base no estado do chamado.
        if (ticket["open"] === false) {
          // Se o chamado não estiver aberto, ele foi finalizado.
          colorBorder = "ticket-close"; // Define a borda como indicativa de chamado finalizado.
        } else if (
          ticket["open"] === true &&
          ticket["responsible_technician"] === null
        ) {
          // Se o chamado estiver aberto e sem técnico responsável.
          const currentDate = new Date(); // Obtém a data atual.
          const differenceMilisecond = currentDate - date; // Calcula a diferença em milissegundos entre a data atual e a data de início do chamado.
          const differenceDays = differenceMilisecond / (1000 * 60 * 60 * 24); // Converte a diferença para dias.
          if (differenceDays >= 7) {
            // Se o chamado estiver aberto há mais de 7 dias.
            colorBorder = "ticket-urgent"; // Define a borda como indicativa de chamado urgente.
          } else {
            // Se o chamado estiver aberto há menos de 7 dias.
            colorBorder = "ticket-open-not-view "; // Define a borda como indicativa de chamado aberto, mas não visualizado.
          }
        } else if (
          ticket["open"] === true &&
          ticket["responsible_technician"] !== null
        ) {
          // Se o chamado estiver aberto e com técnico responsável.
          colorBorder = "ticket-open-in-view "; // Define a borda como indicativa de chamado aberto e em atendimento.
        } else if (ticket["open"] === null) {
          // Se o estado do chamado for nulo.
          colorBorder = "ticket-stop"; // Define a borda como indicativa de chamado interrompido.
        }

        const Div = (
          <DivCard
            key={ticket["id"]}
            ref={(el) => (divRefs.current[`tck${ticket.id}`] = el)}
            className={`animate__animated animate__zoomInDown no-border ${colorBorder} ${themeCard} tickets-method`}
            onClick={() => {
              HelpdeskPage({ id: ticket["id"] });
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
        sectionTicket.current.classList.add("dash-card"); // Adiciona a classe "dash-card" ao elemento HTML.
        if (localStorage.getItem("quantity") > 5) {
          setBtnMore(true);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Função para montar os chamados em forma de lista.
   */
  function ListView() {
    try {
      // Limpar o estado e preparar o ambiente
      setTicketsDash([]);
      setNavbar(true);
      setInList(true);
      setInCard(false);

      // Definir o tipo de visualização como "list" no local storage
      localStorage.setItem("selectView", "list");

      const btn = document.getElementById("select-view-list");
      btn.style.backgroundColor = "#00B4D8";

      const btn2 = document.getElementById("select-view-card");
      btn2.style.backgroundColor = "transparent";

      // Mapear os tickets para elementos de lista
      ticketData.forEach((ticket) => {
        // Variáveis para montar a data dos chamados.
        var date = new Date(ticket["start_date"]); // Obtém a data de início do chamado.
        var day = date.getDate(); // Obtém o dia do mês.
        var month = date.getMonth() + 1; // Obtém o mês (0 = janeiro, 1 = fevereiro, etc.) e adiciona 1 para corresponder ao formato convencional.
        var year = date.getFullYear(); // Obtém o ano.

        // Variáveis que contêm data e hora formatadas utilizando a função adicionaZero.
        var dataFormatada = AddZero(day) + "/" + AddZero(month) + "/" + year;
        var horaFormatada =
          AddZero(date.getHours()) + ":" + AddZero(date.getMinutes());

        const newDate = dataFormatada + " " + horaFormatada; // Combina a data e a hora formatadas separadas por um espaço.

        // Ajuste da borda do ticket com base no estado do chamado.
        if (ticket["open"] === false) {
          // Se o chamado não estiver aberto, ele foi finalizado.
          colorBorder = "ticket-close-list"; // Define a borda como indicativa de chamado finalizado.
        } else if (
          ticket["open"] === true &&
          ticket["responsible_technician"] === null
        ) {
          // Se o chamado estiver aberto e sem técnico responsável.
          const currentDate = new Date(); // Obtém a data atual.
          const differenceMilisecond = currentDate - date; // Calcula a diferença em milissegundos entre a data atual e a data de início do chamado.
          const differenceDays = differenceMilisecond / (1000 * 60 * 60 * 24); // Converte a diferença para dias.
          if (differenceDays >= 7) {
            // Se o chamado estiver aberto há mais de 7 dias.
            colorBorder = "ticket-urgent-list"; // Define a borda como indicativa de chamado urgente.
          } else {
            // Se o chamado estiver aberto há menos de 7 dias.
            colorBorder = "ticket-open-not-view-list"; // Define a borda como indicativa de chamado aberto, mas não visualizado.
          }
        } else if (
          ticket["open"] === true &&
          ticket["responsible_technician"] !== null
        ) {
          // Se o chamado estiver aberto e com técnico responsável.
          colorBorder = "ticket-open-in-view-list"; // Define a borda como indicativa de chamado aberto e em atendimento.
        } else if (ticket["open"] === null) {
          // Se o estado do chamado for nulo.
          colorBorder = "ticket-stop-list "; // Define a borda como indicativa de chamado interrompido.
        }

        const Div = (
          <TR
            key={ticket["id"]}
            ref={(el) => (divRefs.current[`tck${ticket.id}`] = el)}
            className={`animate__animated animate__backInUp no-border ${colorBorder} tickets-method`}
            onClick={() => {
              HelpdeskPage({ id: ticket["id"] });
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
        sectionTicket.current.classList.remove("dash-card"); // remove a classe "dashCard" ao elemento HTML.
        if (localStorage.getItem("quantity") > 5) {
          setBtnMore(true);
        }
      });
    } catch (err) {
      console.log(err);
    }
  }

  const handleAnimationEnd = useCallback((event) => {
    try {
      // Aplicando a classe diretamente no elemento que terminou a animação
      event.target.classList.remove("no-border");
      event.target.classList.add("ticket-hover");
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    if (!ticketsDash || ticketsDash.length === 0) return;

    try {
      const ticketsInCard = document.querySelectorAll(".tickets-method");

      if (forcedLoad) {
        ticketsInCard.forEach((ticket) => {
          if (ticket.classList.contains("no-border")) {
            ticket.classList.remove("no-border");
          }
          if (!ticket.classList.contains("ticket-hover")) {
            ticket.classList.add("ticket-hover");
          }
        });
        return setForcedLoad(false);
      }

      ticketsInCard.forEach((ticket) => {
        ticket.addEventListener("animationend", handleAnimationEnd);
      });

      return () => {
        ticketsInCard.forEach((ticket) => {
          ticket.removeEventListener("animationend", handleAnimationEnd);
        });
      };
    } catch (err) {
      console.log(err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsDash]);

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
          "X-CSRFToken": token, // Token CSRF para segurança da requisição
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
      console.log(err);
    }
  }

  /**
   * Função para buscar os dados do chamado selecionado.
   * @param {object} id - O ID do chamado a ser buscado.
   */
  async function HelpdeskPage({ id }) {
    try {
      CloseTicket();
      fetch("/helpdesk/ticket/" + id, {
        method: "GET",
        headers: {
          "X-CSRFToken": token,
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((dataBack) => {
          setBlurNav("addBlur");
          if (sectionTicket && sectionTicket.current) {
            sectionTicket.current.style.filter = "blur(3px)";
          }
          const data = dataBack.data;
          // Chama a função de forma assíncrona sem bloquear o restante do código
          if (data.responsible_technician !== null) {
            const callAsyncFunction = async () => {
              await ChangeLastVW({ id: id, tech: data.responsible_technician });
            };

            // Chama a função, mas o código segue sem esperar a execução terminar
            callAsyncFunction();
          }
          setMessage(false);

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

          const resultado = CalculateDiference(data.start_date);

          const lifetime = `${resultado.diffDias} Dias e ${resultado.diffHoras}:${resultado.diffMinutos} Horas`;

          setTicketNAME(data.ticketRequester);
          setTicketDEPARTMENT(data.department);
          setTicketMAIL(data.mail);
          setTicketCOMPANY(data.company);
          setTicketSECTOR(data.sector);
          setTicketOCCURRENCE(data.occurrence);
          setTicketPROBLEMN(data.problemn);
          if (data.observation && data.observation.length !== 0) {
            setObservation(data.observation);
          }
          if (data.equipament && data.equipament.length !== 0) {
            setShowEquipament(true);
            setEquipament(data.equipament);
            setDateAlocate(data.date_alocate);
          }
          setLifetime(lifetime);
          if (
            data.responsible_technician &&
            data.responsible_technician.length !== 0
          ) {
            setTicketResponsible_Technician(data.responsible_technician);
          }
          setTicketID(data.id);

          var name_verify = userData.name;
          // Verifica se o ticket contém arquivos do tipo e-mail e gera a visualização correspondente, se aplicável.
          if (data.file !== null && data.file.length >= 1) {
            setInitialFileData(data.file);
            setInitialFileName(data.name_file);
            setInitialContentFile(data.content_file);
            setInitialFileTicket(true);
          }
          // Identifica o chat, verifica se contém valores e os separa em grupos de Data, Receptor e Horário.
          if (
            data.chat !== null &&
            data.chat !== undefined &&
            data.chat !== "undefined"
          ) {
            setFetchChat(true);
            setMountDataChat(true);
            setMountInitialChat(data.chat);
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

          if (allFind && data.open) {
            setChat(true);
          }
          setTicketWindow(true);
          setTicketWindowAtt(false);
        })
        .catch((err) => {
          setMessageError(err);
          setTypeError("FATAL ERROR");
          setMessage(true);
          return console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
  }

  // Evento para fechar dropdowns quando o usuário clica fora deles.
  window.onclick = function (event) {
    if (
      !event.target.matches(".dropbtn") &&
      !event.target.matches(".dropdown-content")
    ) {
      try {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
          var openDropdown = dropdowns[i];
          if (openDropdown.classList.contains("showDP")) {
            openDropdown.classList.remove("showDP");
          }
        }
      } catch (err) {
        return console.log(err);
      }
    }
    return;
  };

  async function CloseTicket() {
    if (sectionTicket && sectionTicket.current) {
      sectionTicket.current.style.filter = "blur(0)";
    }
    setInitialFileData("");
    setInitialFileName("");
    setInitialContentFile("");
    setInitialFileTicket(false);
    setBlurNav("");
    setTicketWindow(false);
    setEquipament("");
    setObservation("");
    setTicketResponsible_Technician("");
    setChat(false);
    setShowEquipament(false);
    setMountInitialChat([]);
    return;
  }

  return (
    <Div className={`position-relative ${theme}`}>
      {navbar && (
        <div className={blurNav}>
          <Navbar Name={userData.name} JobTitle={userData.job_title} />
        </div>
      )}
      {message && (
        <DivZ className="position-fixed top-50 start-50 translate-middle z-3">
          <Message
            CloseMessage={() => {
              setMessage(false);
            }}
          />
        </DivZ>
      )}
      <TitlePage className="text-center text-light mt-3">
        Central de Gerenciamento de Chamados TI
      </TitlePage>
      <div
        className={`d-flex flex-column justify-content-center w-100 ${blurNav} mb-5`}
      >
        <div className="d-flex justify-content-center w-100">
          <DashBoardPie sector={"TI"} clss={colorTheme} />
        </div>
        <div className="d-flex justify-content-center mb-5">
          <DashboardBar />
        </div>
      </div>
      <div className="mt7 position-relative">
        <FilterTickets
          url={"dashboards"}
          blurNav={""}
          themeFilter={themeFilter}
          dateValue={dateValue}
          quantityMap={quantityMap}
          statusFilter={statusFIlter}
          userName={userData.name}
          moreTickets={moreTickets}
        />
      </div>
      <section ref={sectionTicket} className="mt-3 position-relative">
        {inList && (
          <Table className="container">
            <thead className="cla">
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
        <OpenTicketWindow
          helpdesk={"dashboard"}
          ticketID={ticketID}
          token={token}
          CloseTicket={CloseTicket}
          ticketNAME={ticketNAME}
          ticketDEPARTMENT={ticketDEPARTMENT}
          ticketMAIL={ticketMAIL}
          ticketCOMPANY={ticketCOMPANY}
          ticketOCCURRENCE={ticketOCCURRENCE}
          ticketPROBLEMN={ticketPROBLEMN}
          ticketSECTOR={ticketSECTOR}
          equipament={equipament}
          dateAlocate={dateAlocate}
          lifeTime={lifeTime}
          ticketResponsible_Technician={ticketResponsible_Technician}
          initialFileticket={initialFileticket}
          showEquipament={showEquipament}
          observation={observation}
          mountDataChat={mountDataChat}
          chat={chat}
          fetchchat={fetchchat}
          userName={userData.name}
          userMail={userData.mail}
          initialFileData={initialFileData}
          initialFileName={initialFileName}
          initialContentFile={initialContentFile}
          mountInitialChat={mountInitialChat}
          techsNames={techsNames}
        />
      )}
      {btnMore && (
        <div className={`w-100 text-center ${blurNav}`}>
          <button
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
      )}
    </Div>
  );
}
