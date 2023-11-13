/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import {
  Div,
  DropdownConten,
  Dropdown,
  DropdownButton,
  DivDrop,
  P1,
} from "../styles/dashboardTIStyle";
import Loading from "../components/loading";
import DashBoardPie from "../components/dashboardPie";
import {
  TicketOpen,
  CloseBTN,
  Close,
  DivChat,
  BtnChat,
  PSelectView,
  PQuantity,
  DivSelectView,
  DivCard,
  H5Card,
  SpanCard,
  DivList,
  SpanList,
  ImgSelectView,
  DivFilter,
  Input1,
  Select1,
  DivContainerImages,
  DivImages,
  IMGS1,
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
import List from "../images/components/lista-de-itens.png";
import Card from "../images/components/identificacao.png";
import DashboardBar from "../components/dashboardBar.jsx";

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
  const [problemSyst, SetProblemSyst] = useState(false);
  const [orderby, SetOrderBy] = useState(null);
  const [countTicket, SetCountTicket] = useState(0);
  const [loadingDash, SetLoadingDash] = useState(true);
  const [problemTicket, SetProblemTicket] = useState(null);
  const [ticketsDash, SetTicketsDash] = useState([]);
  const [sectorTicket, SetSectorTicket] = useState(null);
  const [ticketOpen, SetTicketOpen] = useState();

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
          SetCountTicket(10);
          SetOrderBy("-id");
          const btn = document.getElementById("thenView");
          btn.style.backgroundColor = "#00B4D8";
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
      const selectView = localStorage.getItem("selectView");
      if (selectView === null) {
        localStorage.setItem("selectView", "card");
        viewCard();
      } else if (selectView === "card") {
        viewCard();
      } else if (selectView === "list") {
        listCard();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets]);

  function viewCard() {
    SetTicketsDash([]);
    SetLoading(false);
    SetNavbar(true);

    localStorage.setItem("selectView", "card");

    const btn = document.getElementById("selectView-Card");
    btn.style.backgroundColor = "#00B4D8";

    const btn2 = document.getElementById("selectView-List");
    btn2.style.backgroundColor = "transparent";

    tickets.forEach((ticket) => {
      var date = new Date(ticket["start_date"]);

      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var newDate = day + "-" + month + "-" + year;
      const Div = (
        <DivCard
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

      SetTicketsDash((ticketsDash) => [...ticketsDash, Div]);
      const dash = document.getElementById("dashboard");
      dash.classList.add("dashCard");

      SetLoadingDash(false);
      return ticketsDash;
    });
  }

  function listCard() {
    SetTicketsDash([]);
    SetNavbar(true);
    SetLoading(false);

    localStorage.setItem("selectView", "list");

    const btn = document.getElementById("selectView-List");
    btn.style.backgroundColor = "#00B4D8";

    const btn2 = document.getElementById("selectView-Card");
    btn2.style.backgroundColor = "transparent";

    tickets.forEach((ticket) => {
      var date = new Date(ticket["start_date"]);

      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var newDate = day + "-" + month + "-" + year;
      const Div = (
        <DivList
          onClick={() => {
            helpdeskPage({ id: ticket["id"] });
          }}
        >
          <H5Card>chamado {ticket["id"]}</H5Card>
          <SpanList>{ticket["ticketRequester"]}</SpanList>
          <SpanList>Ocorrência: {ticket["occurrence"]}</SpanList>
          <SpanList>Problema: {ticket["problemn"]}</SpanList>
          <SpanList>{newDate}</SpanList>
        </DivList>
      );

      SetTicketsDash((ticketsDash) => [...ticketsDash, Div]);
      const dash = document.getElementById("dashboard");
      dash.classList.add("dashCard");

      SetLoadingDash(false);
      return ticketsDash;
    });
  }

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
        SetTicketOpen(data.open);

        var name_verify = userData.name;

        if (name_verify.includes("ADM")) {
          name_verify = name_verify.replace("ADM", "").trim();
        }

        if (data.responsible_technician === name_verify) {
          if (!data.open) {
            const chatDiv = document.getElementById("chatDiv");
            chatDiv.style.background = "#e9ecef";
            SetChat(false);
            SetTypeError("Permissão Negada");
            SetMessageError(
              "Reabra o Chamado para poder ver com mais detalhes"
            );
            SetMessageChat(true);
            return;
          }
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

    if (option === "infra") {
      SetFakeSelect(false);
      SetProblemInfra(true);
      SetProblemSyst(false);
      SetProblemTicket(null);
      SetSectorTicket("Infraestrutura");
      return getTicketFilterSector({ sector: "Infraestrutura" });
    } else if (option === "system") {
      SetFakeSelect(false);
      SetProblemInfra(false);
      SetProblemSyst(true);
      SetProblemTicket(null);
      SetSectorTicket("Sistema");
      return getTicketFilterSector({ sector: "Sistema" });
    } else if (option === "null") {
      SetFakeSelect(true);
      SetProblemInfra(false);
      SetProblemSyst(false);
      SetProblemTicket(null);
      return;
    } else if (option === "all") {
      SetFakeSelect(true);
      SetProblemInfra(false);
      SetProblemSyst(false);
      SetSectorTicket("all");
      SetProblemTicket(null);
      return getTicketFilterSector({ sector: "all" });
    }
  }

  function getTicketFilterSector({ sector }) {
    SetTickets([]);
    SetTicketsDash([]);
    SetLoadingDash(true);

    fetch("getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Quantity-tickets": countTicket,
        "Order-by": orderby,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sector,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        SetLoadingDash(false);
        return SetTickets(data.tickets);
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function equipamentForUser() {
    return SetEquipamentForUser(true);
  }

  function closeUpload() {
    SetEquipamentForUser(false);
  }

  function getTicketKey(event) {
    const newText = event.target.value;

    const select1 = document.getElementById("selectOcorrence");
    select1.value = null;

    SetProblemSyst(false);
    SetProblemInfra(false);
    SetFakeSelect(true);

    fetch("getTicketFilterWords/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Word-Filter": newText,
        "Order-By": orderby,
        "Quantity-tickets": countTicket,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        SetLoadingDash(false);
        return SetTickets(data.tickets);
      })
      .catch((err) => {
        return console.log(err);
      });

    return;
  }

  function changeProblemn() {
    const select = document.getElementById("selectBo");
    const option = select.options[select.selectedIndex].value;

    if (option === "backup") {
      SetProblemTicket("Backup");
      return getTicketFilterProblemn({ problemn: "Backup" });
    } else if (option === "mail") {
      SetProblemTicket("E-mail");
      return getTicketFilterProblemn({ problemn: "E-mail" });
    } else if (option === "equipamento") {
      SetProblemTicket("Equipamento");
      return getTicketFilterProblemn({ problemn: "Equipamento" });
    } else if (option === "user") {
      SetProblemTicket("Gerenciamento de Usuario");
      return getTicketFilterProblemn({ problemn: "Gerenciamento de Usuario" });
    } else if (option === "internet") {
      SetProblemTicket("Internet");
      return getTicketFilterProblemn({ problemn: "Internet" });
    } else if (option === "permissao") {
      SetProblemTicket("Permissão");
      return getTicketFilterProblemn({ problemn: "Permissão" });
    } else if (option === "all") {
      SetProblemTicket("all");
      return getTicketFilterProblemn({ problemn: "all" });
    } else if (option === "sap") {
      SetProblemTicket("SAP");
      return getTicketFilterProblemn({ problemn: "SAP" });
    } else if (option === "mbi") {
      SetProblemTicket("MBI");
      return getTicketFilterProblemn({ problemn: "MBI" });
    } else if (option === "synchro") {
      SetProblemTicket("Synchro");
      return getTicketFilterProblemn({ problemn: "Synchro" });
    } else if (option === "office") {
      SetProblemTicket("Office");
      return getTicketFilterProblemn({ problemn: "Office" });
    } else if (option === "eng") {
      SetProblemTicket("Softwares de Eng");
      return getTicketFilterProblemn({ problemn: "Softwares de Eng" });
    }
  }

  function getTicketFilterProblemn({ problemn }) {
    SetTickets([]);
    SetTicketsDash([]);
    SetLoadingDash(true);

    fetch("getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Quantity-tickets": countTicket,
        "Order-by": orderby,
        "Problemn-Ticket": problemn,
        "Sector-Ticket": sectorTicket,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        SetLoadingDash(false);
        return SetTickets(data.tickets);
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function selectOrder() {
    SetTickets([]);
    SetTicketsDash([]);
    const select = document.getElementById("select-order");
    const option = select.options[select.selectedIndex].value;

    if (option === "recent") {
      getTicketFilterOrderTime({ order: "-id" });
      SetOrderBy("-id");
    } else if (option === "ancient") {
      getTicketFilterOrderTime({ order: "id" });
      SetOrderBy("id");
    }
  }

  function getTicketFilterOrderTime({ order }) {
    SetTickets([]);
    SetTicketsDash([]);
    fetch("getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Quantity-tickets": countTicket,
        "Order-By": order,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sectorTicket,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        SetLoadingDash(false);
        return SetTickets(data.tickets);
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function getTicketFilter({ id, quantity }) {
    SetTickets([]);
    SetTicketsDash([]);
    SetLoadingDash(true);
    const btn1 = document.getElementById("fiveView");
    btn1.style.backgroundColor = "transparent";

    const btn2 = document.getElementById("thenView");
    btn2.style.backgroundColor = "transparent";

    const btn3 = document.getElementById("fiftyView");
    btn3.style.backgroundColor = "transparent";

    const btn4 = document.getElementById("allView");
    btn4.style.backgroundColor = "transparent";
    console.log(id);

    const btn5 = document.getElementById(id);
    btn5.style.backgroundColor = "#00B4D8";

    fetch("getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Quantity-tickets": quantity,
        "Order-by": orderby,
        "Problemn-Ticket": problemTicket,
        "Sector-Ticket": sectorTicket,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        SetLoadingDash(false);
        return SetTickets(data.tickets);
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function moreTickets() {
    fetch("moreTicket/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Ticket-Current": countTicket,
        "ORDER-BY": orderby,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data.count);
        SetCountTicket(data.count);
        SetTickets(data.tickets);
        return countTicket;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function closeTicket() {
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({
        technician: userData.name,
        status: "close",
      }),
    })
      .then((response) => {
        if (response.status === 304) {
          SetMessage(true);
          SetMessageError("Ticket não percetence a você");
          SetTypeError("Permissão Negada");
        }
        return response.json();
      })
      .then((data) => {
        return window.location.reload();
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function reopenTicket() {
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({
        technician: userData.name,
        status: "open",
      }),
    })
      .then((response) => {
        if (response.status === 304) {
          SetMessage(true);
          SetMessageError("Ticket não percetence a você");
          SetTypeError("Permissão Negada");
        }
        return response.json();
      })
      .then((data) => {
        return window.location.reload();
      })
      .catch((err) => {
        return console.log(err);
      });
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
      <div className="d-flex justify-content-center w-100">
        <DashBoardPie sector={"TI"} />
      </div>
      <div className="d-flex justify-content-center">
        <DashboardBar />
      </div>
      <DivFilter>
        <div className="form-floating">
          <Input1
            type="text"
            className="form-control"
            id="floatingInput"
            onKeyDown={getTicketKey}
          />
          <label htmlFor="floatingInput">Ocorrência | Problema | Data...</label>
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
        <Select1
          name=""
          id="select-order"
          className="form-select"
          onChange={selectOrder}
        >
          <option value="none" disabled>
            Ordernar
          </option>
          <option value="recent">Data Recente</option>
          <option selected value="ancient">
            Data Antiga
          </option>
        </Select1>
        <DivContainerImages className="d-flex">
          <PSelectView className="position-absolute top-0 start-0 translate-middle">
            Quantidade
          </PSelectView>
          <DivImages
            className="btn"
            id="fiveView"
            onClick={() => {
              SetCountTicket(5);
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
              SetCountTicket(10);
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
              SetCountTicket(50);
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
              SetCountTicket(100000);
              getTicketFilter({ id: "allView", quantity: 100000 });
            }}
          >
            <IMGS1 src={IMG4} alt="" />
            <PQuantity>todos</PQuantity>
          </DivImages>
        </DivContainerImages>
        <DivSelectView>
          <PSelectView className="position-absolute top-0 start-0 translate-middle">
            Modo de Visualização
          </PSelectView>
          <button className="btn" id="selectView-List" onClick={listCard}>
            <ImgSelectView src={List} className="img-fluid" alt="" />
          </button>
          <button className="btn" id="selectView-Card" onClick={viewCard}>
            <ImgSelectView src={Card} clasName="img-fluid" alt="" />
          </button>
        </DivSelectView>
      </DivFilter>
      <section id="dashboard">
        {loadingDash && (
          <div className="position-absolute top-50 start-50 translate-middle">
            <Loading />
          </div>
        )}
        {ticketsDash}
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
                hidden={ticketOpen === true ? false : true}
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
            <button
              className="btn btn-success w-100"
              onClick={() => {
                closeTicket();
              }}
              hidden={ticketOpen === true ? false : true}
            >
              Finalizar
            </button>
            <button
              className="btn btn-info w-100"
              onClick={() => {
                reopenTicket();
              }}
              hidden={ticketOpen}
            >
              Reabrir
            </button>
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
      <div className="w-100 text-center">
        <button className="btn btn-info mb-5" onClick={moreTickets}>
          Carregar Mais
        </button>
      </div>
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
