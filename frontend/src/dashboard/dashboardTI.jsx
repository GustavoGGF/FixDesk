import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { Div, DivDashPie } from "../styles/dashboardTIStyle";
import Loading from "../components/loading";
import DashBoardPie from "../components/dashboardPie";
import {
  TicketOpen,
  CloseBTN,
  Close,
  DivChat,
  IMGChat,
} from "../styles/historyStyle";
import CloseIMG from "../images/components/close.png";
import SendIMG from "../images/components/enviar.png";
import Message from "../components/message";

export default function DashboardTI() {
  const [loading, SetLoading] = useState(true);
  const [navbar, SetNavbar] = useState(false);
  const [userData, SetUserData] = useState([]);
  const [tickets, SetTickets] = useState([]);
  const [token, SetToken] = useState("");
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
  const [ticketWindow, SetTicketWindow] = useState(false);
  const [ticketID, SetTicketID] = useState("");
  const [mountChat, SetMountChat] = useState([]);
  const [chat, SetChat] = useState(true);
  const [selectedTech, setSelectedTech] = useState("");
  const [techs, SetTechs] = useState([]);
  const [messageChat, SetMessageChat] = useState(false);
  const [typeError, SetTypeError] = useState("");
  const [messageError, SetMessageError] = useState("");

  useEffect(() => {
    fetch("", {
      method: "POST",
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        SetTechs(data.techs);
        SetUserData(data.userData);
        SetToken(data.token);
        return userData;
      })
      .catch((err) => {
        console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      console.log(userData.name);
      SetNavbar(true);
      fetch("get_ticket_TI", {
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          return SetTickets(data.tickets);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      return;
    }
  }, [userData]);

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

        return SetLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  function helpdeskPage({ id }) {
    fetch("/helpdesk/ticket/" + id, {
      method: "GET",
      headers: {
        "X-CSRF-Token": token,
        pid: userData.pid,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((dataBack) => {
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

        var name_verify = userData.name;

        if (name_verify.includes("ADM")) {
          name_verify = name_verify.replace("ADM", "").trim();
        }

        if (data.responsible_technician === name_verify) {
          if (
            data.chat !== null &&
            data.chat === undefined &&
            data.chat === "undefined"
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

              return mountChat;
            });
          }
        } else {
          const chatDiv = document.getElementById("chatDiv");
          chatDiv.style.background = "#e9ecef";
          SetChat(false);
          SetTypeError("Permissão Negada");
          SetMessageError("Assuma o Chamado para poder ver com mais detalhes");
          SetMessageChat(true);
        }

        return SetTicketWindow(true);
      })
      .catch((err) => {
        return console.log(err);
      });
    return SetTicketWindow(true);
  }

  function Close_ticket() {
    return SetTicketWindow(false);
  }

  function ChangeTechnician(event) {
    setSelectedTech(event.target.value);

    return selectedTech;
  }

  function closeMessage() {
    SetMessageChat(false);
  }

  return (
    <Div className="position-relative">
      {navbar && <Navbar Name={userData.name} JobTitle={userData.job_title} />}
      <DivDashPie>
        <DashBoardPie sector={"TI"} />
      </DivDashPie>
      <div className="w-100 d-flex justify-content-center mt-5">
        {loading && <Loading />}
      </div>
      <div
        id="dashboard"
        className="container d-flex flex-wrap justify-content-around p-5 mt-5 w-100"
      ></div>{" "}
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
            <div>
              <select
                className="form-select"
                onChange={ChangeTechnician}
                value={selectedTech}
              >
                <option key={0} value="" disabled>
                  Tranferir
                </option>
                {techs.map((tech, index) => (
                  <option key={index + 1} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
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
                    CloseMessage={closeMessage}
                  />
                </div>
              )}
            </DivChat>
            {chat && (
              <div className="w-100 d-flex">
                <div className="w-100">
                  <input
                    className="form-control"
                    type="text"
                    onChange={"NewChat"}
                  />
                </div>
                <div>
                  <IMGChat
                    src={SendIMG}
                    className="img-fluid mt-1"
                    alt=""
                    onClick={"SendChat"}
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
