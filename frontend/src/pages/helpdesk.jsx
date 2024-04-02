import React, { useState, useEffect } from "react";
import NavBar from "../components/navbar";
import "../styles/bootstrap/css/bootstrap.css";
import { Div, Form, Input, Input2, Select, Div2, Calendar, Textarea, ImageEquip, DivEquip, InputRadio, PNameFile, DivNameFile, ImgFile, BtnFile, InputFile } from "../styles/helpdeskStyle";
import { DivUpload, HeaderFiles, PFiles, IMGFile, Span1, Span2, BodyFiles, PFiles2, B1, InputFiles, IMGFile2, FooterFiles, Divider, Span3, ListFiles } from "../styles/Equipment_RegistrationStyle";
import { DayPicker } from "react-day-picker";
import ptBR from "date-fns/locale/pt";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import Loading from "../components/loading";
import Message from "../components/message";
import Cloud from "../images/components/cloud-uploading.png";
import Exclude from "../images/components/lixo.png";

export default function Helpdesk() {
  useEffect(() => {
    document.title = "Abrir Chamado";
    const theme = localStorage.getItem("Theme");
    if (theme === null || theme === "black") {
      localStorage.setItem("Theme", "black");
      ThemeBlack();
    } else if (theme === "light") {
      ThemeLight();
    }
  }, []);

  const [csrfToken, setCSRFToken] = useState("");
  const [messagetitle, setMessagetitle] = useState("");
  const [messageinfo1, setMessageinfo1] = useState("");
  const [messageinfo2, setMessageinfo2] = useState("");
  const [sector, setsector] = useState("");
  const [occurrence, setOccurrence] = useState("");
  const [problemn, setProblemn] = useState("");
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(true);
  const [motivation, setMotivation] = useState(true);
  const [alertverify, setAlertVerify] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const [dashboard, setDashboard] = useState(false);
  const [infra, setInfra] = useState(false);
  const [system, setSystem] = useState(false);
  const [backup, setBackup] = useState(false);
  const [alert, setAlert] = useState(false);
  const [machine, setMachine] = useState(false);
  const [mail, setMail] = useState(false);
  const [equip, setEquip] = useState(false);
  const [user, setUser] = useState(false);
  const [internet, setInternet] = useState(false);
  const [folder, setFolder] = useState(false);
  const [formnewuser, setFormNewUser] = useState(false);
  const [formdeluser, setFormDelUser] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [dataUser, setdataUser] = useState();
  const [message, setMessage] = useState(false);
  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [respectiveTI, setRespectiveTI] = useState(false);
  const [respectiveArea, setRespectiveArea] = useState("");
  const [sap, setSAP] = useState(false);
  const [mbi, setMBI] = useState(false);
  const [synch, setSynch] = useState(false);
  const [office, setOffice] = useState(false);
  const [eng, setEng] = useState(false);
  const [alocate, setAlocate] = useState(false);
  const [equipaments, setEquipaments] = useState();
  const [dashequipaments, setDashEquipaments] = useState("");
  const [filename, setFileName] = useState([]);
  const [fileimg, setFileImg] = useState([]);
  const [dateequip, setDateEquip] = useState(false);
  const [daysForAlocate, setDaysForAlocate] = useState([]);
  const [equipamentSelected, setEquipamentSelected] = useState("");
  const [newname, setNewName] = useState("");
  const [sectornewuser, setSectorNewUser] = useState("");
  const [motivationContract, setMotivationContract] = useState("");
  const [necessaryMachine, setNecessaryMachine] = useState();
  const [companynewUser, setCompanyNewUser] = useState("");
  const [softwareNewUser, setSoftwareNewUser] = useState([]);
  const [centralcost, setCentralCost] = useState("");
  const [jobtitlenewuser, setJobTitleNewUser] = useState("");
  const [copyUser, setCopyUser] = useState("");
  const [maildelegation, setMailDelegation] = useState("");
  const [dirsave, setDirSave] = useState("");
  const [nameOnDropFiles, setNameOnDropFiles] = useState("");
  const [nameOnInutFiles, setNameOnInputFiles] = useState("");
  const [theme, setTheme] = useState("");
  const [themeTicket, setThemeTicket] = useState("");
  const [inputDropControl, setInputDropControl] = useState(true);
  const [inputManualControl, setInputManualControl] = useState(false);
  const [arrayInput, setArrayInput] = useState([]);
  const [fileSizeNotify, setFileSizeNotify] = useState(false);

  const footerDay = selectedDay ? <p>Você selecionou {format(selectedDay, "PPP")}</p> : <p>Selecione uma dataUser</p>;
  const footerAlocate = daysForAlocate.length >= 1 ? <p>Você alocou por {daysForAlocate.length} dia(s).</p> : <p>Selecione um ou mais dias.</p>;

  let file_name = [];

  function ThemeBlack() {
    setThemeTicket("");
    setTheme("themeBlack");
  }

  function ThemeLight() {
    setThemeTicket("themeLightTicket");
    setTheme("themeLight");
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("", {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: {},
        });
        if (!response.ok) {
          throw new Error("Erro na solicitação");
        }
        const data = await response.json();
        setEquipaments(data.equipaments);
        setCSRFToken(data.token);
        const storedDataUser = localStorage.getItem("dataInfo");
        const dataUserInfo = storedDataUser ? JSON.parse(storedDataUser).data : null;
        setdataUser(dataUserInfo);
      } catch (error) {
        console.error("Erro na solicitação:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (dataUser && Object.keys(dataUser).length > 0) {
      setLoading(false);
      setNavbar(true);
      setDashboard(true);
    }
  }, [dataUser]);

  useEffect(() => {
    if (dashboard === true) {
      //DOM
      const $ = document.querySelector.bind(document);

      //APP
      let App = {};
      App.init = (function () {
        //Init
        function handleFileSelect(evt) {
          const files = evt.target.files; // FileList object

          //files template
          let template = `${Object.keys(files).join("")}`;

          if (fileimg.length <= 0) {
            return;
          }

          $("#drop").classList.add("hidden");
          $("footer").classList.add("hasFiles");
          $(".importar").classList.add("active");
          setTimeout(() => {
            $("#list-files").innerHTML = template;
          }, 1000);

          Object.keys(files).forEach((file) => {
            let load = 2000 + file * 2000; // fake load
            setTimeout(() => {
              $(`.file--${file}`).querySelector(".progress").classList.remove("active");
              $(`.file--${file}`).querySelector(".done").classList.add("anim");
            }, load);
          });
        }

        // drop events
        $("#drop").ondragleave = (evt) => {
          $("#drop").classList.remove("active");
          $("#divider").classList.remove("overflow-hidden");
          evt.preventDefault();
        };
        $("#drop").ondragover = $("#drop").ondragenter = (evt) => {
          $("#drop").classList.add("active");
          evt.preventDefault();
        };
        $("#drop").ondrop = (evt) => {
          for (let i = 0; i < evt.dataTransfer.files.length; i++) {
            setFileImg((itens) => [...itens, evt.dataTransfer.files[i]]);
          }

          $("footer").classList.add("hasFiles");
          $("#divider").classList.remove("overflow-hidden");
          $("#divider").classList.add("lineTop");
          $("#drop").classList.remove("active");
          evt.preventDefault();
        };

        //upload more
        $(".importar").addEventListener("click", () => {
          $("#list-files").innerHTML = "";
          $("footer").classList.remove("hasFiles");
          $(".importar").classList.remove("active");
          setTimeout(() => {
            $("#drop").classList.remove("hidden");
          }, 500);
        });

        // input change
        $("input[type=file]").addEventListener("change", handleFileSelect);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard]);

  function selectARes() {
    const select = document.getElementById("selectAR");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      case "TI":
        setAlert(false);
        setRespectiveTI(true);
        setRespectiveArea("TI");
        setAlertVerify(false);
        break;
      case "none":
        setRespectiveTI(false);
        setAlert(false);
        break;
      default:
        setRespectiveTI(false);
        setAlert(false);
        break;
    }
  }

  function handleSelect() {
    const select = document.getElementById("select-Form");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "infra":
        setInfra(true);
        setAlert(false);
        setBackup(false);
        setMail(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setEquip(false);
        setUser(false);
        setInternet(false);
        setFolder(false);
        setAlertVerify(false);
        setsector("Infraestrutura");
        setSystem(false);
        setMBI(false);
        setSAP(false);
        setOffice(false);
        setSynch(false);
        setEng(false);
        setAlocate(false);
        setDateEquip(false);
        break;
      case "sistema":
        setSystem(true);
        setInfra(false);
        setAlert(false);
        setBackup(false);
        setMail(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setEquip(false);
        setUser(false);
        setInternet(false);
        setFolder(false);
        setsector("Sistema");
        setAlertVerify(false);
        setMBI(false);
        setSAP(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setAlocate(false);
        setDateEquip(false);
        break;
      case "none":
        setInfra(false);
        setSystem(false);
        setAlert(false);
        setBackup(false);
        setMail(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setEquip(false);
        setUser(false);
        setInternet(false);
        setFolder(false);
        setsector("");
        setMBI(false);
        setSAP(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setAlocate(false);
        setDateEquip(false);
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
        setAlert(false);
        setMail(false);
        setEquip(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setUser(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("Backup");
        setAlertVerify(false);
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setAlocate(false);
        setDateEquip(false);
        break;
      case "mail":
        setMail(true);
        setBackup(false);
        setAlert(false);
        setEquip(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setUser(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("E-mail");
        setAlertVerify(false);
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setAlocate(false);
        setDateEquip(false);
        break;
      case "equip":
        setEquip(true);
        setBackup(false);
        setMail(false);
        setAlert(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setUser(false);
        setInternet(false);
        setFolder(false);
        setAlertVerify(false);
        setAlocate(false);
        setOccurrence("Equipamento");
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setDateEquip(false);
        break;
      case "user":
        setUser(true);
        setBackup(false);
        setAlert(false);
        setMail(false);
        setEquip(false);
        setFormDelUser(false);
        setFormNewUser(false);
        setInternet(false);
        setFolder(false);
        setAlertVerify(false);
        setAlocate(false);
        setOccurrence("Gerenciamento de Usuario");
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setDateEquip(false);
        break;
      case "internet":
        setInternet(true);
        setBackup(false);
        setAlert(false);
        setMail(false);
        setEquip(false);
        setUser(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setFolder(false);
        setAlertVerify(false);
        setAlocate(false);
        setDateEquip(false);
        setOccurrence("Internet");
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setDateEquip(false);
        break;
      case "folder":
        setFolder(true);
        setBackup(false);
        setAlert(false);
        setMail(false);
        setEquip(false);
        setUser(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setInternet(false);
        setAlertVerify(false);
        setAlocate(false);
        setDateEquip(false);
        setOccurrence("Permissão");
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setDateEquip(false);
        break;
      case "none":
        setBackup(false);
        setAlert(false);
        setMail(false);
        setEquip(false);
        setUser(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setInternet(false);
        setFolder(false);
        setSAP(false);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setEng(false);
        setAlocate(false);
        setDateEquip(false);
        break;
      case "sap":
        setSAP(true);
        setMBI(false);
        setSynch(false);
        setOffice(false);
        setBackup(false);
        setAlert(false);
        setMail(false);
        setEquip(false);
        setUser(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("SAP");
        setEng(false);
        setAlocate(false);
        setDateEquip(false);
        break;
      case "mbi":
        setMBI(true);
        setSAP(false);
        setBackup(false);
        setAlert(false);
        setMail(false);
        setEquip(false);
        setUser(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("MBI");
        setSynch(false);
        setOffice(false);
        setAlocate(false);
        setEng(false);
        setDateEquip(false);
        break;
      case "synch":
        setSynch(true);
        setMBI(false);
        setSAP(false);
        setBackup(false);
        setAlert(false);
        setMail(false);
        setEquip(false);
        setUser(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("Synchro");
        setOffice(false);
        setAlocate(false);
        setEng(false);
        setDateEquip(false);
        break;
      case "office":
        setOffice(true);
        setSynch(false);
        setMBI(false);
        setSAP(false);
        setBackup(false);
        setAlert(false);
        setMail(false);
        setEquip(false);
        setUser(false);
        setAlocate(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setInternet(false);
        setFolder(false);
        setEng(false);
        setOccurrence("Office");
        setDateEquip(false);
        break;
      case "eng":
        setEng(true);
        setOffice(false);
        setSynch(false);
        setMBI(false);
        setSAP(false);
        setBackup(false);
        setAlocate(false);
        setAlert(false);
        setMail(false);
        setEquip(false);
        setUser(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setInternet(false);
        setFolder(false);
        setOccurrence("Softwares de Eng");
        setDateEquip(false);
        break;
    }
  }

  function selectSynch() {
    const selectSynch = document.getElementById("select-synch");
    const optionSynch = selectSynch.options[selectSynch.selectedIndex].value;

    switch (optionSynch) {
      default:
        break;
      case "user":
        setAlert(true);
        setMessagetitle("Caso de Criação/exclusão de usuários");
        setMessageinfo1("1. Informar o usuário que deverá ser criado ou excluido");
        setMessageinfo2("2. Informar os acessos que o mesmo poderá utilizar");
        setProblemn("Criação/exclusão usuário");
        setAlertVerify(false);
        break;
      case "access":
        setAlert(true);
        setMessagetitle("Caso de Liberação/bloqueio de acessos");
        setMessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
        setMessageinfo2("");
        setProblemn("Liberação/bloqueio de acessos");
        setAlertVerify(false);
        break;
      case "quest":
        setAlert(true);
        setMessagetitle("Caso de Dúvidas operacionais");
        setMessageinfo1("1. Descreva o que deseja saber");
        setMessageinfo2("");
        setProblemn("Dúvidas operacionais");
        setAlertVerify(false);
        break;
      case "error":
        setAlert(true);
        setMessagetitle("Caso de Correção de falhas");
        setMessageinfo1("1. Informe o Erro");
        setMessageinfo2("");
        setProblemn("Correção de falhas");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
    }
  }

  function selectMBI() {
    const select_MBI = document.getElementById("select-mbi");
    const optionMBI = select_MBI.options[select_MBI.selectedIndex].value;

    switch (optionMBI) {
      default:
        break;
      case "user":
        setAlert(true);
        setMessagetitle("Caso de Criação/exclusão de usuários");
        setMessageinfo1("1. Informar o usuário que deverá ser criado ou excluido");
        setMessageinfo2("2. Informar os acessos que o mesmo poderá utilizar");
        setProblemn("Criação/exclusão usuário");
        setAlertVerify(false);
        break;
      case "access":
        setAlert(true);
        setMessagetitle("Caso de Liberação/bloqueio de acessos");
        setMessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
        setMessageinfo2("");
        setProblemn("Liberação/bloqueio de acessos");
        setAlertVerify(false);
        break;
      case "quest":
        setAlert(true);
        setMessagetitle("Caso de Dúvidas operacionais");
        setMessageinfo1("1. Descreva o que deseja saber");
        setMessageinfo2("");
        setProblemn("Dúvidas operacionais");
        setAlertVerify(false);
        break;
      case "error":
        setAlert(true);
        setMessagetitle("Caso de Correção de falhas");
        setMessageinfo1("1. Informe o Erro");
        setMessageinfo2("");
        setProblemn("Correção de falhas");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        break;
    }
  }

  function selectSAP() {
    const selectSAP = document.getElementById("select-sap");
    const optionSAP = selectSAP.options[selectSAP.selectedIndex].value;

    switch (optionSAP) {
      default:
        break;
      case "user":
        setAlert(true);
        setMessagetitle("Caso de Criação/exclusão de usuários");
        setMessageinfo1("1. Informar o usuário que deverá ser criado ou excluido");
        setMessageinfo2("2. Informar os acessos que o mesmo poderá utilizar");
        setProblemn("Criação/exclusão usuário");
        setAlertVerify(false);
        break;
      case "access":
        setAlert(true);
        setMessagetitle("Caso de Liberação/bloqueio de acessos");
        setMessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
        setMessageinfo2("");
        setProblemn("Liberação/bloqueio de acessos");
        setAlertVerify(false);
        break;
      case "quest":
        setAlert(true);
        setMessagetitle("Caso de Dúvidas operacionais");
        setMessageinfo1("1. Descreva o que deseja saber");
        setMessageinfo2("");
        setProblemn("Dúvidas operacionais");
        setAlertVerify(false);
        break;
      case "error":
        setAlert(true);
        setMessagetitle("Caso de Correção de falhas");
        setMessageinfo1("1. Informe o Erro");
        setMessageinfo2("");
        setProblemn("Correção de falhas");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        break;
    }
  }

  function selectOffice() {
    const selectOffice = document.getElementById("select-office");
    const optionOffice = selectOffice.options[selectOffice.selectedIndex].value;

    switch (optionOffice) {
      default:
        break;
      case "buy":
        setAlert(true);
        setMessagetitle("Aquisição de software/licenciamento");
        setMessageinfo1("1. Informe para quem será a licença");
        setMessageinfo2("");
        setProblemn("Aquisição de software/licenciamento");
        setAlertVerify(false);
        break;
      case "error":
        setAlert(true);
        setMessagetitle("Caso de Correção de falhas");
        setMessageinfo1("1. Informe o Erro");
        setMessageinfo2("");
        setProblemn("Correção de falhas");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        break;
    }
  }

  function getObservation(event) {
    setObservation(event.target.value);
  }

  function selectEng() {
    const selectEng = document.getElementById("select-eng");
    const optionEng = selectEng.options[selectEng.selectedIndex].value;

    switch (optionEng) {
      default:
        break;
      case "buyt":
        setAlert(true);
        setMessagetitle("Aquisição de software/licenciamento");
        setMessageinfo1("1. Informe para quem será a licença");
        setMessageinfo2("");
        setProblemn("Aquisição de software/licenciamento");
        setAlertVerify(false);
        break;
      case "error":
        setAlert(true);
        setMessagetitle("Caso de Correção de falhas");
        setMessageinfo1("1. Informe o Erro");
        setMessageinfo2("");
        setProblemn("Correção de falhas");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        break;
    }
  }

  function selectBackup() {
    const selectBackup = document.getElementById("select-backup");
    const optionBackup = selectBackup.options[selectBackup.selectedIndex].value;

    switch (optionBackup) {
      default:
        break;
      case "pasta":
        setAlert(true);
        setMessagetitle("Caso de pasta");
        setMessageinfo1("1. Informar o caminho completo da pasta");
        setMessageinfo2("2. Informar a dataUser de criação e exclusão do arquivo");
        setProblemn("Restaurar pasta");
        setAlertVerify(false);
        break;
      case "mail":
        setAlert(true);
        setMessagetitle("Caso de e-mail");
        setMessageinfo1("1. Descreva o que deseja restaurar");
        setMessageinfo2("");
        setProblemn("Restaurar e-mail");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
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
        setAlert(false);
        setProblemn("Aumentar capacidade de e-mail");
        setAlertVerify(false);
        break;
      case "conect":
        setAlert(true);
        setMessagetitle("Caso de email não conecta na internet");
        setMessageinfo1("1. Informar mensagem de erro");
        setMessageinfo2("");
        setProblemn("Problema com conexão");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        break;
      case "domin":
        setAlert(true);
        setMessagetitle("Caso de liberar domínion de e-mail");
        setMessageinfo1("1. Informar dóminio, exemplo @lupatech.com.br");
        setMessageinfo2("");
        setProblemn("Liberar domínio");
        setAlertVerify(false);
        break;
    }
  }

  function selectEquipament({ element, id }) {
    setEquipamentSelected(id);
    const allElements = document.querySelectorAll(".equipsclass");
    allElements.forEach((el) => {
      el.style.border = "none";
    });

    element.classList.add("borderEquip");
    setDateEquip(true);
  }

  function selectEquip() {
    const selectEquip = document.getElementById("select-equip");
    const optionEquip = selectEquip.options[selectEquip.selectedIndex].value;

    switch (optionEquip) {
      default:
        break;
      case "off":
        setAlocate(false);
        setAlert(true);
        setMessagetitle("Caso de computador não ligar");
        setMessageinfo1("1. Informar o usuario e setor de onde fica o equipamento");
        setMessageinfo2("");
        setProblemn("Equipamento não liga");
        setAlertVerify(false);
        break;
      case "printer":
        setAlocate(false);
        setAlert(true);
        setMessagetitle("Caso de problema com a impressora");
        setMessageinfo1("1. Informar onde a impressora está localizada");
        setMessageinfo2("2. Informar menssagem de erro que aparece");
        setProblemn("Problema com a impressora");
        setAlertVerify(false);
        break;
      case "roaming":
        setAlocate(false);
        setAlert(true);
        setMessagetitle("Caso de troca de local de trabalho");
        setMessageinfo1("1. Informar se no local existe ponto de rede e de energia");
        setMessageinfo2("");
        setProblemn("Mudanca de local de trabalho");
        setAlertVerify(false);
        break;
      case "usb":
        setAlocate(false);
        setAlert(true);
        setMessagetitle("Caso de liberação/bloqueio de USB");
        setMessageinfo1("1. Justificar a solicitação");
        setMessageinfo2("2. Caso não seja o gestor da area, anexar a autorização do mesmo");
        setProblemn("USB");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        setAlocate(false);
        break;
      case "alocate":
        setDashEquipaments("");
        setAlert(true);
        setMessagetitle("Caso de Alocação de equipamento");
        setMessageinfo1("1. Selecionar o equipamento desejado");
        setMessageinfo2("2. Informar a dataUser e a necessidade de equipamentos adicionais como teclado, etc...");
        setAlertVerify(false);
        setAlocate(true);
        setProblemn("Alocação de Máquina");
        if (equipaments && Object.keys(equipaments).length > 0) {
          equipaments.forEach((equipament) => {
            const Div = (
              <DivEquip
                className="equipsclass"
                onClick={(event) =>
                  selectEquipament({
                    element: event.currentTarget,
                    id: equipament.id,
                  })
                }
              >
                <ImageEquip src={`dataUser:image/jpeg;base64,${equipament.image}`} alt="" />
                <p>Modelo: {equipament.model}</p>
                <p>Empresa: {equipament.company}</p>
              </DivEquip>
            );

            setDashEquipaments((prvDiv) => [...prvDiv, Div]);
          });
          break;
        } else {
          setMessage(true);
          setTypeError("Falta de Dados");
          setMessageError("Nenhum equipamento Cadastrado");
          break;
        }
      case "change":
        setAlert(true);
        setMessagetitle("Caso de Troca de Equipamento");
        setMessageinfo1("1. Informar o Equipamento");
        setMessageinfo2("2. Justificar o motivo da troca");
        setProblemn("Trocar Equipamento");
        setAlertVerify(false);
        break;
    }
  }

  function selectUser() {
    const select = document.getElementById("select-user");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "adduser":
        setAlert(false);
        setFormNewUser(true);
        setFormDelUser(false);
        setProblemn("Criacao de usuario de rede");
        setAlertVerify(false);
        setMotivationContract("");
        setSectorNewUser("");
        setNewName("");
        break;
      case "deluser":
        setFormDelUser(true);
        setFormNewUser(false);
        setAlert(false);
        setProblemn("Exclusao de usuario de rede");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        setFormNewUser(false);
        setFormDelUser(false);
        setAlertVerify(false);
        break;
    }
  }

  function selectFolder() {
    const select = document.getElementById("select-folder");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "lib":
        setAlert(true);
        setMessagetitle("Caso de liberação de pasta");
        setMessageinfo1("1. Informar o diretorio completo da pasta");
        setMessageinfo2("2.Caso não seja o gestor responsavel pela pasta, anexar a autorização do mesmo");
        setProblemn("Liberar pasta");
        setAlertVerify(false);
        break;
      case "block":
        setAlert(true);
        setMessagetitle("Caso de bloqueio de pasta");
        setMessageinfo1("1. Informar o diretorio completo da pasta");
        setMessageinfo2("2.Caso não seja o gestor responsavel pela pasta, anexar a autorização do mesmo");
        setProblemn("Bloquear pasta");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        setMessagetitle("");
        setMessageinfo1("");
        setMessageinfo2("");
        break;
    }
  }

  function selectInternet() {
    const select = document.getElementById("select-internet");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "lib":
        setAlert(true);
        setMessagetitle("Caso de liberação de site");
        setMessageinfo1("1. Informar o link completo do site");
        setMessageinfo2("2.Caso não seja o gestor da area, anexar a autorização do mesmo");
        setProblemn("Liberacao de site");
        setAlertVerify(false);
        break;
      case "block":
        setAlert(true);
        setMessagetitle("Caso de bloqueio de site");
        setMessageinfo1("1. Informar o link completo do site");
        setMessageinfo2("2.Caso não seja o gestor da area, anexar a autorização do mesmo");
        setProblemn("Bloqueio de site");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        setMessagetitle("");
        setMessageinfo1("");
        setMessageinfo2("");
        break;
    }
  }

  function selectMotivation() {
    const option = document.querySelectorAll("input[name='motivation']");

    option.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        if (event.target.checked) {
          setMotivationContract(event.target.value);

          if (event.target.value === "other") {
            setMotivation(false);
          } else {
            setMotivation(true);
          }
        }
      });
    });
  }

  function selectMachine() {
    const option = document.querySelectorAll("input[name='machine']");

    option.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        if (event.target.checked) {
          if (event.target.value === "yes") {
            setMachine(false);
            setNecessaryMachine(false);
          } else if (event.target.value === "no") {
            setMachine(true);
            setMessagetitle("Caso de não haver maquina");
            setMessageinfo1("1. Deverá ser feita uma solicitação de equipamento");
            setMessageinfo2("");
            setNecessaryMachine(true);
          }
        }
      });
    });
  }

  function submitTicket(event) {
    event.preventDefault();

    if (respectiveArea.length === 0) {
      setAlertVerify(true);
      setMessagetitle("Selecione a Área Responsável pelo Chamado");
      return;
    } else if (sector.length === 0) {
      setAlertVerify(true);
      setMessagetitle("Selecione um tipo de ocorrencia");
      return;
    } else if (occurrence.length === 0) {
      setAlertVerify(true);
      setMessagetitle("Selecione um tipo de problema");
      return;
    } else if (problemn.length === 0) {
      setAlertVerify(true);
      setMessagetitle("Selecione o problema em especifico");
      return;
    } else {
      setAlertVerify(false);
    }
    // * Caso nenhuma opção seja selecionada mostra mensagem e não cria o chamado

    // Obter o dia, mês e ano da dataUser atual
    var dataUserAtual = new Date();

    var dia = dataUserAtual.getDate();
    var mes = dataUserAtual.getMonth() + 1; // Os meses em JavaScript são indexados a partir de zero, por isso é necessário adicionar 1
    var ano = dataUserAtual.getFullYear();
    function adicionaZero(numero) {
      if (numero < 10) {
        return "0" + numero;
      }
      return numero;
    }
    var horaFormatada = adicionaZero(dataUserAtual.getHours()) + ":" + adicionaZero(dataUserAtual.getMinutes());

    // Formatar a dataUser no formato dd/mm/yy

    // Formatando para dataUser BR
    var dataUserFormatada = ano + "-" + ("0" + mes).slice(-2) + "-" + ("0" + dia).slice(-2) + " " + horaFormatada;

    let Status;
    let NewDatesAlocate = [];

    const formdataUser = new FormData();

    var total_size = 0;

    if (filename.length > 0) {
      formdataUser.append("ticketRequester", dataUser.name);
      formdataUser.append("department", dataUser.department);
      formdataUser.append("mail", dataUser.mail);
      formdataUser.append("company", dataUser.company);
      formdataUser.append("sector", sector);
      formdataUser.append("occurrence", occurrence);
      formdataUser.append("problemn", problemn);
      formdataUser.append("observation", observation);
      formdataUser.append("start_date", dataUserFormatada);
      formdataUser.append("PID", dataUser.pid);
      formdataUser.append("respective_area", respectiveArea);
      for (let i = 0; i < fileimg.length; i++) {
        const file = fileimg[i];
        total_size += file.size;
        formdataUser.append("image", file);
      }
    } else if (daysForAlocate.length > 0) {
      for (let dateObj of daysForAlocate) {
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObj.getFullYear();
        const dateFormated = `${year}-${month}-${day}`;
        NewDatesAlocate.push(dateFormated);
      }
      formdataUser.append("ticketRequester", dataUser.name);
      formdataUser.append("department", dataUser.departament);
      formdataUser.append("mail", dataUser.mail);
      formdataUser.append("company", dataUser.company);
      formdataUser.append("sector", sector);
      formdataUser.append("occurrence", occurrence);
      formdataUser.append("problemn", problemn);
      formdataUser.append("observation", observation);
      formdataUser.append("start_date", dataUserFormatada);
      formdataUser.append("PID", dataUser.pid);
      formdataUser.append("respective_area", respectiveArea);
      formdataUser.append("id_equipament", equipamentSelected);
      formdataUser.append("days_alocated", NewDatesAlocate);
    } else if (problemn === "Criacao de usuario de rede") {
      if (newname.length < 2) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Nome Obrigatório!!!");
        return;
      }

      if (sectornewuser.length < 1) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Setor Obrigatório!!!");
        return;
      }

      if (motivationContract.length < 2) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Tipo da Contratação Obrigatória!!!");
        return;
      }

      if (necessaryMachine === undefined) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Obigatório informar a necessidade de Máquina!!!");
        return;
      }

      if (companynewUser.length < 2) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Obigatório informar a Unidade!!!");
        return;
      }

      if (centralcost.length < 2) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Obigatório Informar Centro de Custo!!!");
        return;
      }

      if (jobtitlenewuser.length < 2) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Obigatório Informar o cargo!!!");
        return;
      }

      formdataUser.append("ticketRequester", dataUser.name);
      formdataUser.append("department", dataUser.departament);
      formdataUser.append("mail", dataUser.mail);
      formdataUser.append("company", dataUser.company);
      formdataUser.append("sector", sector);
      formdataUser.append("occurrence", occurrence);
      formdataUser.append("problemn", problemn);
      formdataUser.append("observation", observation);
      formdataUser.append("start_date", dataUserFormatada);
      formdataUser.append("PID", dataUser.pid);
      formdataUser.append("respective_area", respectiveArea);
      formdataUser.append("new_user", newname);
      formdataUser.append("sector_new_user", sectornewuser);
      formdataUser.append("where_from", motivationContract);
      formdataUser.append("machine_new_user", necessaryMachine);
      formdataUser.append("company_new_user", companynewUser);
      formdataUser.append("software_new_user", softwareNewUser);
      formdataUser.append("cost_center", centralcost);
      formdataUser.append("job_title_new_user", jobtitlenewuser);
      formdataUser.append("start_work_new_user", selectedDay);
      formdataUser.append("copy_profile_new_user", copyUser);
    } else if (problemn === "Exclusao de usuario de rede") {
      if (newname.length < 2) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Nome Obrigatório!!!");
        return;
      }
      if (maildelegation.length < 2) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("E-mail para transferencia Obrigatório!!!");
        return;
      }
      if (dirsave.length < 2) {
        setMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Obrigatório informar onde os dados devem ser salvos!!!");
        return;
      }
      formdataUser.append("ticketRequester", dataUser.name);
      formdataUser.append("department", dataUser.departament);
      formdataUser.append("mail", dataUser.mail);
      formdataUser.append("company", dataUser.company);
      formdataUser.append("sector", sector);
      formdataUser.append("occurrence", occurrence);
      formdataUser.append("problemn", problemn);
      formdataUser.append("observation", observation);
      formdataUser.append("start_date", dataUserFormatada);
      formdataUser.append("PID", dataUser.pid);
      formdataUser.append("respective_area", respectiveArea);
      formdataUser.append("new_user", newname);
      formdataUser.append("mail_tranfer", maildelegation);
      formdataUser.append("old_files", dirsave);
      formdataUser.append("start_work_new_user", selectedDay);
    } else {
      formdataUser.append("ticketRequester", dataUser.name);
      formdataUser.append("department", dataUser.departament);
      formdataUser.append("mail", dataUser.mail);
      formdataUser.append("company", dataUser.company);
      formdataUser.append("sector", sector);
      formdataUser.append("occurrence", occurrence);
      formdataUser.append("problemn", problemn);
      formdataUser.append("observation", observation);
      formdataUser.append("start_date", dataUserFormatada);
      formdataUser.append("PID", dataUser.pid);
      formdataUser.append("respective_area", respectiveArea);
    }
    if (total_size > 10 * 1024 * 1024) {
      setMessage(true);
      setTypeError("Capacidade Máxima Ultrapassada");
      setMessageError("Capacidade Máxima de Arquivos Anexado é de 10MB");
      return;
    }
    fetch("submitTicket/", {
      method: "POST",
      headers: {
        "X-CSRFToken": csrfToken,
      },
      body: formdataUser,
    })
      .then((response) => {
        Status = response.status;
        return response.json();
      })
      .then((dataUser) => {
        if (Status === 403) {
          setMessage(true);
          setTypeError("Falta de dados");
          setMessageError("PID Não cadastrado, favor contatar equipe de TI");
          return window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } else if (Status === 200) {
          window.location.reload(true);
        } else if (Status === 320) {
          setMessage(true);
          setTypeError("Dados Inválidos");
          setMessageError("Arquivo Anexado Inválido");
          return window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } else if (Status === 310) {
          setDaysForAlocate([]);
          const dates = dataUser.dates;
          var btn = document.querySelectorAll(".rdp-day");
          btn.forEach(function (b) {
            for (var i = 0; i < dates.length; i++) {
              var date = dates[i].slice(-2);
              if (b.textContent === date) {
                b.classList.remove("rdp-day_selected");
                b.disabled = true;
              }
            }
          });

          setMessage(true);
          setTypeError("Dados Inválidos");
          setMessageError("dataUser de Alocação Indisponivel");
          return window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function closeMessage() {
    return setMessage(false);
  }

  function inputDrop() {
    setInputDropControl(true);
    setInputManualControl(false);
    file_name = fileimg.map((fileItem) => fileItem.name);
    setFileName(file_name);

    const paragraphs = file_name.map((fileName, index) => (
      <DivNameFile>
        <PNameFile key={index} className="text-break">
          {fileName}
        </PNameFile>
        <p>
          {(() => {
            const file = fileimg[index];
            const sizeInBytes = file.size;
            let size;
            let unit;

            if (sizeInBytes >= 1024 * 1024) {
              size = sizeInBytes / (1024 * 1024);
              unit = "MB";
            } else {
              size = sizeInBytes / 1024;
              unit = "KB";
            }

            return `${size.toFixed(2)} ${unit}`;
          })()}
        </p>
        <BtnFile
          type="button"
          onClick={() => {
            fileimg.splice(index, 1);
            inputDrop();
            const divider = document.getElementById("divider");
            divider.classList.remove("lineTop");
          }}
        >
          <ImgFile src={Exclude} alt="Excluir arquivo" />
        </BtnFile>
      </DivNameFile>
    ));

    const Div = <div className="w-100">{paragraphs}</div>;

    setNameOnDropFiles(Div);
    setFileSizeNotify(true);
  }

  function inputManual(event) {
    setInputDropControl(false);
    setInputManualControl(true);

    const files = event.target.files;
    console.log(files);

    const fileList = Array.from(files);
    setArrayInput(fileList);

    const drop = document.getElementById("drop");
    drop.classList.add("hidden");
    const divider = document.getElementById("divider");
    divider.classList.add("lineTop");

    const paragraphs = fileList.map((file, index) => (
      <DivNameFile>
        <PNameFile key={index} className="text-break">
          {file.name}
        </PNameFile>
        <BtnFile
          type="button"
          onClick={() => {
            const drop = document.getElementById("drop");
            drop.classList.remove("hidden");
            const divider = document.getElementById("divider");
            divider.classList.remove("lineTop");
            removeFile(index);
          }}
        >
          <ImgFile src={Exclude} alt="Excluir arquivo" />
        </BtnFile>
      </DivNameFile>
    ));

    setNameOnInputFiles(paragraphs);
    setFileSizeNotify(true);
  }

  function removeFile(indexToRemove) {
    if (arrayInput.length < 1) {
      setNameOnInputFiles("");
      setInputManualControl(false);
      return;
    }
    const updatedFiles = arrayInput.filter((_, index) => index !== indexToRemove);
    setArrayInput(updatedFiles);

    const updatedParagraphs = updatedFiles.map((file, index) => (
      <DivNameFile key={index}>
        <PNameFile className="text-break">{file.name}</PNameFile>
        <BtnFile type="button" onClick={() => removeFile(index)}>
          <ImgFile src={Exclude} alt="Excluir arquivo" />
        </BtnFile>
      </DivNameFile>
    ));

    const drop = document.getElementById("drop");
    drop.classList.add("hidden");
    const divider = document.getElementById("divider");
    divider.classList.add("lineTop");

    setNameOnInputFiles(updatedParagraphs);
  }

  function selectCompanyEquip() {
    setDashEquipaments("");
    const select = document.getElementById("select-company-equip");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "csc":
        equipaments.forEach((equipament) => {
          if (equipament.company === "CSC") {
            const Div = (
              <DivEquip
                className="equipsclass"
                onClick={(event) =>
                  selectEquipament({
                    element: event.currentTarget,
                    id: equipament.id,
                  })
                }
              >
                <ImageEquip src={`dataUser:image/jpeg;base64,${equipament.image}`} alt="" />
                <p>Modelo: {equipament.model}</p>
                <p>Empresa: {equipament.company}</p>
              </DivEquip>
            );

            setDashEquipaments((prvDiv) => [...prvDiv, Div]);
          }
        });
        break;
      case "fiber":
        equipaments.forEach((equipament) => {
          if (equipament.company === "FIBER") {
            const Div = (
              <DivEquip
                className="equipsclass"
                onClick={(event) =>
                  selectEquipament({
                    element: event.currentTarget,
                    id: equipament.id,
                  })
                }
              >
                <ImageEquip src={`dataUser:image/jpeg;base64,${equipament.image}`} alt="" />
                <p>Modelo: {equipament.model}</p>
                <p>Empresa: {equipament.company}</p>
              </DivEquip>
            );

            setDashEquipaments((prvDiv) => [...prvDiv, Div]);
          }
        });
        break;
      case "vera":
        equipaments.forEach((equipament) => {
          if (equipament.company === "VERA") {
            const Div = (
              <DivEquip
                className="equipsclass"
                onClick={(event) =>
                  selectEquipament({
                    element: event.currentTarget,
                    id: equipament.id,
                  })
                }
              >
                <ImageEquip src={`dataUser:image/jpeg;base64,${equipament.image}`} alt="" />
                <p>Modelo: {equipament.model}</p>
                <p>Empresa: {equipament.company}</p>
              </DivEquip>
            );

            setDashEquipaments((prvDiv) => [...prvDiv, Div]);
          }
        });
        break;
      case "ropes":
        equipaments.forEach((equipament) => {
          if (equipament.company === "ROPES") {
            const Div = (
              <DivEquip
                className="equipsclass"
                onClick={(event) =>
                  selectEquipament({
                    element: event.currentTarget,
                    id: equipament.id,
                  })
                }
              >
                <ImageEquip src={`dataUser:image/jpeg;base64,${equipament.image}`} alt="" />
                <p>Modelo: {equipament.model}</p>
                <p>Empresa: {equipament.company}</p>
              </DivEquip>
            );

            setDashEquipaments((prvDiv) => [...prvDiv, Div]);
          }
        });
        break;
      case "mna":
        equipaments.forEach((equipament) => {
          if (equipament.company === "MNA") {
            const Div = (
              <DivEquip
                className="equipsclass"
                onClick={(event) =>
                  selectEquipament({
                    element: event.currentTarget,
                    id: equipament.id,
                  })
                }
              >
                <ImageEquip src={`dataUser:image/jpeg;base64,${equipament.image}`} alt="" />
                <p>Modelo: {equipament.model}</p>
                <p>Empresa: {equipament.company}</p>
              </DivEquip>
            );

            setDashEquipaments((prvDiv) => [...prvDiv, Div]);
          }
        });
        break;
      case "all":
        equipaments.forEach((equipament) => {
          const Div = (
            <DivEquip
              className="equipsclass"
              onClick={(event) =>
                selectEquipament({
                  element: event.currentTarget,
                  id: equipament.id,
                })
              }
            >
              <ImageEquip src={`dataUser:image/jpeg;base64,${equipament.image}`} alt="" />
              <p>Modelo: {equipament.model}</p>
              <p>Empresa: {equipament.company}</p>
            </DivEquip>
          );

          setDashEquipaments((prvDiv) => [...prvDiv, Div]);
        });
        break;
    }
  }

  function nameNewUser(event) {
    setNewName(event.target.value);
  }

  function emailDelegation(event) {
    setMailDelegation(event.target.value);
  }

  function saveU(event) {
    setDirSave(event.target.value);
  }

  function SectorNewUser(event) {
    setSectorNewUser(event.target.value);
  }

  function selectCompanyNW() {
    const select = document.getElementById("select-company-new-user");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "0":
        setCompanyNewUser("CSC");
        break;
      case "1":
        setCompanyNewUser("Fiberliners");
        break;
      case "2":
        setCompanyNewUser("Valmicro");
        break;
      case "3":
        setCompanyNewUser("Valmicro – Mipel Sul");
        break;
      case "4":
        setCompanyNewUser("Ropes");
        break;
      case "5":
        setCompanyNewUser("Escritorio Corporativo SP");
        break;
      case "6":
        setCompanyNewUser("Valmicro SP");
        break;
      case "7":
        setCompanyNewUser("Mipel Microfusão");
        break;
    }
  }

  function softwaresNewUser() {
    var Array = [];
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(function (checkbox) {
      if (checkbox.checked) {
        Array.push(checkbox.value);
      }
    });

    return setSoftwareNewUser(Array);
  }

  function centralCost(event) {
    setCentralCost(event.target.value);
  }

  function jobTitleFunct(event) {
    setJobTitleNewUser(event.target.value);
  }

  function nameCopyUser(event) {
    setCopyUser(event.target.value);
  }

  return (
    <Div className={theme}>
      {navbar && <NavBar Name={dataUser.name} JobTitle={dataUser.job_title} />}
      {loading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <Loading />
        </div>
      )}
      {message && (
        <div className="position-fixed top-50 start-50 translate-middle z-3">
          <Message TypeError={typeError} MessageError={messageError} CloseMessage={closeMessage} />
        </div>
      )}
      {dashboard && (
        <Form className={`mx-auto d-flex flex-column align-items-center justify-content-around ${themeTicket}`}>
          <div className="mb-3">
            <input type="hidden" name="_csrf" value={csrfToken} />
            <label htmlFor="nameInput" className="form-label">
              Nome
            </label>
            <Input type="name" className="form-control" id="nameInput" value={dataUser.name} disabled />
          </div>
          <div className="mb-3">
            <label htmlFor="departmentInput" className="form-label">
              Departamento
            </label>
            <Input type="text" className="form-control" id="departmentInput" value={dataUser.departament || ""} disabled={dataUser.departament} />
          </div>
          <div className="mb-3">
            <label htmlFor="mailInput" className="form-label">
              Email
            </label>
            <Input type="text" className="form-control" id="mailInput" value={dataUser.mail || ""} disabled={dataUser.mail} />
          </div>
          <div className="mb-3">
            <label htmlFor="companyInput" className="form-label">
              Empresa
            </label>
            <Input type="text" className="form-control" id="companyInput" value={dataUser.company || ""} disabled={dataUser.company} />
          </div>
          <Select className="form-select mb-3" aria-label="Default select example" id="selectAR" onChange={selectARes}>
            <option value="none" disabled selected>
              Seleciona a Área Respectiva
            </option>
            <option value="TI">TI</option>
          </Select>
          {respectiveTI && (
            <Select className="form-select mb-3" aria-label="Default select example" id="select-Form" onChange={handleSelect}>
              <option value="none" disabled selected>
                Selecione o tipo de ocorrência
              </option>
              <option value="infra">Infra</option>
              <option value="sistema">Sistema</option>
            </Select>
          )}
          {infra && (
            <Select className="form-select mb-3" aria-label="Default select example" id="select-error" onChange={selectProblem}>
              <option value="none" disabled selected>
                Selecione o problema ocorrido
              </option>
              <option value="backup">Backup/Restore</option>
              <option value="mail">E-mail</option>
              <option value="equip">Equipamento</option>
              {(dataUser.helpdesk === "Admin" || dataUser.helpdesk === "Gestor") && <option value="user">Gerenciamento de usuário</option>}
              <option value="internet">Internet</option>
              <option value="folder">Pasta</option>
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
              <option value="domin">Liberar domínio de E-mail</option>
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
              <option value="alocate">Alocar equipamento</option>
              <option value="change">Trocar Equipamento</option>
            </Select>
          )}
          {user && (
            <Select className="form-select mb-3" aria-label="Default select example" id="select-user" onChange={selectUser}>
              <option value="none" disabled selected>
                Selecione o problema ocorrido
              </option>
              <option value="adduser">Criar usuário de rede</option>
              <option value="deluser">Excluir usuário de rede</option>
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
          {formnewuser && (
            <div className="p-2 bg-light w-75 mb-3">
              <div className="input-group mb-3 mt-3">
                <span className="input-group-text" id="basic-addon1">
                  Nome
                </span>
                <input type="text" className="form-control" placeholder="NOME COMPLETO!!" aria-label="newname" aria-describedby="basic-addon1" onKeyDown={nameNewUser} />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon1">
                  Setor
                </span>
                <input type="text" className="form-control w-75" placeholder="Setor/Departamento" aria-label="newdepartamen" aria-describedby="basic-addon1" onKeyDown={SectorNewUser} />
              </div>
              <div className="d-flex flex-column justify-content-start">
                <div className="d-flex mb-3">
                  <InputRadio type="radio" className="form-check-input" name="motivation" onChange={selectMotivation} value="new" />
                  <span>Nova contratação</span>
                </div>
                <div className="d-flex mb-3">
                  <InputRadio type="radio" className="form-check-input" name="motivation" onChange={selectMotivation} value="old" />
                  <span>Remanejamento para outro setor/departamento</span>
                </div>
                <div className="d-flex mb-3">
                  <InputRadio type="radio" className="form-check-input" name="motivation" onChange={selectMotivation} value="other" />
                  <span>Outro</span>
                  <Input2 type="text" className="form-control" disabled={motivation} />
                </div>
              </div>
              <div className="d-flex flex-column justify-content-start mb-3">
                <span className="mb-3">Existe equipamento de informática disponivel no setor para o usuário?</span>
                <div className="d-flex">
                  <InputRadio type="radio" className="form-check-input" name="machine" onChange={selectMachine} value="yes" />
                  <span className="mb-3">SIM</span>
                </div>
                <div className="d-flex mb-3">
                  <InputRadio type="radio" className="form-check-input" name="machine" onChange={selectMachine} value="no" />
                  <span>NÃO</span>
                </div>
                {machine && (
                  <Div2 className="alert alert-warning d-flex flex-column text-center" role="alert">
                    <h5>{messagetitle}</h5>
                    <span>{messageinfo1}</span>
                  </Div2>
                )}
              </div>
              <div className="w-100 ">
                <span>Informe a unidade</span>
                <Select className="form-select mb-3 mt-3 text-center mx-auto" aria-label="Default select example" id="select-company-new-user" onChange={selectCompanyNW}>
                  <option value="none" selected>
                    Selecione a unidade
                  </option>
                  <option value="0">CSC</option>
                  <option value="1">Fiberliners</option>
                  <option value="2">Valmicro</option>
                  <option value="3">Valmicro – Mipel Sul</option>
                  <option value="4">Ropes</option>
                  <option value="5">Escritorio Corporativo SP</option>
                  <option value="6">Valmicro SP</option>
                  <option value="7">Mipel Microfusão</option>
                </Select>
              </div>
              <div className="d-flex flex-column mb-3">
                <span className="mb-1">Informe o sistemas/softwares que requisitam usuario/licença</span>
                <div className="mx-auto">
                  <ul className="list-group">
                    <li className="list-group-item">
                      <input className="form-check-input me-1" type="checkbox" value="SAP" onChange={softwaresNewUser} />
                      <label className="form-check-label" htmlFor="SAP">
                        SAP
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input className="form-check-input me-1" type="checkbox" value="MBI" onChange={softwaresNewUser} />
                      <label className="form-check-label" htmlFor="MBI">
                        MBI / NetTerm
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input className="form-check-input me-1" type="checkbox" value="Solfis" onChange={softwaresNewUser} />
                      <label className="form-check-label" htmlFor="Solfis">
                        Synchro Fiscal (Solfis)
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input className="form-check-input me-1" type="checkbox" value="DFe Manager" onChange={softwaresNewUser} />
                      <label className="form-check-label" htmlFor="DFe">
                        Synchro NFe (DFe Manager)
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input className="form-check-input me-1" type="checkbox" value="Metadados" onChange={softwaresNewUser} />
                      <label className="form-check-label" htmlFor="Metadados">
                        Metadados
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input className="form-check-input me-1" type="checkbox" value="AutoCad" onChange={softwaresNewUser} />
                      <label className="form-check-label" htmlFor="AutoCad">
                        AutoCad
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input className="form-check-input me-1" type="checkbox" value="SolidWorks" onChange={softwaresNewUser} />
                      <label className="form-check-label" htmlFor="SolidWorks">
                        SolidWorks
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input className="form-check-input me-1" type="checkbox" value="Office" onChange={softwaresNewUser} />
                      <label className="form-check-label" htmlFor="Office">
                        Office
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <span>Centro de custo:</span>
                <input type="number" className="form-control" onKeyDown={centralCost} />
              </div>
              <div className="mb-3">
                <span>Cargo/Função:</span>
                <input type="text" className="form-control" onKeyDown={jobTitleFunct} />
              </div>
              <div className="text-center">
                <span className="mb-3">dataUser de inicio das atitividades:</span>
                <Calendar className="mt-3 d-flex">
                  <DayPicker fixedWeeks showOutsideDays selected={selectedDay} onSelect={setSelectedDay} mode="single" footer={footerDay} locale={ptBR} />
                </Calendar>
              </div>
              <div>
                <span className="mb-2">
                  Informe um usuário que tenha o perfil semelhante ao do contratado. Inclua observações caso exista alguma restrição na cópia deste, ou digite nenhum caso não exista semelhante.(terá
                  as mesmas permissões)
                </span>
                <input type="text" className="form-control mt-3" placeholder="NOME COMPLETO!!!" onKeyDown={nameCopyUser} />
              </div>
            </div>
          )}
          {formdeluser && (
            <div className="p-2 bg-light w-75 mb-3 d-flex flex-column">
              <div className="input-group mb-3 mt-3">
                <span className="input-group-text" id="basic-addon1">
                  Nome
                </span>
                <input type="text" className="form-control" placeholder="NOME COMPLETO!!" aria-label="delname" aria-describedby="basic-addon1" onKeyDown={nameNewUser} />
              </div>
              <span>Informar para quem os e-mails deverão ser direcionados</span>
              <div className="input-group mb-3 mt-3">
                <span className="input-group-text" id="basic-addon1">
                  email
                </span>
                <input type="mail" className="form-control" placeholder="NOME COMPLETO!!" aria-label="delmail" aria-describedby="basic-addon1" onKeyDown={emailDelegation} />
              </div>
              <span className="mb-3">Informar diretorio onde deverá ser salvo os documentos da pasta pessoal U</span>
              <input type="text" className="form-control mb-3" placeholder="informar diretorio completo" onKeyDown={saveU} />
              <span className="mb-3">Informar a dataUser que deverá ser feito o bloqueio do usuario</span>
              <div className="t-3 d-flex justify-content-center">
                <DayPicker fixedWeeks showOutsideDays selected={selectedDay} onSelect={setSelectedDay} mode="single" footer={footerDay} locale={ptBR} />
              </div>
            </div>
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
          {alert && (
            <div className="alert alert-info d-flex flex-column" role="alert">
              <h5 className="fw-bold">{messagetitle}</h5>
              <span>{messageinfo1}</span>
              <span>{messageinfo2}</span>
            </div>
          )}
          {alertverify && (
            <div className="alert alert-danger" role="alert">
              <h5 className="fw-bold">{messagetitle}</h5>
            </div>
          )}
          {alocate && (
            <div className="w-100">
              <div className="d-flex justify-content-center">
                <Select className="form-select mb-3" aria-label="Default select example" id="select-company-equip" onChange={selectCompanyEquip}>
                  <option value="none" disabled selected>
                    Selecione uma Unidade
                  </option>
                  <option value="csc">CSC</option>
                  <option value="fiber">Fiber</option>
                  <option value="vera">Vera</option>
                  <option value="ropes">Ropes</option>
                  <option value="mna">MNA</option>
                  <option value="all">Todas Unidades</option>
                </Select>
              </div>
              <div className="d-flex flex-wrap justify-content-center">{dashequipaments}</div>
            </div>
          )}
          {dateequip && (
            <div className="justify-content-center text-center">
              <span className="mb-1 mt-2">dataUser de alocagem do Equipamento:</span>
              <Calendar className="mt-3">
                <DayPicker mode="multiple" selected={daysForAlocate} onSelect={setDaysForAlocate} footer={footerAlocate} locale={ptBR} />
              </Calendar>
            </div>
          )}
          <div className="d-flex flex-column">
            <div className="form-floating mb-3 mx-auto">
              <Textarea className="form-control" id="floatingTextarea2" onChange={getObservation}></Textarea>
              <label htmlFor="floatingTextarea2">Observação</label>
            </div>
            <h3 className="text-center mt-1">Upload de Arquivo</h3>
            <DivUpload className="upload">
              <div className="upload-files">
                <HeaderFiles>
                  <PFiles className="position-relative pointer w-100 h-100">
                    <IMGFile2 src={Cloud} alt="" />
                    <InputFile className="w-100 h-100 position-absolute pointer" type="file" multiple onChange={inputManual} />
                    <Span1 className="up">up</Span1>
                    <Span2 className="load">load</Span2>
                  </PFiles>
                </HeaderFiles>
                <BodyFiles id="drop" onDrop={() => inputDrop()}>
                  <IMGFile src={File} alt="" />
                  <PFiles2 className="pointer-none">
                    <B1>Arraste e Solte</B1> os arquivos aqui para fazer upload{" "}
                  </PFiles2>
                  <InputFiles type="file" id="inputManual" multiple />
                </BodyFiles>
                <FooterFiles>
                  <Divider className="divider overflow-hidden" id="divider">
                    <Span3 className="mb-3">FILE</Span3>
                  </Divider>
                  {inputDropControl && (
                    <ListFiles className="list-files" id="list-files">
                      {nameOnDropFiles}
                    </ListFiles>
                  )}
                  {inputManualControl && <ListFiles>{nameOnInutFiles}</ListFiles>}
                  {fileSizeNotify && <div className="mt-2">Limite Máximo de arquivo é de 20MB</div>}
                </FooterFiles>
              </div>
            </DivUpload>
          </div>
          <input type="submit" className="importar btn btn-primary mt-3 mb-3" onClick={submitTicket} value={"Enviar"} />
        </Form>
      )}
    </Div>
  );
}
