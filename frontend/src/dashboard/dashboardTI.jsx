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
  DivFilter,
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
  Input1,
  Select1,
  DivContainerImages,
  DivImages,
  IMGS1,
  Button1,
  Button2,
  DivOnBoardFile,
  IMGFiles,
  ImageFile,
  DivFile,
  DivImageOpen,
  BtnOpen,
  ImageOpen,
  BtnChat2,
  InputFile,
  DivNewFiles,
  DivHR,
  PNWFile,
  AdjustListFiles,
  ImgBTNCls,
  BtnNF,
} from "../styles/historyStyle";
import { DivNameFile, BtnFile, ImgFile } from "../styles/helpdeskStyle.js";
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
import Mail from "../images/components/mail.png";
import XLS from "../images/components/xlsx.png";
import ZIP from "../images/components/zip.jpg";
import TXT from "../images/components/arquivo-txt.png";
import WORD from "../images/components/palavra.png";
import PDF from "../images/components/pdf.png";
import Download from "../images/components/download.png";
import Exclude from "../images/components/close.png";
import DownTick from "../images/components/attachment.png";

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
  const [status, SetStatus] = useState("open");
  const [btnmore, SetBtnMore] = useState(true);
  const [fileticket, SetFileTicket] = useState([]);
  const [imageurl, SetImageUrl] = useState();
  const [imageopen, SetImageOpen] = useState(false);
  const [uploadNewFiles, SetUploadNewFiles] = useState([]);
  const [newFiles, SetNewFiles] = useState(false);
  const [nameNWFiles, SetNameNWFiles] = useState();
  const [classBlur, SetClassBlur] = useState("");

  let count = 0;
  let timeoutId;
  const UpNwfile = [];
  let colorBorder = "";

  function aumentarCount() {
    count++;

    SetInitUpdateChat(count);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    return (timeoutId = setTimeout(aumentarCount, 10000)); // Chama a função novamente após 5 segundos
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
        return console.log(err);
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
          return console.log(err);
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
        return viewCard();
      } else if (selectView === "card") {
        return viewCard();
      } else if (selectView === "list") {
        return listCard();
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
      var newDate = day + "/" + month + "/" + year;

      if (ticket["open"] === false) {
        colorBorder = "ticektClose";
      } else if (
        ticket["open"] === true &&
        ticket["responsible_technician"] === null
      ) {
        const currentDate = new Date();

        const diferenceMilisecond = currentDate - date;

        const diferenceDays = diferenceMilisecond / (1000 * 60 * 60 * 24);

        if (diferenceDays >= 7) {
          colorBorder = "ticketUrgent";
        } else {
          colorBorder = "ticektOpenNotView";
        }
      } else if (
        ticket["open"] === true &&
        ticket["responsible_technician"] !== null
      ) {
        colorBorder = "ticektOpenInView";
      }

      const Div = (
        <DivCard
          className={`animate__animated animate__zoomInDown ${colorBorder}`}
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
      var newDate = day + "/" + month + "/" + year;

      if (ticket["open"] === false) {
        colorBorder = "ticektCloseList";
      } else if (
        ticket["open"] === true &&
        ticket["responsible_technician"] === null
      ) {
        const currentDate = new Date();

        const diferenceMilisecond = currentDate - date;

        const diferenceDays = diferenceMilisecond / (1000 * 60 * 60 * 24);

        if (diferenceDays >= 7) {
          colorBorder = "ticketUrgentList";
        } else {
          colorBorder = "ticektOpenNotViewList";
        }
      } else if (
        ticket["open"] === true &&
        ticket["responsible_technician"] !== null
      ) {
        colorBorder = "ticektOpenInViewList";
      }

      const Div = (
        <DivList
          className={`animate__animated animate__backInUp ${colorBorder}`}
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

  function openImage() {
    return SetImageOpen(true);
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
        SetClassBlur("addBlur");
        const dash = document.getElementById("dashboard");
        dash.style.filter = "blur(3px)";
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

        if (data.file.length >= 1) {
          const files = data.file;
          for (let i = 0; i < files.length; i++) {
            var file = files[i];
            if (file === "mail") {
              const contentFileMail = data.content_file[i];
              const nameFileMail = data.name_file[i];
              const Div = (
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
                </DivOnBoardFile>
              );
              SetFileTicket((fileticket) => [...fileticket, Div]);
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
                </DivOnBoardFile>
              );
              SetFileTicket((fileticket) => [...fileticket, Div]);
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
                </DivOnBoardFile>
              );
              SetFileTicket((fileticket) => [...fileticket, Div]);
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
                </DivOnBoardFile>
              );
              SetFileTicket((fileticket) => [...fileticket, Div]);
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
                  />
                </DivOnBoardFile>
              );
              SetFileTicket((fileticket) => [...fileticket, Div]);
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
                </DivOnBoardFile>
              );
              SetFileTicket((fileticket) => [...fileticket, Div]);
            } else if (typeof file === "object") {
              const image = file.image;
              const Div = (
                <DivOnBoardFile className="position-relative">
                  <IMGFiles
                    src={`data:image/jpeg;base64,${file.image}`}
                    onClick={() => {
                      SetImageUrl(`data:image/jpeg;base64,${image}`);
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
                </DivOnBoardFile>
              );
              SetFileTicket((fileticket) => [...fileticket, Div]);
            }
          }
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

  function imageclose() {
    return SetImageOpen(false);
  }

  function downloadMail({ content, data, sliceSize = 512 }) {
    const cleanBase64 = content.replace(/[^A-Za-z0-9+/]/g, ""); // Remove caracteres inválidos

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
          return;
        })
        .catch((err) => {
          return console.log(err);
        });
      return;
    } else if (fetchchat === false) {
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initUpdateChat]);

  function Close_ticket() {
    SetClassBlur("");
    const dash = document.getElementById("dashboard");
    dash.style.filter = "blur(0)";
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
    return SetMessageChat(false);
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
      return;
    } else {
      SetTextChat(newText);
      return;
    }
  }

  function SendChat() {
    const input = document.getElementById("input-chat");
    input.value = "";
    if (textChat.length === 0) {
      return;
    }
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
    return SetMessage(false);
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
    return;
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
        "Status-Ticket": status,
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
    return SetEquipamentForUser(false);
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

  function ticketOpenStatus() {
    SetTickets();
    const btn = document.getElementById("btnopen");
    btn.classList.add("btn-success");
    const btn2 = document.getElementById("btnclose");
    btn2.classList.remove("btn-warning");
    const btn3 = document.getElementById("btnall");
    btn3.classList.remove("btn-info");

    fetch("getTicketFilterStatus/", {
      method: "GET",
      headers: {
        Accept: "application/json",
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
          SetMessage(true);
          SetTypeError("Falta de dados");
          SetMessageError("Nenhum ticket com esses Filtros");
          SetBtnMore(false);
          return;
        } else {
          SetBtnMore(true);
          SetLoadingDash(false);
          SetStatus("open");
          return SetTickets(data.tickets);
        }
      })
      .catch((err) => {
        return console.log(err);
      });

    return;
  }

  function ticketClose() {
    SetTickets([]);
    const btn = document.getElementById("btnopen");
    btn.classList.remove("btn-success");
    const btn2 = document.getElementById("btnclose");
    btn2.classList.add("btn-warning");
    const btn3 = document.getElementById("btnall");
    btn3.classList.remove("btn-info");

    fetch("getTicketFilterStatus/", {
      method: "GET",
      headers: {
        Accept: "application/json",
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
          SetMessage(true);
          SetTypeError("Falta de dados");
          SetMessageError("Nenhum ticket com esses Filtros");
          SetBtnMore(false);
          return;
        } else {
          SetBtnMore(true);
          SetLoadingDash(false);
          SetStatus("close");
          return SetTickets(data.tickets);
        }
      })
      .catch((err) => {
        return console.log(err);
      });

    return;
  }

  function statusTicketAll() {
    SetTickets([]);
    const btn = document.getElementById("btnopen");
    btn.classList.remove("btn-success");
    const btn2 = document.getElementById("btnclose");
    btn2.classList.remove("btn-warning");
    const btn3 = document.getElementById("btnall");
    btn3.classList.add("btn-info");

    fetch("getTicketFilterStatus/", {
      method: "GET",
      headers: {
        Accept: "application/json",
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
          SetMessage(true);
          SetTypeError("Falta de dados");
          SetMessageError("Nenhum ticket com esses Filtros");
          SetBtnMore(false);
          return;
        } else {
          SetBtnMore(true);
          SetLoadingDash(false);
          SetStatus("all");
          return SetTickets(data.tickets);
        }
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
        "Status-Ticket": status,
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
      return;
    } else if (option === "ancient") {
      getTicketFilterOrderTime({ order: "id" });
      SetOrderBy("id");
      return;
    }
    return;
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
        "Status-Ticket": status,
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
        "Status-Ticket": status,
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
        SetCountTicket(data.count);
        SetTickets(data.tickets);
        return countTicket;
      })
      .catch((err) => {
        return console.log(err);
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
          return;
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
          return;
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

  function UploadNewFiles(evt) {
    UpNwfile.push(evt.target.files);
    for (let i = 0; i < UpNwfile.length; i++) {
      SetUploadNewFiles((uploadNewFiles) => [...uploadNewFiles, UpNwfile[i]]);
    }
    return;
  }

  useEffect(() => {
    let paragraphs = [];
    if (uploadNewFiles.length >= 1) {
      const fileNM = uploadNewFiles[0];

      for (let i = 0; i < fileNM.length; i++) {
        const file = fileNM[i];

        paragraphs.push(
          <div className="d-flex w-100 justify-content-center">
            <DivNameFile key={i}>
              <PNWFile>{file.name}</PNWFile>
            </DivNameFile>
            <div>
              <BtnFile
                type="button"
                onClick={() => {
                  const newArray = Array.from(fileNM);
                  newArray.splice(i, 1);

                  const dataTransfer = new DataTransfer();

                  newArray.forEach((file) => {
                    dataTransfer.items.add(file);
                  });

                  const newFileList = dataTransfer.files;

                  SetUploadNewFiles([newFileList]);
                }}
              >
                <ImgFile src={Exclude} alt="Excluir arquivo" />
              </BtnFile>
            </div>
          </div>
        );
      }

      SetNameNWFiles(paragraphs);

      SetNewFiles(true);
      return;
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadNewFiles]);

  function closeNWFiles() {
    SetUploadNewFiles("");
    SetNewFiles(false);
    return;
  }

  function submitNewFiles() {
    const formData = new FormData();
    for (let i = 0; i < uploadNewFiles[0].length; i++) {
      const file = uploadNewFiles[0][i];
      formData.append("files", file);
    }
    fetch("upload-new-files/" + ticketID, {
      method: "POST",
      headers: {
        "X-CSRFToken": token,
      },
      body: formData,
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return window.location.reload();
      })
      .catch((err) => {
        return console.log(err);
      });
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
        return console.log(err);
      });
  }

  return (
    <Div className="position-relative">
      {navbar && (
        <div className={classBlur}>
          <Navbar Name={userData.name} JobTitle={userData.job_title} />
        </div>
      )}
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
        <DivDrop className={`position-absolute top-0 start-0 ${classBlur}`}>
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
      <div
        className={`d-flex flex-column justify-content-center w-100 ${classBlur}`}
      >
        <div className="d-flex justify-content-center w-100">
          <DashBoardPie sector={"TI"} />
        </div>
        <div className="d-flex justify-content-center">
          <DashboardBar />
        </div>
      </div>
      <DivFilter className={classBlur}>
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
        <DivSelectView className="mt-3">
          <PSelectView className="position-absolute top-0 start-0 translate-middle">
            Status
          </PSelectView>
          <Button1
            className="btn btn-success"
            id="btnopen"
            onClick={() => {
              ticketOpenStatus();
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
          <div className="w-100 d-flex">
            <div className="d-flex justify-content-start w-100">
              <BtnNF onClick={downloadTicket}>
                <img src={DownTick} alt="download Ticket" />
              </BtnNF>
            </div>
            <div className="w-100 justify-content-center d-flex">
              <h3 className="text-center text-uppercase fw-bold text-danger mt-3">
                chamado {ticketID}
              </h3>
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
                    onKeyUp={NewChat}
                    id="input-chat"
                  />
                </div>
                <BtnChat2>
                  <InputFile
                    className="w-100"
                    type="file"
                    multiple
                    onInput={UploadNewFiles}
                  />
                </BtnChat2>
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
          {newFiles && (
            <DivNewFiles className="position-absolute top-50 start-50 translate-middle d-flex flex-column">
              <div className="w-100 d-flex">
                <div className="w-100 text-center mb-2">
                  <h3 className="text-light fw-bold">Arquivos</h3>
                </div>
                <div className="h-100 align-items-start justify-content-end d-flex">
                  <BtnNF
                    className="bg-transparent pe-auto"
                    onClick={closeNWFiles}
                  >
                    <ImgBTNCls src={Exclude} alt="Fechar" />
                  </BtnNF>
                </div>
              </div>
              <AdjustListFiles>{nameNWFiles}</AdjustListFiles>
              <div className="d-flex justify-content-end align-items-center flex-column">
                <DivHR></DivHR>
                <button
                  className="btn btn-success w-50 mt-2"
                  onClick={submitNewFiles}
                >
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
      {equipamentforuser && (
        <Registration
          token={token}
          equipamentforuser={equipamentforuser}
          CloseFunct={closeUpload}
        />
      )}
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
