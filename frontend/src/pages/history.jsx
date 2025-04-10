import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import Navbar from "../components/general/navbar";
import {
  Div,
  DivCard,
  H5Card,
  SpanCard,
  Table,
  TD,
  TH,
  TR,
  TRSPACE,
  DivZ,
} from "../styles/historyStyle";
import { TitlePage } from "../styles/helpdeskStyle";
import "react-day-picker/dist/style.css";
import Message from "../components/utility/message";
import FilterTickets from "../components/ticket/filter";
import { TicketContext } from "../context/TicketContext";
import { MessageContext } from "../context/MessageContext";
import OpenTicketWindow from "../components/ticket/openTicketWindow";

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
  }, []); // O array de dependências vazio faz com que o useEffect execute apenas na montagem do componente

  // Variaveis de estado String
  const [colorTheme, setColorTheme] = useState("");
  const [theme, setTheme] = useState("");
  const [themeCard, setThemeCard] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [ticketID, setTicketID] = useState("");
  const [token, setToken] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [statusFIlter, setStatusFIlter] = useState("");
  const [ticketNAME, setTicketNAME] = useState("");
  const [ticketDEPARTMENT, setTicketDEPARTMENT] = useState("");
  const [ticketMAIL, setTicketMAIL] = useState("");
  const [ticketCOMPANY, setTicketCOMPANY] = useState("");
  const [ticketOCCURRENCE, setTicketOCCURRENCE] = useState("");
  const [ticketPROBLEMN, setTicketPROBLEMN] = useState("");
  const [ticketSECTOR, setTicketSECTOR] = useState("");
  const [equipament, setEquipament] = useState("");
  const [lifeTime, setLifetime] = useState("");
  const [ticketResponsible_Technician, setTicketResponsible_Technician] =
    useState("");
  const [blurNav, setBlurNav] = useState("");
  const [observation, setObservation] = useState("");
  const [initialFileData, setInitialFileData] = useState("");
  const [initialFileName, setInitialFileName] = useState("");
  const [initialContentFile, setInitialContentFile] = useState("");
  const [dateAlocate, setDateAlocate] = useState("");
  // Declarando variaveis de estado Boolean
  const [chat, setChat] = useState(false);
  const [fetchchat, setFetchChat] = useState(false);
  const [inCard, setInCard] = useState(false);
  const [inList, setInList] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const [btnMore, setBtnMore] = useState(false);
  const [ticketWindow, setTicketWindow] = useState(false);
  const [showEquipament, setShowEquipament] = useState(false);
  const [initialFileticket, setInitialFileTicket] = useState(false);
  const [mountDataChat, setMountDataChat] = useState(false);
  // Varaiveis de estado Array
  const [Data, setData] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [mountInitialChat, setMountInitialChat] = useState([]);

  // Variaveis de estado Number
  const [quantityMap, setQuantityMap] = useState(0);
  const [moreTickets, SetMoreTickets] = useState(0);

  let colorBorder = "";

  const dashBoard = useRef(null);

  const {
    ticketData,
    setTicketData,
    ticketWindowAtt,
    setTicketWindowAtt,
    cardOrList,
    setCardOrList,
    filterHistory,
    setFilterHistory,
  } = useContext(TicketContext);
  const { setTypeError, setMessageError, setMessage, message } =
    useContext(MessageContext);

  useEffect(() => {
    if (cardOrList && cardOrList.length !== 0) {
      if (cardOrList === "List") {
        ViewList();
        setCardOrList("");
      } else if (cardOrList === "Card") {
        ViewCard();
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
    // Função assíncrona para buscar e processar os dados necessários ao iniciar o componente
    const fetchData = async () => {
      try {
        // Obtém os dados armazenados localmente no navegador (localStorage)
        const dataInfo = JSON.parse(localStorage.getItem("dataInfo"));
        if (dataInfo === null || dataInfo === "null") {
          return (window.location.href = "/login");
        }
        // Se os dados não existirem, lança um erro e interrompe a execução
        if (!dataInfo)
          throw new Error("Informações de usuário não encontradas");

        // Atualiza o estado `data` com as informações obtidas do localStorage
        setData(dataInfo.data);

        var quantity = localStorage.getItem("quantity");
        if (quantity === null || quantity === "null") {
          localStorage.setItem("quantity", 10);
          quantity = 10;
        }

        var status_current = localStorage.getItem("status");
        if (status_current === null || status_current === "null") {
          localStorage.setItem("status", "open");
          status_current = "open";
        }

        var order_current = localStorage.getItem("order");
        if (order_current == null || order_current === "null") {
          localStorage.setItem("order", "-id");
          order_current = "-id";
        } else {
          if (order_current === "id") {
            setDateValue("id");
          } else {
            setDateValue("-id");
          }
        }

        // Envia os dados para o servidor através de uma requisição POST
        const response = await fetch(
          "/helpdesk/get-ticket/" +
            quantity +
            "/" +
            dataInfo.data.name +
            "/" +
            status_current +
            "/" +
            order_current,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        // Caso o status da resposta seja 402 (não autorizado ou sessão expirada), redireciona para a página de login
        if (response.status === 402) {
          window.location.href = "/login";
          return; // Interrompe a execução do restante da função
        }

        // Converte a resposta para JSON e armazena os dados retornados
        const data = await response.json();
        // Verifica se não há tickets e define mensagens de erro informativas para o usuário
        if (data.tickets.length === 0) {
          setTypeError("Falta de Dados");
          setMessageError("Você Ainda não abriu nenhum chamado");
          setMessage(true);
          setNavbar(true);
        }
        // Atualiza os estados com os dados recebidos da API
        setToken(data.token);
        setTicketData(data.tickets);
        setQuantityMap(quantity);
        setStatusFIlter(status_current);
      } catch (error) {
        // Em caso de erro, define mensagens de erro e exibe no console para depuração
        setTypeError("Erro Fatal");
        setMessageError(error.message || "Erro desconhecido");
        setMessage(true);
        console.error("Erro na solicitação:", error);
      }
    };

    // Chama a função fetchData assim que o componente for montado
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependências vazias garantem que o efeito será executado apenas uma vez, quando o componente for montado

  /**
   * Altera o último visualizador de um chamado no sistema de helpdesk.
   *
   * @param {Object} params - Parâmetros da função.
   * @param {number} params.id - ID do chamado a ser atualizado.
   * @param {string} params.tech - Nome do técnico responsável pelo chamado.
   * @returns {Promise<Response>} - Retorna a resposta da requisição fetch.
   */
  async function ChangeLastVW({ id, tech }) {
    return fetch(`/helpdesk/change-last-viewer/${id}`, {
      method: "POST",
      headers: {
        "X-CSRFToken": token, // Token CSRF para segurança da requisição
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
  function HelpdeskPage({ id }) {
    CloseTicket();
    fetch("/helpdesk/ticket/" + id, {
      method: "GET",
      headers: {
        "X-CSRF-Token": token,
        Accept: "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((dataBack) => {
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
          dashBoard.current.style.filter = "blur(3px)";
          // Oculta a mensagem do chat
          setMessage(false);
          // Extrai a data do primeiro ticket de chamado
          const data = dataBack.data;

          // Chama a função de forma assíncrona sem bloquear o restante do código
          if (data.responsible_technician !== null) {
            const callAsyncFunction = async () => {
              await ChangeLastVW({ id: id, tech: data.responsible_technician });
            };
            callAsyncFunction();
          }

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
          if (data.equipament && data.equipament.length !== 0) {
            setShowEquipament(true);
            setEquipament(data.equipament);
            setDateAlocate(data.date_alocate);
          }
          if (data.observation && data.observation.length !== 0) {
            setObservation(data.observation);
          }
          setLifetime(lifetime);
          if (
            data.responsible_technician &&
            data.responsible_technician.length !== 0
          ) {
            setTicketResponsible_Technician(data.responsible_technician);
            if (data.open) {
              setChat(true);
            }
          }

          setTicketID(data.id);
          if (data.file !== null && data.file.length >= 1) {
            setInitialFileData(data.file);
            setInitialFileName(data.name_file);
            setInitialContentFile(data.content_file);
            setInitialFileTicket(true);
          }
          if (
            data.chat !== null &&
            data.chat !== undefined &&
            data.chat !== "undefined"
          ) {
            setFetchChat(true);
            setMountDataChat(true);
            setMountInitialChat(data.chat);
          }
          setTicketWindow(true);
          setTicketWindowAtt(false);
        } catch (err) {
          return console.log(err);
        }
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  useEffect(() => {
    if (ticketData && Object.keys(ticketData).length > 0) {
      setTickets([]);
      const selectView = localStorage.getItem("selectView");
      if (selectView === null || selectView === "card") {
        return ViewCard();
      } else {
        return ViewList();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketData]);

  function AddZero(numero) {
    if (numero < 10) {
      return "0" + numero;
    }
    return numero;
  }

  function ViewCard() {
    try {
      setTickets([]);
      setNavbar(true);
      setInCard(true);
      setInList(false);

      localStorage.setItem("selectView", "card");

      const btn = document.getElementById("select-view-card");
      btn.style.backgroundColor = "#00B4D8";

      const btn2 = document.getElementById("select-view-list");
      btn2.style.backgroundColor = "transparent";

      ticketData.forEach((ticket) => {
        var date = new Date(ticket["start_date"]);

        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        var dataFormatada = AddZero(day) + "/" + AddZero(month) + "/" + year;
        var horaFormatada =
          AddZero(date.getHours()) + ":" + AddZero(date.getMinutes());

        var newDate = dataFormatada + " " + horaFormatada;

        if (ticket["open"] === false) {
          colorBorder = "ticket-close";
        } else if (
          ticket["open"] === true &&
          ticket["responsible_technician"] === null
        ) {
          const currentDate = new Date();

          const diferenceMilisecond = currentDate - date;

          const diferenceDays = diferenceMilisecond / (1000 * 60 * 60 * 24);

          if (diferenceDays >= 7) {
            colorBorder = "ticket-urgent";
          } else {
            colorBorder = "ticket-open-not-view";
          }
        } else if (
          ticket["open"] === true &&
          ticket["responsible_technician"] !== null
        ) {
          colorBorder = "ticket-open-in-view";
        } else if (ticket["open"] === null) {
          colorBorder = "ticket-stop";
        }

        const Div = (
          <DivCard
            className={`animate__animated animate__zoomInDown no-border ${colorBorder} ${themeCard} tickets_method`}
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

        setTickets((ticketsDash) => [...ticketsDash, Div]);
        const dash = document.getElementById("dashboard");
        dash.classList.add("dash-card");

        if (localStorage.getItem("quantity") > 5) {
          setBtnMore(true);
        }

        return ticketData;
      });
    } catch (err) {
      return console.log(err);
    }
  }

  function ViewList() {
    try {
      setTickets([]);
      setNavbar(true);
      setInList(true);
      setInCard(false);

      localStorage.setItem("selectView", "list");

      const btn = document.getElementById("select-view-list");
      btn.style.backgroundColor = "#00B4D8";

      const btn2 = document.getElementById("select-view-card");
      btn2.style.backgroundColor = "transparent";

      ticketData.forEach((ticket) => {
        var date = new Date(ticket["start_date"]);

        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();

        var dataFormatada = AddZero(day) + "/" + AddZero(month) + "/" + year;
        var horaFormatada =
          AddZero(date.getHours()) + ":" + AddZero(date.getMinutes());

        const newDate = dataFormatada + " " + horaFormatada;

        if (ticket["open"] === false) {
          colorBorder = "ticket-close-list";
        } else if (
          ticket["open"] === true &&
          ticket["responsible_technician"] === null
        ) {
          const currentDate = new Date();

          const diferenceMilisecond = currentDate - date;

          const diferenceDays = diferenceMilisecond / (1000 * 60 * 60 * 24);

          if (diferenceDays >= 7) {
            colorBorder = "ticket-urgent-list";
          } else {
            colorBorder = "ticket-open-not-view-list";
          }
        } else if (
          ticket["open"] === true &&
          ticket["responsible_technician"] !== null
        ) {
          colorBorder = "ticket-open-in-view-list";
        } else if (ticket["open"] === null) {
          colorBorder = "ticket-stop-list";
        }
        const Div = (
          <TR
            key={ticket["id"]}
            className={`animate__animated animate__backInUp no-border ${colorBorder} tickets_method`}
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

        setTickets((ticketsDash) => [...ticketsDash, Div]); // Adiciona o cartão ao array de chamados.
        setTickets((ticketsDash) => [...ticketsDash, Space]);
        const dash = document.getElementById("dashboard");
        dash.classList.remove("dash-card");

        if (localStorage.getItem("quantity") > 5) {
          setBtnMore(true);
        }

        return ticketData;
      });
    } catch (err) {
      return console.log();
    }
  }

  const handleAnimationEnd = useCallback((event) => {
    try {
      // Aplicando a classe diretamente no elemento que terminou a animação
      event.target.classList.remove("no-border");
      event.target.classList.add("ticket-hover");
    } catch (err) {
      return console.log(err);
    }
  }, []);

  useEffect(() => {
    try {
      if (!tickets || tickets.length === 0) return;

      const ticketsInCard = document.querySelectorAll(".tickets_method");

      if (filterHistory) {
        ticketsInCard.forEach((ticket) => {
          if (ticket.classList.contains("no-border")) {
            ticket.classList.remove("no-border");
          }
          if (!ticket.classList.contains("ticket-hover")) {
            ticket.classList.add("ticket-hover");
          }
        });
        return setFilterHistory(false);
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
      return console.log(err);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  async function CloseTicket() {
    try {
      const dash = document.getElementById("dashboard");
      dash.style.filter = "blur(0)";
      setBlurNav("");
      setTicketWindow(false);
      setEquipament("");
      setObservation("");
      setTicketResponsible_Technician("");
      setChat(false);
      setShowEquipament(false);
      setMountInitialChat([]);
      return;
    } catch (err) {
      return console.log(err);
    }
  }

  return (
    <Div className={theme}>
      {navbar && (
        <div className={blurNav}>
          <Navbar Name={Data.name} JobTitle={Data.job_title} />
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
        Histórico de Chamados
      </TitlePage>
      <FilterTickets
        url={"history"}
        blurNav={blurNav}
        themeFilter={themeFilter}
        dateValue={dateValue}
        quantityMap={quantityMap}
        statusFilter={statusFIlter}
        userName={Data.name}
        moreTickets={moreTickets}
      />
      <section ref={dashBoard} id="dashboard">
        {inList && (
          <Table className="container">
            <thead className="cla">
              <TH className={colorTheme}>Chamado</TH>
              <TH className={colorTheme}>Usuario</TH>
              <TH className={colorTheme}>Ocorrencia</TH>
              <TH className={colorTheme}>Descrição</TH>
              <TH className={colorTheme}>Data Abertura</TH>
            </thead>
            <tbody>{tickets}</tbody>
          </Table>
        )}
        {inCard && <>{tickets}</>}
      </section>
      {ticketWindow && (
        <OpenTicketWindow
          helpdesk={"helpdesk"}
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
          userName={Data.name}
          userMail={Data.mail}
          initialFileData={initialFileData}
          initialFileName={initialFileName}
          initialContentFile={initialContentFile}
          mountInitialChat={mountInitialChat}
          techsNames={[]}
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
