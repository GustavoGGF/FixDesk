import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Loading from "../components/loading";
import {
  Div,
  TicketOpen,
  Close,
  CloseBTN,
  DivChat,
  BtnChat,
  IMGFiles,
  ImageOpen,
  DivImageOpen,
  BtnOpen,
  ImgSelectView,
  DivSelectView,
  PSelectView,
  DivCard,
  H5Card,
  SpanCard,
  DivList,
  SpanList,
  PQuantity,
  IMGFiles2,
  DivAlocate,
  Calendar,
  DivINp,
} from "../styles/historyStyle";
import {
  DivFilter,
  Input1,
  Select1,
  DivContainerImages,
  DivImages,
  IMGS1,
} from "../styles/dashboardTIStyle";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import Message from "../components/message";
import CloseIMG from "../images/components/close.png";
import IMG1 from "../images/dashboard_TI/quantity_1.png";
import IMG2 from "../images/dashboard_TI/quantity_2.png";
import IMG3 from "../images/dashboard_TI/quantity_3.png";
import IMG4 from "../images/dashboard_TI/quantity_4.png";
import List from "../images/components/lista-de-itens.png";
import Card from "../images/components/identificacao.png";

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
  const [fetchchat, SetFetchChat] = useState(false);
  const [countchat, SetCountChat] = useState();
  const [initUpdateChat, SetInitUpdateChat] = useState();
  const [fileticket, SetFileTicket] = useState();
  const [imageurl, SetImageUrl] = useState();
  const [imageopen, SetImageOpen] = useState(false);
  const [fakeSelect, SetFakeSelect] = useState(true);
  const [problemInfra, SetProblemInfra] = useState(false);
  const [ticketsDash, SetTicketsDash] = useState([]);
  const [countTicket, SetCountTicket] = useState(0);
  const [orderby, SetOrderBy] = useState("");
  const [imageEquipament, SetImageEquipament] = useState();
  const [equipamentLocate, SetEquipamentLocate] = useState("");
  const [daysLocated, SetDaysLocated] = useState();
  const [namenewuser, SetNameNewUser] = useState("");
  const [sectornewuser, SetSectorNewUser] = useState("");
  const [wherefrom, SetWhereFrom] = useState("");
  const [machinenewuser, SetMachineNewUser] = useState();
  const [companynewuser, SetCompanyNewUser] = useState("");
  const [softwarenewuser, SetSoftwareNewUser] = useState("");
  const [costcenter, SetCostCenter] = useState("");
  const [jobtitlenewuser, SetJobTitleNewUser] = useState("");
  const [startworknewuser, SetStartWorkNewUser] = useState();
  const [copyprofilenewuser, SetCopyProfileNewUser] = useState("");

  let count = 0;
  let timeoutId;
  let daysLCT = [];

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
        SetCountTicket(10);
        SetOrderBy("-id");
        const btn = document.getElementById("thenView");
        btn.style.backgroundColor = "#00B4D8";
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

  function openImage() {
    SetImageOpen(true);
  }

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
        SetNameNewUser(data.name_new_user);
        SetSectorNewUser(data.sector_new_user);
        SetWhereFrom(data.where_from);
        SetMachineNewUser(data.machine_new_user);
        SetCompanyNewUser(data.company_new_user);
        SetSoftwareNewUser(data.software_new_user);
        SetCostCenter(data.cost_center);
        SetJobTitleNewUser(data.job_title_new_user);
        var nwdate = new Date(data.start_work_new_user);
        SetStartWorkNewUser(nwdate);
        SetCopyProfileNewUser(data.copy_profile_new_user);

        if (data.equipament["image"] !== undefined) {
          const Div = (
            <DivAlocate className="d-flex flex-column w-100 align-items-center">
              <p className="text-center">Modelo: {data.equipament["model"]}</p>
              <IMGFiles2
                src={`data:image/jpeg;base64,${data.equipament["image"]}`}
                onClick={openImage}
                alt=""
              />
            </DivAlocate>
          );

          SetImageEquipament(Div);
          SetEquipamentLocate(data.equipament["company"]);

          for (let NWdate of data.days_alocated) {
            var date = new Date(NWdate);
            daysLCT.push(date);
          }

          SetDaysLocated(daysLCT);

          const calendar = document.getElementById("calendarALT");
          calendar.classList.add("AdjustWid");
        }

        SetImageUrl(`data:image/jpeg;base64,${data.file}`);

        if (data.file !== null) {
          const Div = (
            <IMGFiles
              src={`data:image/jpeg;base64,${data.file}`}
              onClick={openImage}
              alt=""
            />
          );

          SetFileTicket(Div);
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
          });
          aumentarCount();
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

  async function Close_ticket() {
    SetTicketWindow(false);
    SetFetchChat(false);
    SetImageUrl("");
    SetFileTicket("");
    SetImageEquipament();
    count = 0;
    clearTimeout(timeoutId);
    daysLCT = [];
    return;
  }

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

  function closeMessage2() {
    return SetMessageChat(false);
  }

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
        User: Data.name,
        chat: textChat,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        reloadChat({ data: data });
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  async function reloadChat({ data }) {
    if (
      data.chat !== null &&
      data.chat !== undefined &&
      data.chat !== "undefined"
    ) {
      SetMountChat([]);
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
            <div className="d-flex justify-content-start w-100 text-break">
              <p className="tChat2">{item}</p>
            </div>
          );
          SetMountChat((mountChat) => [...mountChat, newItem]);
        }
        if (item.includes("User")) {
          item = item.replace("User:", "").replace("[", "").replace("]", "");
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
  }

  function imageclose() {
    SetImageOpen(false);
  }

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

  function moreTickets() {
    console.log(countTicket);
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
        console.log(data.count);
        SetCountTicket(data.count);
        SetTickets(data.tickets);
        return countTicket;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function getTicketFilter({ id, quantity }) {
    SetTickets([]);
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

    fetch("/helpdesk/getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Quantity-tickets": quantity,
        "Order-by": orderby,
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

  function getTicketFilterOrderTime({ order }) {
    SetTickets([]);
    fetch("/helpdesk/getTicketFilter/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Data-User": Data.name,
        "Quantity-tickets": countTicket,
        "Order-By": order,
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
        <Select1
          name=""
          id="select-order"
          className="form-select"
          onChange={selectOrder}
        >
          <option value="none" disabled>
            Ordernar
          </option>
          <option selected value="recent">
            Data Recente
          </option>
          <option value="ancient">Data Antiga</option>
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
                hidden={ticketMAIL.length > 1 ? false : true}
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
                value={"Nome: " + namenewuser}
                className="form-control"
                disabled
                hidden={namenewuser.length > 1 ? false : true}
              />
              <input
                type="text"
                value={"Setor: " + sectornewuser}
                className="form-control"
                disabled
                hidden={namenewuser.length > 1 ? false : true}
              />
              <input
                type="text"
                value={"Remanejamento: " + wherefrom}
                className="form-control"
                disabled
                hidden={namenewuser.length > 1 ? false : true}
              />
              <input
                type="text"
                value={!machinenewuser ? "Necessita-se de máquina" : ""}
                className="form-control"
                disabled
                hidden={machinenewuser ? true : false}
              />
              <input
                type="text"
                value={"Filial: " + companynewuser}
                className="form-control"
                disabled
                hidden={namenewuser.length > 1 ? false : true}
              />
              <input
                type="text"
                value={"Softwares Necessisarios: " + softwarenewuser}
                className="form-control"
                disabled
                hidden={softwarenewuser.length > 1 ? false : true}
              />
              <input
                type="text"
                value={"Centro de custo: " + costcenter}
                className="form-control"
                disabled
                hidden={namenewuser.length > 1 ? false : true}
              />
              <input
                type="text"
                value={"Cargo: " + jobtitlenewuser}
                className="form-control"
                disabled
                hidden={namenewuser.length > 1 ? false : true}
              />
              <input
                type="text"
                value={"Centro de custo: " + costcenter}
                className="form-control"
                disabled
                hidden={namenewuser.length > 1 ? false : true}
              />
              <DayPicker
                id="calendarALT"
                fixedWeeks
                showOutsideDays
                selected={startworknewuser}
                className="cald"
                mode="single"
              />
              <input
                type="text"
                value={"Copiar usuario de: " + copyprofilenewuser}
                className="form-control"
                disabled
                hidden={copyprofilenewuser.length > 1 ? false : true}
              />
              <DivINp hidden={imageEquipament === undefined}>
                {imageEquipament}
                <DivAlocate className="d-flex flex-column">
                  <p className="text-center">Unidade: {equipamentLocate}</p>
                </DivAlocate>
                <Calendar className="d-flex flex-column">
                  <p className="text-center">Data de alocação</p>
                  <div>
                    <DayPicker
                      id="calendarALT"
                      fixedWeeks
                      showOutsideDays
                      selected={daysLocated}
                      mode="multiple"
                    />
                  </div>
                </Calendar>
              </DivINp>
              <input
                type="text"
                value={
                  ticketOBSERVATION
                    ? "Observação: " + ticketOBSERVATION
                    : "Observação: "
                }
                className="form-control"
                disabled
                hidden={ticketOBSERVATION.length > 1 ? false : true}
              />
              <input
                type="text"
                value={"tempo de vida do chamado: " + lifeTime + " dias"}
                className="form-control"
                disabled
              />
              <div className="w-100 d-flex">{fileticket}</div>
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
      {imageopen && (
        <DivImageOpen className="position-fixed top-50 start-50 translate-middle">
          <div className="w-100 text-sm-end">
            <BtnOpen onClick={imageclose}>
              <Close src={CloseIMG} alt="" />
            </BtnOpen>
          </div>
          <ImageOpen src={imageurl} alt="" />
        </DivImageOpen>
      )}
    </Div>
  );
}
