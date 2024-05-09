/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useRef } from "react";
import { DayPicker } from "react-day-picker";
import ptBR from "date-fns/locale/pt";

import Navbar from "../components/navbar";
import {
  Div,
  DropdownConten,
  Dropdown,
  DropdownButton,
  DivDrop,
  P1,
  DivFilter,
  IMGConfig,
  DropBTN,
  DropContent2,
  DivModify,
  InputTicket,
  ZIndex,
  DivDetaisl,
  DivChatDetails,
  ImgSend,
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
  PBloq,
  DivINp,
  DivAlocate,
  IMGFiles2,
  Calendar,
  DivCal,
  DivFlex1,
  DivFlex2,
  PChatHourR,
  PChatHourL,
} from "../styles/historyStyle";
import { DropDown } from "../styles/navbarStyle.js";
import { DivNameFile, BtnFile, ImgFile, Select, TitlePage } from "../styles/helpdeskStyle.js";
import CloseIMG from "../images/components/close.png";
import Message from "../components/message";
import "../styles/bootstrap/css/bootstrap.css";
import "../styles/bootstrap/js/bootstrap";
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
import "react-day-picker/dist/style.css";
import Seeting from "../images/components/definicoes.png";
import Send from "../images/components/enviar.png";

export default function DashboardTI() {
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

  const [loading, setLoading] = useState(true);
  const [navbar, setNavbar] = useState(false);
  const [userData, setUserData] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [token, setToken] = useState("");
  const [ticketNAME, setTicketNAME] = useState("");
  const [ticketDEPARTMENT, setTicketDEPARTMENT] = useState("");
  const [ticketMAIL, setTicketMAIL] = useState("");
  const [ticketCOMPANY, setTicketCOMPANY] = useState("");
  const [ticketSECTOR, setTicketSECTOR] = useState("");
  const [ticketOCCURRENCE, setTicketOCCURRENCE] = useState("");
  const [ticketPROBLEMN, setTicketPROBLEMN] = useState("");
  const [ticketOBSERVATION, setTicketOBSERVATION] = useState("");
  const [lifeTime, setLifetime] = useState("");
  const [ticketResponsible_Technician, setTicketResponsible_Technician] = useState("");
  const [ticketWindow, setTicketWindow] = useState(false);
  const [ticketID, setTicketID] = useState("");
  const [mountChat, setMountChat] = useState([]);
  const [chat, setChat] = useState(true);
  const [selectedTech, setSelectedTech] = useState("");
  const [techs, setTechs] = useState([]);
  const [messageChat, setMessageChat] = useState(false);
  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [textChat, setTextChat] = useState("");
  const [message, setMessage] = useState(false);
  const [dropdownBTN, setDropDownBTN] = useState(false);
  const [fetchChat, setFetchChat] = useState(false);
  const [countChat, setCountChat] = useState();
  const [initUpdateChat, setInitUpdateChat] = useState();
  const [fakeSelect, setFakeSelect] = useState(true);
  const [problemInfra, setProblemInfra] = useState(false);
  const [equipamentforuser, setEquipamentForUser] = useState(false);
  const [problemSyst, setProblemSyst] = useState(false);
  const [orderby, setOrderBy] = useState(null);
  const [countTicket, setCountTicket] = useState(0);
  const [loadingDash, setLoadingDash] = useState(true);
  const [problemTicket, setProblemTicket] = useState(null);
  const [ticketsDash, setTicketsDash] = useState([]);
  const [sectorTicket, setSectorTicket] = useState(null);
  const [ticketOpen, setTicketOpen] = useState();
  const [status, setStatus] = useState("open");
  const [btnmore, setBtnMore] = useState(true);
  const [fileticket, setFileTicket] = useState([]);
  const [imageurl, setImageUrl] = useState();
  const [imageopen, setImageOpen] = useState(false);
  const [uploadNewFiles, setUploadNewFiles] = useState([]);
  const [newFiles, setNewFiles] = useState(false);
  const [nameNWFiles, setNameNWFiles] = useState();
  const [classBlur, setClassBlur] = useState("");
  const [namenewuser, setNameNewUser] = useState("");
  const [sectornewuser, setSectorNewUser] = useState("undefined");
  const [wherefrom, setWhereFrom] = useState("");
  const [machinenewuser, setMachineNewUser] = useState();
  const [companynewuser, setCompanyNewUser] = useState("");
  const [softwarenewuser, setSoftwareNewUser] = useState("");
  const [costcenter, setCostCenter] = useState("");
  const [jobtitlenewuser, setJobTitleNewUser] = useState("");
  const [startworknewuser, setStartWorkNewUser] = useState();
  const [copyprofilenewuser, setCopyProfileNewUser] = useState("");
  const [mailtranfer, setMailTranfer] = useState("");
  const [oldfile, setOldFiles] = useState("");
  const [imageEquipament, setImageEquipament] = useState();
  const [equipamentLocate, setEquipamentLocate] = useState("");
  const [daysLocated, setDaysLocated] = useState();
  const [theme, setTheme] = useState("");
  const [themeFilter, setThemeFilter] = useState("");
  const [themeCard, setThemeCard] = useState("");
  const [modifyTicket, setModifyTicket] = useState(false);
  const [infra, setInfra] = useState(false);
  const [system, setSystem] = useState(false);
  const [backup, setBackup] = useState(false);
  const [mail, setMail] = useState(false);
  const [equip, setEquip] = useState(false);
  const [internet, setInternet] = useState(false);
  const [folder, setFolder] = useState(false);
  const [sector, setsector] = useState("");
  const [sap, setSAP] = useState(false);
  const [mbi, setMBI] = useState(false);
  const [synch, setSynch] = useState(false);
  const [office, setOffice] = useState(false);
  const [eng, setEng] = useState(false);
  const [occurrence, setOccurrence] = useState("");
  const [problemn, setProblemn] = useState("");
  const [fake, setFake] = useState(true);
  const [OcurrenceFake, setOcurrenceFake] = useState(true);
  const [dataModify, setDataModify] = useState(true);
  const [techDetails, setTechDetails] = useState(false);
  const [detailsChat, setDetailsChat] = useState("");
  const [mountDetails, setMountDetails] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const inputRef = useRef(null);
  const sectionTicket = useRef(null);

  function ThemeBlack() {
    setThemeFilter("");
    setThemeCard("");
    setTheme("themeBlack");
  }

  function ThemeLight() {
    setThemeCard("themeCardLight");
    setThemeFilter("themeFilterLight");
    setTheme("themeLight");
  }

  let count = 0;
  let timeoutId;
  const UpNwfile = [];
  let colorBorder = "";
  let daysLCT = [];

  function aumentarCount() {
    count++;

    setInitUpdateChat(count);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    return (timeoutId = setTimeout(aumentarCount, 10000)); // Chama a função novamente após 10 segundos
  }

  useEffect(() => {
    const dataInfo = JSON.parse(localStorage.getItem("dataInfo"));
    setUserData(dataInfo.data);
    fetch("", {
      method: "POST",
      headers: { Accept: "application/json" },
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

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      setNavbar(true);
      setDropDownBTN(true);
      fetch("get_ticket_TI", {
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          setCountTicket(10);
          setOrderBy("-id");
          const btn = document.getElementById("thenView");
          btn.style.backgroundColor = "#00B4D8";
          setTickets(data.tickets);
        })
        .catch((err) => {
          setTypeError("FATAL ERROR");
          setMessageError(err);
          setMessage(true);
          return console.log(err);
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

  function viewCard() {
    // Limpar o estado e preparar o ambiente
    setTicketsDash([]);
    setLoading(false);
    setNavbar(true);

    // Definir o tipo de visualização como "card" no local storage
    localStorage.setItem("selectView", "card");

    // Estilizar os botões de seleção de visualização
    const btn = document.getElementById("selectView-Card");
    btn.style.backgroundColor = "#00B4D8";

    const btn2 = document.getElementById("selectView-List");
    btn2.style.backgroundColor = "transparent";

    sectionTicket.current.style.display = "flex";
    sectionTicket.current.style.justifyContent = "center";

    // Mapear os tickets para elementos de cartão
    tickets.forEach((ticket) => {
      // Calcular a data formatada
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

      // Determinar a classe de borda com base no estado do ticket
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
          key={ticket["id"]}
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

      setLoadingDash(false);
    });
  }

  function listCard() {
    // Limpar o estado e preparar o ambiente
    setTicketsDash([]);
    setNavbar(true);
    setLoading(false);

    // Definir o tipo de visualização como "list" no local storage
    localStorage.setItem("selectView", "list");

    // Estilizar os botões de seleção de visualização
    const btn = document.getElementById("selectView-List");
    btn.style.backgroundColor = "#00B4D8";

    const btn2 = document.getElementById("selectView-Card");
    btn2.style.backgroundColor = "transparent";

    sectionTicket.current.style.display = "block";
    sectionTicket.current.style.justifyContent = "center";

    // Mapear os tickets para elementos de lista
    tickets.forEach((ticket) => {
      // Calcular a data formatada
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

      // Determinar a classe de borda com base no estado do ticket
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
        <DivList
          key={ticket["id"]}
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

      setTicketsDash((ticketsDash) => [...ticketsDash, Div]);
      const dash = document.getElementById("dashboard");
      dash.classList.add("dashCard");

      setLoadingDash(false);
    });
  }

  function openImage() {
    setImageOpen(true);
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
        setClassBlur("addBlur");
        const dash = document.getElementById("dashboard");
        dash.style.filter = "blur(3px)";
        const data = dataBack.data[0];
        setSelectedTech("");
        setMessageChat(false);
        setMountChat([]);
        setFileTicket([]);
        const start_date = new Date(data.start_date);

        var CurrentDate = new Date();

        var calcDate = CurrentDate - start_date;

        var lifetime = Math.floor(calcDate / (1000 * 60 * 60 * 24));

        setTicketNAME(data.ticketRequester);
        setTicketDEPARTMENT(data.department);
        setTicketMAIL(data.mail);
        setTicketCOMPANY(data.company);
        setTicketSECTOR(data.sector);
        setTicketOCCURRENCE(data.occurrence);
        setTicketPROBLEMN(data.problemn);
        setTicketOBSERVATION(data.observation);
        setLifetime(lifetime);
        setTicketResponsible_Technician(data.responsible_technician);
        setTicketID(data.id);
        setTicketOpen(data.open);
        setNameNewUser(data.name_new_user);
        if (data.sector_new_user.length > 1) {
          setSectorNewUser(data.sector_new_user);
        } else {
          setSectorNewUser("undefined");
        }
        setWhereFrom(data.where_from);
        setMachineNewUser(data.machine_new_user);
        setCompanyNewUser(data.company_new_user);
        setSoftwareNewUser(data.software_new_user);
        setCostCenter(data.cost_center);
        setJobTitleNewUser(data.job_title_new_user);
        var nwdate = new Date(data.start_work_new_user);
        setStartWorkNewUser(nwdate);
        setCopyProfileNewUser(data.copy_profile_new_user);
        setMailTranfer(data.mail_tranfer);
        setOldFiles(data.old_files);

        if (data.equipament["image"] !== undefined) {
          const Div = (
            <DivAlocate className="d-flex flex-column w-100 align-items-center">
              <p className="text-center">Modelo: {data.equipament["model"]}</p>
              <IMGFiles2 src={`data:image/jpeg;base64,${data.equipament["image"]}`} onClick={openImage} alt="" />
            </DivAlocate>
          );

          setImageEquipament(Div);
          setEquipamentLocate(data.equipament["company"]);

          for (let NWdate of data.days_alocated) {
            var date = new Date(NWdate);
            daysLCT.push(date);
          }

          setDaysLocated(daysLCT);

          const calendar = document.getElementById("calendarALT");
          calendar.classList.add("AdjustWid");
        }

        var name_verify = userData.name;

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
                  <p className="text-center text-break">{nameFileMail}</p>
                </DivOnBoardFile>
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
                  />
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
              setFileTicket((fileticket) => [...fileticket, Div]);
            } else if (typeof file === "object") {
              const image = file.image;
              const nameImage = data.name_file[i];
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
                      link.download = nameImage;
                      link.click();
                      link.remove();
                    }}
                  />
                  <p className="text-center text-break">{nameImage}</p>;
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
          setDataModify(false);
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

  function imageclose() {
    setImageOpen(false);
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
      setMessageError(error);
      setTypeError("FATAL ERROR");
      setMessage(true);
      console.error("Erro ao converter para Blob:", error);
      return null;
    }
  }

  useEffect(() => {
    if (fetchChat === true) {
      fetch("/helpdesk/update_chat/" + ticketID, {
        method: "GET",
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
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

  function Close_ticket() {
    setClassBlur("");
    setModifyTicket(false);
    const dash = document.getElementById("dashboard");
    dash.style.filter = "blur(0)";
    setTicketWindow(false);
    setFetchChat(false);
    count = 0;
    clearTimeout(timeoutId);
    setTechDetails(false);
  }

  function ChangeTechnician(event) {
    setSelectedTech(event.target.value);
  }

  function closeMessage() {
    setModifyTicket(false);
    setMessageChat(false);
  }

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
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        body: JSON.stringify({
          responsible_technician: selectedTech,
          technician: userData.name,
          date: dataFormatada,
          hour: horaFormatada,
          mail: ticketMAIL,
        }),
      })
        .then((response) => {
          response.json();

          if (response.status === 200) {
            return window.location.reload();
          } else if (response.status === 304) {
            setTypeError("Operação Inválida");
            setMessageError("O Chamado Já está com você");
            return setMessage(true);
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

  function NewChat(event) {
    const newText = event.target.value;
    if (event.key === "Enter") {
      setTextChat(newText);
      SendChat();
      event.preventDefault();
    } else {
      setTextChat(newText);
    }
  }

  function NewChatDetails(event) {
    const newText = event.target.value;
    if (event.key === "Enter") {
      setDetailsChat(newText);
      SendDetails();
      event.preventDefault();
    } else {
      setDetailsChat(newText);
    }
  }

  function SendDetails() {
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

    inputRef.current.value = "";

    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": token, "Tech-Details": "ok" },
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

  function MountChatDetails(chat) {
    setTechDetails(true);
    setLoadingChat(true);
    if (chat !== null && chat !== undefined && chat !== "undefined") {
      const regex = /\[\[([^[\]]+?)\],\[([^[\]]+?)\],\[([^[\]]+?)\]\]/g;

      const chatValue = [];
      let match;

      while ((match = regex.exec(chat)) !== null) {
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
                var chat = item[1];
                var time = item[2];
                time = time.replace("Hours:", "").trim();

                return (
                  <div key={index}>
                    <DivFlex2 className="w-100 text-break position relative">
                      <div className="uChat2 position-relative">
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
        setLoadingChat(false);
        return groupedItems;
      };
      setMountDetails(renderGroupedItems());
    }
  }

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
        hours: horaFormatada,
        date: dataFormatada,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return reloadChat({ data: data });
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function reloadChat({ data }) {
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
                console.log(time);
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

      setMountChat(renderGroupedItems());

      setChat(true);
    }
  }

  function closeMessage2() {
    return setMessage(false);
  }

  function dropdown() {
    const btn = document.getElementById("myDropdown");

    return btn.classList.toggle("showDP");
  }

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

  function enableProblem() {
    const select = document.getElementById("selectOcorrence");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "null":
        setFakeSelect(true);
        setProblemInfra(false);
        setProblemSyst(false);
        setProblemTicket(null);
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

  function getTicketFilterSector({ sector }) {
    setTickets([]);
    setTicketsDash([]);
    setLoadingDash(true);

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
        setLoadingDash(false);
        setTickets(data.tickets);
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function equipamentForUser() {
    setEquipamentForUser(true);
  }

  function closeUpload() {
    setEquipamentForUser(false);
  }

  function getTicketKey(event) {
    const newText = event.target.value;

    const select1 = document.getElementById("selectOcorrence");
    select1.value = null;

    setProblemSyst(false);
    setProblemInfra(false);
    setFakeSelect(true);

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
        setLoadingDash(false);
        setTickets(data.tickets);
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function ticketOpenStatus() {
    setTickets([]);
    setTicketsDash([]);
    const btn = document.getElementById("btnopen");
    btn.classList.add("btn-open");
    const btn2 = document.getElementById("btnclose");
    btn2.classList.remove("btn-success");
    const btn3 = document.getElementById("btnstop");
    btn3.classList.remove("btn-light");
    const btn4 = document.getElementById("btnall");
    btn4.classList.remove("btn-all");

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
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
        } else {
          setBtnMore(true);
          setLoadingDash(false);
          setStatus("open");
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
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
        } else {
          setBtnMore(true);
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

  function ticketStop() {
    setTickets([]);
    setTicketsDash([]);
    const btn = document.getElementById("btnopen");
    btn.classList.remove("btn-open");
    const btn2 = document.getElementById("btnclose");
    btn2.classList.remove("btn-success");
    const btn3 = document.getElementById("btnstop");
    btn3.classList.add("btn-light");
    const btn4 = document.getElementById("btnall");
    btn4.classList.remove("btn-all");

    fetch("getTicketFilterStatus/", {
      method: "GET",
      headers: {
        Accept: "application/json",
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
          setBtnMore(true);
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
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("Nenhum ticket com esses Filtros");
          setBtnMore(false);
        } else {
          setBtnMore(true);
          setLoadingDash(false);
          setStatus("all");
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

  function changeProblemn() {
    const select = document.getElementById("selectBo");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "backup":
        setProblemTicket("Backup");
        return getTicketFilterProblemn({ problemn: "Backup" });
      case "mail":
        setProblemTicket("E-mail");
        return getTicketFilterProblemn({ problemn: "E-mail" });
      case "equipamento":
        setProblemTicket("Equipamento");
        return getTicketFilterProblemn({ problemn: "Equipamento" });
      case "user":
        setProblemTicket("Gerenciamento de Usuario");
        return getTicketFilterProblemn({ problemn: "Gerenciamento de Usuario" });
      case "internet":
        setProblemTicket("Internet");
        return getTicketFilterProblemn({ problemn: "Internet" });
      case "permissao":
        setProblemTicket("Permissão");
        return getTicketFilterProblemn({ problemn: "Permissão" });
      case "all":
        setProblemTicket("all");
        return getTicketFilterProblemn({ problemn: "all" });
      case "sap":
        setProblemTicket("SAP");
        return getTicketFilterProblemn({ problemn: "SAP" });
      case "mbi":
        setProblemTicket("MBI");
        return getTicketFilterProblemn({ problemn: "MBI" });
      case "synchro":
        setProblemTicket("Synchro");
        return getTicketFilterProblemn({ problemn: "Synchro" });
      case "office":
        setProblemTicket("Office");
        return getTicketFilterProblemn({ problemn: "Office" });
      case "eng":
        setProblemTicket("Softwares de Eng");
        return getTicketFilterProblemn({ problemn: "Softwares de Eng" });
    }
  }

  function filterTechnician(event) {
    setTickets([]);
    setTicketsDash([]);
    setLoadingDash(true);
    fetch("get-ticket-filter-tech/", {
      method: "GET",
      headers: { Accept: "application/json", "Tech-Select": event.target.value },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setLoadingDash(false);
        setTickets(data.tickets);
        if (data.ticket.length < 1 || data.ticket == null) {
          setMessageError("Esse Tecnico não possui Chamados");
          setTypeError("Falta de Dados");
          setMessage(true);
        }
        return;
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function getTicketFilterProblemn({ problemn }) {
    setTickets([]);
    setTicketsDash([]);
    setLoadingDash(true);

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
        setLoadingDash(false);
        setTickets(data.tickets);
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function selectOrder() {
    setTickets([]);
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

  function getTicketFilterOrderTime({ order }) {
    setTickets([]);
    setTicketsDash([]);
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
        setLoadingDash(false);
        setTickets(data.tickets);
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
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
        setLoadingDash(false);
        setTickets(data.tickets);
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function moreTickets() {
    fetch("/helpdesk/moreTicket/", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Ticket-Current": countTicket,
        "ORDER-BY": orderby,
        "Tech-Dash": "TI",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setCountTicket(data.count);
        setTickets(data.tickets);
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function closeTicket() {
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
    setMessage(false);
    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({
        technician: userData.name,
        status: "close",
        hours: horaFormatada,
        date: dataFormatada,
        mail: ticketMAIL,
      }),
    })
      .then((response) => {
        console.log(response.status);
        if (response.status === 304) {
          setMessageError("Ticket não percetence a você");
          setTypeError("Permissão Negada");
          setMessage(true);
          return;
        }

        if (response.status === 200) {
          return window.location.reload();
        } else {
          return response.json();
        }
      })
      .then((data) => {
        console.log("return data");
        return;
      })
      .catch((err) => {
        setMessageError("Erro ao finalizar o Ticket");
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function reopenTicket() {
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
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({
        technician: userData.name,
        status: "open",
        hours: horaFormatada,
        date: dataFormatada,
        mail: ticketMAIL,
      }),
    })
      .then((response) => {
        if (response.status === 304) {
          setMessage(true);
          setMessageError("Ticket não percetence a você");
          setTypeError("Permissão Negada");
        } else if (response.status === 200) {
          window.location.reload();
        } else {
          return response.json();
        }
      })
      .then((data) => {
        return console.log(data);
      })
      .catch((err) => {
        setMessageError("Erro ao finalizar o Chamado");
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function stopTicket() {
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
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({
        technician: userData.name,
        status: "stop",
        hours: horaFormatada,
        date: dataFormatada,
        mail: ticketMAIL,
      }),
    })
      .then((response) => {
        console.log(response.status);
        if (response.status === 304) {
          setMessageError("Ticket não percetence a você");
          setTypeError("Permissão Negada");
          setMessage(true);
          return;
        }

        if (response.status === 200) {
          return window.location.reload();
        } else {
          return response.json();
        }
      })
      .then((data) => {
        console.log("return data");
        return;
      })
      .catch((err) => {
        setMessageError("Erro ao finalizar o Ticket");
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function UploadNewFiles(evt) {
    UpNwfile.push(evt.target.files);
    for (let i = 0; i < UpNwfile.length; i++) {
      setUploadNewFiles((uploadNewFiles) => [...uploadNewFiles, UpNwfile[i]]);
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
          <div key={file.name} className="d-flex w-100 justify-content-center">
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

                  setUploadNewFiles([newFileList]);
                }}
              >
                <ImgFile src={Exclude} alt="Excluir arquivo" />
              </BtnFile>
            </div>
          </div>
        );
      }

      setNameNWFiles(paragraphs);

      setNewFiles(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadNewFiles]);

  function closeNWFiles() {
    setUploadNewFiles("");
    setNewFiles(false);
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
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
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
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function OpenConfig(event) {
    if (
      (event.target.id === "drp" && document.getElementById("dropcont").classList.contains("visually-hidden")) ||
      (event.target.id === "imd" && document.getElementById("dropcont").classList.contains("visually-hidden"))
    ) {
      document.getElementById("dropcont").classList.remove("visually-hidden");
    } else {
      document.getElementById("dropcont").classList.add("visually-hidden");
    }
  }

  function TicketModify() {
    setModifyTicket(true);
  }

  function TechDetails() {
    fetch("details/" + ticketID, { method: "GET", headers: { Accept: "application/json" } })
      .then((response) => {
        const status = response.status;
        if (status === 200) {
          return response.json();
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        MountChatDetails(data.details);
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function handleSelect() {
    const select = document.getElementById("select-Form");

    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "infra":
        setInfra(true);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setsector("Infraestrutura");
        setSystem(false);
        setMBI(false);
        setSAP(false);
        setOffice(false);
        setSynch(false);
        setEng(false);
        setFake(true);
        setOcurrenceFake(false);
        break;
      case "sistema":
        setSystem(true);
        setInfra(false);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setsector("Sistema");
        setMBI(false);
        setSAP(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setFake(true);
        setOcurrenceFake(false);
        break;
      case "none":
        setInfra(false);
        setSystem(false);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setsector("");
        setMBI(false);
        setSAP(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setFake(true);
        setOcurrenceFake(true);
        break;
    }
  }

  function selectProblem() {
    const select = document.getElementById("select-error");

    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "backup":
        setBackup(true);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("Backup");
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setFake(false);
        break;
      case "mail":
        setMail(true);
        setBackup(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("E-mail");
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setFake(false);
        break;
      case "equip":
        setEquip(true);
        setBackup(false);
        setMail(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("Equipamento");
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setFake(false);
        break;
      case "internet":
        setInternet(true);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setFolder(false);
        setOccurrence("Internet");
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setFake(false);
        break;
      case "folder":
        setFolder(true);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setOccurrence("Permissão");
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setFake(false);
        break;
      case "none":
        setBackup(false);
        setMail(false);
        setEquip(false);
        setFake(true);
        setInternet(false);
        setFolder(false);
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        break;
      case "sap":
        setSAP(true);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("SAP");
        setEng(false);
        setFake(false);
        break;
      case "mbi":
        setMBI(true);
        setSAP(false);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("MBI");
        setSynch(false);
        setOffice(false);
        setEng(false);
        setFake(false);
        break;
      case "synch":
        setFake(false);
        setSynch(true);
        setMBI(false);
        setSAP(false);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("Synchro");
        setOffice(false);
        setEng(false);
        break;
      case "office":
        setFake(false);
        setOffice(true);
        setSynch(false);
        setMBI(false);
        setSAP(false);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setEng(false);
        setOccurrence("Office");
        break;
      case "eng":
        setFake(false);
        setEng(true);
        setOffice(false);
        setSynch(false);
        setMBI(false);
        setSAP(false);
        setBackup(false);
        setMail(false);
        setEquip(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("Softwares de Eng");
        break;
    }
  }

  function selectBackup() {
    const selectBackup = document.getElementById("select-backup");
    const optionBackup = selectBackup.options[selectBackup.selectedIndex].value;

    switch (optionBackup) {
      case "pasta":
        setProblemn("Restaurar pasta");
        break;
      default:
        break;
      case "mail":
        setProblemn("Restaurar e-mail");
        break;
      case "none":
        break;
    }
  }

  function selectMail() {
    const selectMail = document.getElementById("select-mail");
    const optionMail = selectMail.options[selectMail.selectedIndex].value;

    switch (optionMail) {
      default:
        break;
      case "maxcap":
        setProblemn("Aumentar capacidade de e-mail");
        break;
      case "conect":
        setProblemn("Problema com conexão");
        break;
      case "none":
        break;
    }
  }

  function selectEquip() {
    const selectEquip = document.getElementById("select-equip");
    const optionEquip = selectEquip.options[selectEquip.selectedIndex].value;

    switch (optionEquip) {
      default:
        break;
      case "none":
        break;
      case "off":
        setProblemn("Equipamento não liga");
        break;
      case "printer":
        setProblemn("Problema com a impressora");
        break;
      case "roaming":
        setProblemn("Mudanca de local de trabalho");
        break;
      case "usb":
        setProblemn("USB");
        break;
      case "change":
        setProblemn("Trocar Equipamento");
        break;
    }
  }

  function selectInternet() {
    const select = document.getElementById("select-internet");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "none":
        break;
      case "lib":
        setProblemn("Liberacao de site");
        break;
      case "block":
        setProblemn("Bloqueio de site");
        break;
    }
  }

  function selectFolder() {
    const select = document.getElementById("select-folder");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "none":
        break;
      case "lib":
        setProblemn("Liberar pasta");
        break;
      case "block":
        setProblemn("Bloquear pasta");
        break;
    }
  }

  function selectSAP() {
    const selectSAP = document.getElementById("select-sap");
    const optionSAP = selectSAP.options[selectSAP.selectedIndex].value;

    switch (optionSAP) {
      default:
        break;
      case "none":
        break;
      case "user":
        setProblemn("Criação/exclusão usuário");
        break;
      case "access":
        setProblemn("Liberação/bloqueio de acessos");
        break;
      case "quest":
        setProblemn("Dúvidas operacionais");
        break;
      case "error":
        setProblemn("Correção de falhas");
        break;
    }
  }

  function selectMBI() {
    const select_MBI = document.getElementById("select-mbi");
    const optionMBI = select_MBI.options[select_MBI.selectedIndex].value;

    switch (optionMBI) {
      default:
        break;
      case "none":
        break;
      case "user":
        setProblemn("Criação/exclusão usuário");
        break;
      case "access":
        setProblemn("Liberação/bloqueio de acessos");
        break;
      case "quest":
        setProblemn("Dúvidas operacionais");
        break;
      case "error":
        setProblemn("Correção de falhas");
        break;
    }
  }

  function selectOffice() {
    const selectOffice = document.getElementById("select-office");
    const optionOffice = selectOffice.options[selectOffice.selectedIndex].value;

    switch (optionOffice) {
      default:
        break;
      case "none":
        break;
      case "buy":
        setProblemn("Aquisição de software/licenciamento");
        break;
      case "error":
        setProblemn("Correção de falhas");
        break;
    }
  }

  function selectEng() {
    const selectEng = document.getElementById("select-eng");
    const optionEng = selectEng.options[selectEng.selectedIndex].value;

    switch (optionEng) {
      default:
        break;
      case "none":
        break;
      case "buy":
        setProblemn("Aquisição de software/licenciamento");
        break;
      case "error":
        setProblemn("Correção de falhas");
        break;
    }
  }

  function uploadModify() {
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
    if (sector.length < 1) {
      setMessage(true);
      setTypeError("Dados Insuficientes");
      setMessageError("Obrigatório Informar o Setor Responsavel");
      return;
    } else if (occurrence.length < 1) {
      setMessage(true);
      setTypeError("Dados Insuficientes");
      setMessageError("Obrigatório Informar a Ocorrência");
      return;
    } else if (problemn.length < 1) {
      setMessage(true);
      setTypeError("Dados Insuficientes");
      setMessageError("Obrigatório Informar o Problema");
      return;
    }

    fetch("/helpdesk/ticket/" + ticketID, {
      method: "POST",
      headers: {
        "X-CSRFToken": token,
        "Modify-Ticket": "modify",
      },
      body: JSON.stringify({
        sector: sector,
        tech: userData.name,
        OldSector: ticketSECTOR,
        occurrence: occurrence,
        OldOccurrence: ticketOCCURRENCE,
        OldProblemn: ticketPROBLEMN,
        problemn: problemn,
        hours: horaFormatada,
        date: dataFormatada,
      }),
    })
      .then((response) => {
        response.json();

        if (response.status === 304) {
          setMessage(true);
          setTypeError("Operação Inválida");
          setMessageError("Chamado não pertence a você");
          return;
        } else if (response.status === 402) {
          setMessage(true);
          setTypeError("Erro de Dados");
          setMessageError("Modificação Identica ao chamado atual Cancelada");
          return;
        } else if (response.status === 200) {
          return window.location.reload();
        }
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("FATAL ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  function selectSynch() {
    const selectSynch = document.getElementById("select-synch");
    const optionSynch = selectSynch.options[selectSynch.selectedIndex].value;

    switch (optionSynch) {
      default:
        break;
      case "none":
        break;
      case "user":
        setProblemn("Criação/exclusão usuário");
        break;
      case "access":
        setProblemn("Liberação/bloqueio de acessos");
        break;
      case "quest":
        setProblemn("Dúvidas operacionais");
        break;
      case "error":
        setProblemn("Correção de falhas");
        break;
    }
  }

  function closeModify() {
    setModifyTicket(false);
  }

  function closeDetails() {
    setTechDetails(false);
  }

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
      {dropdownBTN && (
        <DivDrop className={`position-absolute top-0 start-0 ${classBlur}`}>
          <Dropdown>
            <DropdownButton onClick={dropdown} className="dropbtn"></DropdownButton>
            <DropdownConten id="myDropdown" className="dropdown-content">
              <P1 className="d-block" onClick={equipamentForUser}>
                Adicionar Equipamento
              </P1>
            </DropdownConten>
          </Dropdown>
        </DivDrop>
      )}
      <TitlePage className="text-center text-light mt-3">Central de Gerenciamento de Chamados TI</TitlePage>
      <div className={`d-flex flex-column justify-content-center w-100 ${classBlur}`}>
        <div className="d-flex justify-content-center w-100">
          <DashBoardPie sector={"TI"} />
        </div>
        <div className="d-flex justify-content-center">
          <DashboardBar />
        </div>
      </div>
      <DivFilter className={`${classBlur} ${themeFilter}`}>
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
          <option value="recent">Data Recente</option>
          <option selected value="ancient">
            Data Antiga
          </option>
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
        <DivSelectView className="mt-3">
          <PSelectView className="position-absolute top-0 start-0 translate-middle">Status</PSelectView>
          <Button1
            className="btn btn-open"
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
      <section ref={sectionTicket} id="dashboard">
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
              <DropDown>
                <DropBTN id="drp" onClick={OpenConfig}>
                  <IMGConfig id="imd" src={Seeting} alt="" />
                </DropBTN>
                <DropContent2 id="dropcont" className="visually-hidden">
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
                  <DropBTN className="btn btn-danger w-100" onClick={TicketModify}>
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
              <input type="text" value={"Nome: " + namenewuser} className="form-control" disabled hidden={namenewuser.length > 1 ? false : true} />
              <input type="text" value={"Setor: " + sectornewuser} className="form-control" disabled hidden={sectornewuser === "undefined" ? true : false} />
              <input type="text" value={"Remanejamento: " + wherefrom} className="form-control" disabled hidden={wherefrom.length > 1 ? false : true} />
              <input type="text" value="Necessita-se de máquina" className="form-control" disabled hidden={machinenewuser === true ? false : true} />
              <input type="text" value={"Filial: " + companynewuser} className="form-control" disabled hidden={companynewuser.length > 1 ? false : true} />
              <input type="text" value={"Softwares Necessisarios: " + softwarenewuser} className="form-control" disabled hidden={softwarenewuser.length > 1 ? false : true} />
              <input type="text" value={"Centro de custo: " + costcenter} className="form-control" disabled hidden={costcenter.length > 1 ? false : true} />
              <input type="text" value={"Cargo: " + jobtitlenewuser} className="form-control" disabled hidden={jobtitlenewuser.length > 1 ? false : true} />
              <input type="text" value={"Centro de custo: " + costcenter} className="form-control" disabled hidden={costcenter.length > 1 ? false : true} />
              <input type="text" value={"Transferir e-mails para: " + mailtranfer} className="form-control" disabled hidden={mailtranfer.length > 1 ? false : true} />
              <input type="text" value={"Transferir dados para: " + oldfile} className="form-control" disabled hidden={oldfile.length > 1 ? false : true} />
              <PBloq hidden={jobtitlenewuser.length > 1 || mailtranfer.length > 1 ? false : true}>
                {jobtitlenewuser.length > 1 ? "Funcionario iniciara as atividades dia:" : "Bloquear acesso a partir de:"}
              </PBloq>
              <DivCal hidden={jobtitlenewuser.length > 1 || mailtranfer.length > 1 ? false : true}>
                <DayPicker id="calendarALT" fixedWeeks showOutsideDays selected={startworknewuser} className="cald" mode="single" />
              </DivCal>
              <input type="text" value={"Copiar usuario de: " + copyprofilenewuser} className="form-control" disabled hidden={copyprofilenewuser.length > 1 ? false : true} />
              <DivINp hidden={imageEquipament === undefined}>
                {imageEquipament}
                <DivAlocate className="d-flex flex-column">
                  <p className="text-center">Unidade: {equipamentLocate}</p>
                </DivAlocate>
                <Calendar className="d-flex flex-column">
                  <p className="text-center">Data de alocação</p>
                  <div>
                    <DayPicker id="calendarALT" fixedWeeks showOutsideDays selected={daysLocated} mode="multiple" localte={ptBR} />
                  </div>
                </Calendar>
              </DivINp>
              <input type="text" value={ticketOBSERVATION ? "Observação: " + ticketOBSERVATION : "Observação: "} className="form-control" disabled />
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
                  <Message TypeError={typeError} MessageError={messageError} CloseMessage={closeMessage} />
                </div>
              )}
            </DivChat>
            {chat && (
              <div className="w-100 d-flex">
                <div className="w-100">
                  <input className="form-control h-100 fs-5" type="text" onKeyUp={NewChat} id="input-chat" />
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
      {equipamentforuser && <Registration token={token} equipamentforuser={equipamentforuser} CloseFunct={closeUpload} />}
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
      {modifyTicket && (
        <DivModify className="position-fixed top-50 start-50 translate-middle">
          {messageChat && (
            <div className="w-100 h-100 d-flex justify-content-center align-items-center">
              <Message TypeError={typeError} MessageError={messageError} CloseMessage={closeMessage} />
            </div>
          )}
          {dataModify && (
            <>
              <div className="w-100 d-flex mt-3 mb-4">
                <div className="w-100 d-flex justify-content-center">
                  <h5>Modificação do Chamado {ticketID}</h5>
                </div>
                <div className="d-flex justify-content-center">
                  <button onClick={closeModify}>X</button>
                </div>
              </div>
              <div className="d-flex justify-content-around">
                <InputTicket type="text" value={`Setor: ${ticketSECTOR}`} disabled />
                <Select className="form-select mb-3" aria-label="Default select example" id="select-Form" onChange={handleSelect}>
                  <option value="none" disabled selected>
                    Selecione o Setor
                  </option>
                  <option value="infra">Infra</option>
                  <option value="sistema">Sistema</option>
                </Select>
              </div>
              <div className="d-flex justify-content-around mt-3">
                <InputTicket type="text" value={`Ocorrência: ${ticketOCCURRENCE}`} disabled />
                {OcurrenceFake && (
                  <Select className="form-select mb-3">
                    <option value="none" disabled selected>
                      Selecione a Ocorrência
                    </option>
                  </Select>
                )}
                {infra && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-error" onChange={selectProblem}>
                    <option value="none" disabled selected>
                      Selecione a Ocorrência
                    </option>
                    <option value="backup">Backup/Restore</option>
                    <option value="mail">E-mail</option>
                    <option value="equip">Equipamento</option>
                    <option value="internet">Internet</option>
                    <option value="folder">Pasta</option>
                  </Select>
                )}
                {system && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-error" onChange={selectProblem}>
                    <option value="none" disabled selected>
                      Selecione o Sistema
                    </option>
                    <option value="sap">SAP</option>
                    <option value="mbi">MBI</option>
                    <option value="synch">Synchro</option>
                    <option value="office">Office</option>
                    <option value="eng">Softwares de Engenharia</option>
                  </Select>
                )}
              </div>
              <div className="d-flex justify-content-around mt-3">
                <InputTicket type="text" value={`Problema: ${ticketPROBLEMN}`} disabled />
                {fake && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-backup" onChange={selectBackup}>
                    <option value="none" disabled selected>
                      Selecione o problema ocorrido
                    </option>
                  </Select>
                )}
                {backup && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-backup" onChange={selectBackup}>
                    <option value="none" disabled selected>
                      Selecione o problema ocorrido
                    </option>
                    <option value="pasta">Pasta/Arquivo</option>
                    <option value="mail">E-mail</option>
                  </Select>
                )}
                {mail && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-mail" onChange={selectMail}>
                    <option value="none" disabled selected>
                      Selecione o problema ocorrido
                    </option>
                    <option value="maxcap">Aumentar capacidade</option>
                    <option value="conect">Não conecta</option>
                  </Select>
                )}
                {equip && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-equip" onChange={selectEquip}>
                    <option value="none" disabled selected>
                      Selecione o problema ocorrido
                    </option>
                    <option value="off">Computador não liga</option>
                    <option value="printer">Problema com a impressora</option>
                    <option value="roaming">Mudança de local de trabalho</option>
                    <option value="usb">Liberação/Bloqueio de USB</option>
                    <option value="change">Trocar Equipamento</option>
                  </Select>
                )}
                {internet && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-internet" onChange={selectInternet}>
                    <option value="none" disabled selected>
                      Selecione o problema ocorrido
                    </option>
                    <option value="lib">Liberação de site</option>
                    <option value="block">Bloqueio de site</option>
                  </Select>
                )}
                {folder && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-folder" onChange={selectFolder}>
                    <option value="none" disabled selected>
                      Selecione o problema ocorrido
                    </option>
                    <option value="lib">Liberação de Pasta</option>
                    <option value="block">Bloqueio de Pasta</option>
                  </Select>
                )}
                {sap && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-sap" onChange={selectSAP}>
                    <option value="none" disabled selected>
                      Selecione o Problema
                    </option>
                    <option value="user">Criação/exclusão de usuários</option>
                    <option value="access">Liberação/bloqueio de acessos</option>
                    <option value="quest">Dúvidas operacionais</option>
                    <option value="error">Correção de falhas</option>
                  </Select>
                )}
                {mbi && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-mbi" onChange={selectMBI}>
                    <option value="none" disabled selected>
                      Selecione o Problema
                    </option>
                    <option value="user">Criação/exclusão de usuários</option>
                    <option value="access">Liberação/bloqueio de acessos</option>
                    <option value="quest">Dúvidas operacionais</option>
                    <option value="error">Correção de falhas</option>
                  </Select>
                )}
                {synch && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-synch" onChange={selectSynch}>
                    <option value="none" disabled selected>
                      Selecione o Problema
                    </option>
                    <option value="user">Criação/exclusão de usuários</option>
                    <option value="access">Liberação/bloqueio de acessos</option>
                    <option value="quest">Dúvidas operacionais</option>
                    <option value="error">Correção de falhas</option>
                  </Select>
                )}
                {office && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-office" onChange={selectOffice}>
                    <option value="none" disabled selected>
                      Selecione o Problema
                    </option>
                    <option value="buy">Aquisição de software/licenciamento</option>
                    <option value="error">Correção de falhas</option>
                  </Select>
                )}
                {eng && (
                  <Select className="form-select mb-3" aria-label="Default select example" id="select-eng" onChange={selectEng}>
                    <option value="none" disabled selected>
                      Selecione o Problema
                    </option>
                    <option value="buy">Aquisição de software/licenciamento</option>
                    <option value="error">Correção de falhas</option>
                  </Select>
                )}
              </div>
              <div className="d-flex justify-content-center">
                <button className="btn btn-warning mt-5" onClick={uploadModify}>
                  Confirmar
                </button>
              </div>
            </>
          )}
        </DivModify>
      )}
      {techDetails && (
        <DivDetaisl className="position-fixed top-50 start-50 translate-middle">
          <div className="d-flex">
            <div className="w-100 justify-content-center">
              <h2 className="text-center">Detalhes tecnicos</h2>
            </div>
            <div>
              <button onClick={closeDetails}>X</button>
            </div>
          </div>
          <div className="overflow-y-auto w-100 h-100 position relative">
            {loadingChat && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <Loading />
              </div>
            )}
            {mountDetails}
          </div>
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
