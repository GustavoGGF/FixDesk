import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Loading from "../components/loading";
import {
  Div,
  TicketOpen,
  Close,
  CloseBTN,
  DivChat,
  IMGChat,
} from "../styles/historyStyle";
import Message from "../components/message";
import CloseIMG from "../images/components/close.png";
import SendIMG from "../images/components/enviar.png";

export default function History() {
  const [navbar, SetNavbar] = useState(false);
  const [loading, SetLoading] = useState(true);
  const [ticketWindow, SetTicketWindow] = useState(false);
  const [token, SetToken] = useState("");
  const [Data, SetData] = useState([]);
  const [loadingDash, SetLoadingDash] = useState(true);
  const [tickets, SetTickets] = useState([]);
  const [message, SetMessage] = useState(false);
  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [ticketNAME, SetTicketNAME] = useState("");
  const [ticketDEPARTMENT, SetTicketDEPARTMENT] = useState("");
  const [ticketMAIL, SetTicketMAIL] = useState("");
  const [ticketCOMPANY, SetTicketCOMPANY] = useState("");
  const [ticketSECTOR, SetTicketSECTOR] = useState("");
  const [ticketOCCURRENCE, SetTicketOCCURRENCE] = useState("");
  const [ticketPROBLEMN, SetTicketPROBLEMN] = useState("");
  const [ticketOBSERVATION, SetTicketOBSERVATION] = useState("");
  const [lifeTime, SetLifetime] = useState("");
  const [ticketResponsible_Technician, SetTicketResponsible_Technician] =
    useState("");
  const [ticketID, SetTicketID] = useState("");
  const [mountChat, SetMountChat] = useState([]);
  const [chat, SetChat] = useState(true);
  const [messageChat, SetMessageChat] = useState(false);
  const [textChat, SetTextChat] = useState("");

  useEffect(() => {
    fetch("", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.status === 402) {
          return (window.location.href = "/login");
        }
        return response.json();
      })
      .then((data) => {
        SetToken(data.token);
        SetData(data.data);
        SetTickets(data.tickets);
        if (data.tickets.length === 0) {
          setTypeError("Falta de Dados");
          setMessageError("Você Ainda não abriu nenhum chamado");
          SetLoadingDash(false);
          SetLoading(false);
          SetMessage(true);
          SetNavbar(true);
        }
        return;
      })
      .catch((err) => {
        return console.log(err);
      });
  }, []);

  function helpdeskPage({ id }) {
    fetch("/helpdesk/ticket/" + id, {
      method: "GET",
      headers: {
        "X-CSRF-Token": token,
        pid: Data.pid,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((dataBack) => {
        SetMessageChat(false);
        SetMountChat([]);
        const data = dataBack.data[0];
        const start_date = new Date(data.start_date);

        var CurrentDate = new Date();

        var calcDate = CurrentDate - start_date;

        var lifetime = Math.floor(calcDate / (1000 * 60 * 60 * 24));

        SetTicketNAME(data.ticketRequester);
        SetTicketDEPARTMENT(data.department);
        SetTicketMAIL(data.mail);
        SetTicketCOMPANY(data.company);
        SetTicketSECTOR(data.sector);
        SetTicketOCCURRENCE(data.occurrence);
        SetTicketPROBLEMN(data.problemn);
        SetTicketOBSERVATION(data.observation);
        SetLifetime(lifetime);
        SetTicketResponsible_Technician(data.responsible_technician);
        SetTicketID(data.id);

        if (
          data.chat !== null &&
          data.chat !== undefined &&
          data.chat !== "undefined"
        ) {
          var arrayChat = data.chat.match(/\[.*?\]/g);

          const chatDiv = document.getElementById("chatDiv");
          chatDiv.style.background = "transparent";

          arrayChat.forEach(function (item) {
            if (item.includes("System")) {
              item = item
                .replace("System:", "")
                .replace("[", "")
                .replace("]", "");
              const newItem = (
                <div className="text-center d-flex justify-content-center text-break">
                  <p className="pChat">{item}</p>
                </div>
              );
              SetMountChat((mountChat) => [...mountChat, newItem]);
            }
            if (item.includes("Technician")) {
              item = item
                .replace("Technician:", "")
                .replace("[", "")
                .replace("]", "");
              const newItem = (
                <div className="d-flex justify-content-start w-100 text-break">
                  <p className="tChat2">{item}</p>
                </div>
              );
              SetMountChat((mountChat) => [...mountChat, newItem]);
            }
            if (item.includes("User")) {
              item = item
                .replace("User:", "")
                .replace("[", "")
                .replace("]", "");
              const newItem = (
                <div className="d-flex justify-content-end w-100 text-break">
                  <p className="uChat1">{item}</p>
                </div>
              );
              SetMountChat((mountChat) => [...mountChat, newItem]);
            }
            SetChat(true);

            return mountChat;
          });
        } else {
          const chatDiv = document.getElementById("chatDiv");
          chatDiv.style.background = "#e9ecef";
          setMessageError(
            "O CHAT ESTÁ INDIPONIVÉL ATÉ O TECNICO INICIAR UMA CONVERSA"
          );
          setTypeError("PERMISSÃO NEGADA");
          SetMessageChat(true);
          SetChat(false);
        }
        return SetTicketWindow(true);
      })
      .catch((err) => {
        return console.log(err);
      });
    return SetTicketWindow(true);
  }

  useEffect(() => {
    if (tickets && Object.keys(tickets).length > 0) {
      const dashboard = document.getElementById("dashboard");
      SetLoading(false);
      SetNavbar(true);
      tickets.forEach((ticket) => {
        const div1 = document.createElement("div");
        div1.classList.add("DIV1");
        div1.addEventListener("click", () => {
          helpdeskPage({ id: ticket["id"] });
        });

        const H5 = document.createElement("h5");
        H5.classList.add("H5");
        H5.innerText = "chamado " + ticket["id"];

        const Span1 = document.createElement("span");
        Span1.classList.add("SPAN1");
        Span1.innerText = ticket["ticketRequester"];

        const Span2 = document.createElement("span");
        Span2.classList.add("SPAN1");
        Span2.innerText = "Ocorrência: " + ticket["occurrence"];

        const Span3 = document.createElement("span");
        Span3.classList.add("SPAN1");
        Span3.innerText = "Problema: " + ticket["problemn"];

        const Span4 = document.createElement("span");
        Span4.classList.add("SPAN1");
        Span4.innerText = ticket["start_date"];

        div1.appendChild(H5);
        div1.appendChild(Span1);
        div1.appendChild(Span2);
        div1.appendChild(Span3);
        div1.appendChild(Span4);
        dashboard.appendChild(div1);

        return SetLoadingDash(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  function HelpdeskPage() {
    return (window.location.href = "/helpdesk/");
  }

  function HistoryPage() {
    return window.location.reload();
  }

  function DashboardPage() {
    fetch("/helpdesk/toDashboard", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.status === 403) {
          SetMessage(true);
          setTypeError("Permissões Insuficientes");
          setMessageError(
            "Seu Usuário não possui permissão para acessar este modulo"
          );
        }
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function closeMessage() {
    return SetMessage(false);
  }

  function FAQPage() {
    return (window.location.href = "/helpdesk/FAQ");
  }

  function Exit() {
    fetch("/helpdesk/exit/", {
      method: "GET",
      headers: {
        Accept: "text/html",
      },
    })
      .then((response) => {
        return response.text() && window.location.reload();
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function Close_ticket() {
    SetTicketWindow(false);
  }

  function closeMessage2() {
    return SetMessageChat(false);
  }

  function NewChat(event) {
    const newText = event.target.value;
    SetTextChat(newText);

    return textChat;
  }

  function SendChat() {
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({
        User: Data.name,
        chat: textChat,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  return (
    <Div>
      {navbar && (
        <Navbar
          Name={Data.name}
          JobTitle={Data.job_title}
          Func2={HelpdeskPage}
          Func={HistoryPage}
          Func3={DashboardPage}
          Func5={FAQPage}
          Func4={Exit}
        />
      )}
      {message && (
        <div className="position-absolute top-0 start-50 translate-middle-x mt-5">
          <Message
            TypeError={typeError}
            MessageError={messageError}
            CloseMessage={closeMessage}
          />
        </div>
      )}
      <section
        id="dashboard"
        className="container d-flex flex-wrap justify-content-around p-5 mt-5"
      >
        {loadingDash && <Loading />}
      </section>
      {ticketWindow && (
        <TicketOpen className="position-fixed top-50 start-50 translate-middle">
          <CloseBTN
            onClick={Close_ticket}
            className="position-absolute top-0 end-0"
          >
            <Close src={CloseIMG} alt="" />
          </CloseBTN>
          {loading && <Loading />}
          <div>
            <h3 className="text-center text-uppercase fw-bold text-danger mt-3">
              chamado {ticketID}
            </h3>
            <div className="d-flex flex-column">
              <input
                type="text"
                value={"Usuário: " + ticketNAME}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Departamento: " + ticketDEPARTMENT}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Email: " + ticketMAIL}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Unidade: " + ticketCOMPANY}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Setor: " + ticketSECTOR}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Ocorrência: " + ticketOCCURRENCE}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"Problema: " + ticketPROBLEMN}
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={
                  ticketOBSERVATION
                    ? "Observação: " + ticketOBSERVATION
                    : "Observação: "
                }
                className="form-control"
                disabled
              />
              <input
                type="text"
                value={"tempo de vida do chamado: " + lifeTime + " dias"}
                className="form-control"
                disabled
              />
              <div>
                <input
                  type="text"
                  value={"Arquivos"}
                  className="form-control"
                  disabled
                />
              </div>
              <input
                type="text"
                value={
                  "Tecnico responsavel: " +
                  (ticketResponsible_Technician
                    ? ticketResponsible_Technician
                    : "Nenhum técnico atribuído")
                }
                className="form-control"
                disabled
              />
            </div>
            <DivChat
              id="chatDiv"
              onMouseEnter={() => {
                const chatDiv = document.getElementById("chatDiv");
                chatDiv.scrollTop = chatDiv.scrollHeight;
              }}
            >
              {mountChat}
              {messageChat && (
                <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                  <Message
                    TypeError={typeError}
                    MessageError={messageError}
                    CloseMessage={closeMessage2}
                  />
                </div>
              )}
            </DivChat>
            {chat && (
              <div className="w-100 d-flex">
                <div className="w-100">
                  <input
                    className="form-control h-100 fs-5"
                    type="text"
                    onChange={NewChat}
                  />
                </div>
                <div>
                  <IMGChat
                    src={SendIMG}
                    className="img-fluid mt-1"
                    alt=""
                    onClick={SendChat}
                  />
                </div>
              </div>
            )}
          </div>
        </TicketOpen>
      )}
    </Div>
  );
}
