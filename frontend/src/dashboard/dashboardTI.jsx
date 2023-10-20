/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import {
  Div,
  DivDashPie,
  DropdownConten,
  Dropdown,
  DropdownButton,
  DivDrop,
  P1,
  DivFilter,
  Input1,
  Select1,
  DivContainerImages,
  DivImages,
  IMGS1,
} from "../styles/dashboardTIStyle";
import Loading from "../components/loading";
import DashBoardPie from "../components/dashboardPie";
import {
  TicketOpen,
  CloseBTN,
  Close,
  DivChat,
  BtnChat,
} from "../styles/historyStyle";
import CloseIMG from "../images/components/close.png";
import Message from "../components/message";
import "../styles/bootstrap-5.3.0-dist/css/bootstrap.css";
import "../styles/bootstrap-5.3.0-dist/js/bootstrap.js";
import "../styles/bootstrap-5.3.0-dist/js/bootstrap.bundle";
import "../styles/bootstrap-5.3.0-dist/js/bootstrap.esm";
import IMG1 from "../images/dashboard_TI/quantity_1.png";
import IMG2 from "../images/dashboard_TI/quantity_2.png";
import IMG3 from "../images/dashboard_TI/quantity_3.png";
import IMG4 from "../images/dashboard_TI/quantity_4.png";
import Registration from "../components/equipment_registration";

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
  const [textChat, SetTextChat] = useState("");
  const [message, SetMessage] = useState(false);
  const [dropdownBTN, SetDropDownBTN] = useState(false);
  const [fetchchat, SetFetchChat] = useState(false);
  const [countchat, SetCountChat] = useState();
  const [initUpdateChat, SetInitUpdateChat] = useState();
  const [fakeSelect, SetFakeSelect] = useState(true);
  const [problemInfra, SetProblemInfra] = useState(false);
  const [equipamentforuser, SetEquipamentForUser] = useState(false);

  let count = 0;
  let timeoutId;

  function aumentarCount() {
    count++;

    SetInitUpdateChat(count);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(aumentarCount, 5000); // Chama a função novamente após 5 segundos
  }

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
      SetNavbar(true);
      SetDropDownBTN(true);
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
        setSelectedTech("");
        SetMessageChat(false);
        SetMountChat([]);
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
            data.chat !== undefined &&
            data.chat !== "undefined"
          ) {
            SetCountChat(data.chat.length);
            SetFetchChat(true);

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
                  <div className="d-flex justify-content-end w-100 text-break">
                    <p className="tChat1">{item}</p>
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
                  <div className="d-flex justify-content-start w-100 text-break">
                    <p className="uChat2">{item}</p>
                  </div>
                );
                SetMountChat((mountChat) => [...mountChat, newItem]);
              }
              SetChat(true);
            });
            aumentarCount();
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
          var newChat = parseInt(data.chat.length);
          if (newChat > countchat) {
            SetCountChat(newChat);
            reloadChat({ data: data });
          }
        })
        .catch((err) => {
          console.log(err);
        });
      return;
    } else if (fetchchat === false) {
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initUpdateChat]);

  function Close_ticket() {
    SetTicketWindow(false);
    SetFetchChat(false);
    count = 0;
    clearTimeout(timeoutId);
    return;
  }

  function ChangeTechnician(event) {
    setSelectedTech(event.target.value);

    return selectedTech;
  }

  function closeMessage() {
    SetMessageChat(false);
  }

  useEffect(() => {
    if (selectedTech.length > 1) {
      fetch("/helpdesk/ticket/" + ticketID, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        body: JSON.stringify({
          responsible_technician: selectedTech,
          technician: userData.name,
        }),
      })
        .then((response) => {
          response.json();

          if (response.status === 200) {
            return window.location.reload();
          } else if (response.status === 304) {
            SetTypeError("Sistema Anti-Idiota");
            SetMessageError(
              "Está tentando transferir o Chamado para si mesmo sendo que já assumiu o mesmo??"
            );
            return SetMessage(true);
          }
        })
        .catch((err) => {
          return console.log(err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTech]);

  function NewChat(event) {
    const newText = event.target.value;
    if (event.key === "Enter") {
      SetTextChat(newText);
      SendChat();
      event.preventDefault();
    } else {
      SetTextChat(newText);
      return;
    }

    return;
  }

  function SendChat() {
    const input = document.getElementById("input-chat");
    input.value = "";
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({
        technician: userData.name,
        chat: textChat,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return reloadChat({ data: data });
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function reloadChat({ data }) {
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
          item = item.replace("System:", "").replace("[", "").replace("]", "");
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
            <div className="d-flex justify-content-end w-100 text-break">
              <p className="tChat1">{item}</p>
            </div>
          );
          SetMountChat((mountChat) => [...mountChat, newItem]);
        }
        if (item.includes("User")) {
          item = item.replace("User:", "").replace("[", "").replace("]", "");
          const newItem = (
            <div className="d-flex justify-content-start w-100 text-break">
              <p className="uChat2">{item}</p>
            </div>
          );
          SetMountChat((mountChat) => [...mountChat, newItem]);
        }
        SetChat(true);

        return mountChat;
      });
    }
  }

  function closeMessage2() {
    SetMessage(false);
  }

  function dropdown() {
    const btn = document.getElementById("myDropdown");

    return btn.classList.toggle("showDP");
  }

  window.onclick = function (event) {
    if (
      !event.target.matches(".dropbtn") &&
      !event.target.matches(".dropdown-content")
    ) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains("showDP")) {
          openDropdown.classList.remove("showDP");
        }
      }
    }
  };

  function enableProblem() {
    const select = document.getElementById("selectOcorrence");
    const option = select.options[select.selectedIndex].value;

    console.log(option);

    if (option === "infra") {
      SetFakeSelect(false);
      SetProblemInfra(true);
      return;
    } else if (option === "system") {
      SetFakeSelect(false);
      SetProblemInfra(false);
      return;
    } else if (option === "null") {
      SetFakeSelect(true);
      SetProblemInfra(false);
      return;
    }
  }

  function equipamentForUser() {
    return SetEquipamentForUser(true);
  }

  function closeUpload() {
    SetEquipamentForUser(false);
  }

  return (
    <Div className="position-relative">
      {navbar && <Navbar Name={userData.name} JobTitle={userData.job_title} />}
      {message && (
        <div className="position-absolute top-0 start-50 translate-middle-x mt-5 z-3">
          <Message
            TypeError={typeError}
            MessageError={messageError}
            CloseMessage={closeMessage2}
          />
        </div>
      )}
      {dropdownBTN && (
        <DivDrop className="position-absolute top-0 start-0">
          <Dropdown>
            <DropdownButton
              onClick={dropdown}
              className="dropbtn"
            ></DropdownButton>
            <DropdownConten id="myDropdown" className="dropdown-content">
              <P1 className="d-block" onClick={equipamentForUser}>
                Adicionar Equipamento
              </P1>
            </DropdownConten>
          </Dropdown>
        </DivDrop>
      )}
      <DivDashPie>
        <DashBoardPie sector={"TI"} />
      </DivDashPie>
      <DivFilter>
        <div className="form-floating">
          <Input1 type="text" className="form-control" id="floatingInput" />
          <label htmlFor="floatingInput">Nome | Número | Problema...</label>
        </div>
        <Select1
          id="selectOcorrence"
          className="form-select"
          onChange={enableProblem}
        >
          <option value="null" selected disabled>
            Tipo de Ocorrência
          </option>
          <option value="infra">Infra</option>
          <option value="system">Sistema</option>
        </Select1>
        {fakeSelect && (
          <Select1 className="form-select" disabled>
            <option selected>Problema</option>
          </Select1>
        )}
        {problemInfra && (
          <Select1 id="" className="form-select">
            <option value="" selected disabled>
              Problema
            </option>
            <option value="">Backup/Restore</option>
            <option value="">E-mail</option>
            <option value="">Equipamento</option>
            <option value="">Gerenciamento de Usuario</option>
            <option value="">Internet</option>
            <option value="">Pasta</option>
          </Select1>
        )}
        <Select1 name="" id="" className="form-select">
          <option value="" selected disabled>
            Ordernar
          </option>
          <option value="">Data Recente</option>
          <option value="">Data Antiga</option>
        </Select1>
        <DivContainerImages className="d-flex">
          <DivImages className="btn">
            <IMGS1 src={IMG1} alt="" />
          </DivImages>
          <DivImages className="btn">
            <IMGS1 src={IMG2} alt="" />
          </DivImages>
          <DivImages className="btn">
            <IMGS1 src={IMG3} alt="" />
          </DivImages>
          <DivImages className="btn">
            <IMGS1 src={IMG4} alt="" />
          </DivImages>
        </DivContainerImages>
      </DivFilter>
      <div className="w-100 d-flex justify-content-center mt-5">
        {loading && <Loading />}
      </div>
      <div
        id="dashboard"
        className="container d-flex flex-wrap justify-content-around p-5 mt-3 w-100"
      ></div>
      {ticketWindow && (
        <TicketOpen className="position-fixed top-50 start-50 translate-middle">
          <CloseBTN
            onClick={Close_ticket}
            className="position-absolute top-0 end-0"
          >
            <Close src={CloseIMG} alt="" />
          </CloseBTN>
          {loading && <Loading />}
          <div className="overflow-hidden">
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
                    className="form-control h-100 fs-5"
                    type="text"
                    onKeyDown={NewChat}
                    id="input-chat"
                  />
                </div>
                <div>
                  <BtnChat
                    className="btn"
                    type="submit"
                    onClick={SendChat}
                  ></BtnChat>
                </div>
              </div>
            )}
          </div>
        </TicketOpen>
      )}
      {equipamentforuser && (
        <Registration
          token={token}
          equipamentforuser={equipamentforuser}
          CloseFunct={closeUpload}
        />
      )}
    </Div>
  );
}
