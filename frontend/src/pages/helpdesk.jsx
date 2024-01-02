import React, { useState, useEffect } from "react";
import NavBar from "../components/navbar";
import "../styles/bootstrap/css/bootstrap.css";
import {
  Div,
  Form,
  Input,
  Input2,
  Select,
  Div2,
  Calendar,
  Textarea,
  ImageEquip,
  DivEquip,
  InputRadio,
  PNameFile,
  DivNameFile,
  ImgFile,
  BtnFile,
} from "../styles/helpdeskStyle";
import {
  DivUpload,
  HeaderFiles,
  PFiles,
  IMGFile,
  Span1,
  Span2,
  BodyFiles,
  PFiles2,
  B1,
  InputFiles,
  IMGFile2,
  FooterFiles,
  Divider,
  Span3,
  ListFiles,
} from "../styles/Equipment_RegistrationStyle";
import { DayPicker } from "react-day-picker";
import ptBR from "date-fns/locale/pt";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import Loading from "../components/loading";
import Message from "../components/message";
import Cloud from "../images/components/cloud-uploading.png";
import Exclude from "../images/components/close.png";

export default function Helpdesk() {
  useEffect(() => {
    const Theme = localStorage.getItem("Theme");
    if (Theme === null) {
      localStorage.setItem("Theme", "black");
      return ThemeBlack();
    } else if (Theme === "black") {
      return ThemeBlack();
    } else if (Theme === "light") {
      return ThemeLight();
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [csrf, SetCSRFToken] = useState("");
  const [messagetitle, setMessagetitle] = useState("");
  const [messageinfo1, setmessageinfo1] = useState("");
  const [messageinfo2, setmessageinfo2] = useState("");
  const [sector, setsector] = useState("");
  const [occurrence, setOccurrence] = useState("");
  const [problemn, setProblemn] = useState("");
  const [observation, setObservation] = useState("");
  const [loading, SetLoading] = useState(true);
  const [motivation, setMotivation] = useState(true);
  const [alertverify, setAlertVerify] = useState(false);
  const [navbar, SetNavbar] = useState(false);
  const [dashboard, SetDashboard] = useState(false);
  const [infra, setInfra] = useState(false);
  const [system, SetSystem] = useState(false);
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
  const [Data, SetData] = useState([]);
  const [message, SetMessage] = useState(false);
  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [respectiveTI, setRespectiveTI] = useState(false);
  const [respectiveArea, setRespectiveArea] = useState("");
  const [sap, SetSAP] = useState(false);
  const [mbi, SetMBI] = useState(false);
  const [synch, SetSynch] = useState(false);
  const [office, SetOffice] = useState(false);
  const [eng, SetEng] = useState(false);
  const [alocate, SetAlocate] = useState(false);
  const [equipaments, SetEquipaments] = useState();
  const [dashequipaments, SetDashEquipaments] = useState("");
  const [filename, SetFileName] = useState([]);
  const [fileimg, SetFileImg] = useState([]);
  const [uploadRuninng, SetUploadRunning] = useState();
  const [dateequip, setDateEquip] = useState(false);
  const [daysForAlocate, SetDaysForAlocate] = useState([]);
  const [equipamentSelected, SetEquipamentSelected] = useState("");
  const [newname, SetNewName] = useState("");
  const [sectornewuser, SetSectorNewUser] = useState("");
  const [motivationContract, SetMotivationContract] = useState("");
  const [necessaryMachine, SetNecessaryMachine] = useState();
  const [companynewUser, SetCompanyNewUser] = useState("");
  const [softwareNewUser, SetSoftwareNewUser] = useState([]);
  const [centralcost, SetCentralCost] = useState("");
  const [jobtitlenewuser, SetJobTitleNewUser] = useState("");
  const [copyUser, SetCopyUser] = useState("");
  const [maildelegation, SetMailDelegation] = useState("");
  const [dirsave, SetDirSave] = useState("");
  const [nameOnDropFiles, SetNameOnDropFiles] = useState("");
  const [theme, SetTheme] = useState("");
  const [themeTicket, SetThemeTicket] = useState("");

  function ThemeBlack() {
    console.log("teste");
    SetThemeTicket("");
    return SetTheme("themeBlack");
  }

  function ThemeLight() {
    SetThemeTicket("themeLightTicket");
    return SetTheme("themeLight");
  }

  const footerDay = selectedDay ? (
    <p>Você selecionou {format(selectedDay, "PPP")}</p>
  ) : (
    <p>Selecione uma data</p>
  );

  const footerAlocate =
    daysForAlocate.length >= 1 ? (
      <p>Você alocou por {daysForAlocate.length} dia(s).</p>
    ) : (
      <p>Selecione um ou mais dias.</p>
    );

  let file_name = [];

  useEffect(() => {
    fetch("", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: {},
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        SetEquipaments(data.equipaments);
        SetCSRFToken(data.token);
        return SetData(data.data);
      })
      .catch((err) => {
        return console.error("Erro na solicitação:", err);
      });

    return;
  }, []);

  useEffect(() => {
    if (Data && Object.keys(Data).length > 0) {
      SetLoading(false);
      SetNavbar(true);
      SetDashboard(true);
      return SetUploadRunning("Running");
    } else {
      return;
    }
  }, [Data]);

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

          $("#drop").classList.add("hidden");
          $("footer").classList.add("hasFiles");
          $(".importar").classList.add("active");
          setTimeout(() => {
            $("#list-files").innerHTML = template;
          }, 1000);

          Object.keys(files).forEach((file) => {
            let load = 2000 + file * 2000; // fake load
            setTimeout(() => {
              $(`.file--${file}`)
                .querySelector(".progress")
                .classList.remove("active");
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
            SetFileImg((itens) => [...itens, evt.dataTransfer.files[i]]);
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
    } else {
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadRuninng]);

  function selectARes() {
    const select = document.getElementById("selectAR");

    const option = select.options[select.selectedIndex].value;

    if (option === "TI") {
      setAlert(false);
      setRespectiveTI(true);
      setRespectiveArea("TI");
      setAlertVerify(false);
      return respectiveArea;
    } else if (option === "none") {
      setRespectiveTI(false);
      setAlert(false);
      return;
    }
  }

  function handleSelect() {
    const select = document.getElementById("select-Form");

    const option = select.options[select.selectedIndex].value;

    if (option === "infra") {
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
      SetSystem(false);
      SetMBI(false);
      SetSAP(false);
      SetOffice(false);
      SetSynch(false);
      SetEng(false);
      SetAlocate(false);
      setDateEquip(false);
      return;
    } else if (option === "sistema") {
      SetSystem(true);
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
      SetMBI(false);
      SetSAP(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      SetAlocate(false);
      setDateEquip(false);
      return;
    } else if (option === "none") {
      setInfra(false);
      SetSystem(false);
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
      SetMBI(false);
      SetSAP(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      SetAlocate(false);
      setDateEquip(false);
      return;
    }
  }

  function selectProblem() {
    const select = document.getElementById("select-error");

    const option = select.options[select.selectedIndex].value;

    if (option === "backup") {
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
      SetSAP(false);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      SetAlocate(false);
      setDateEquip(false);
      return;
    } else if (option === "mail") {
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
      SetSAP(false);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      SetAlocate(false);
      setDateEquip(false);
      return;
    } else if (option === "equip") {
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
      SetAlocate(false);
      setOccurrence("Equipamento");
      SetSAP(false);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      setDateEquip(false);
      return;
    } else if (option === "user") {
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
      SetAlocate(false);
      setOccurrence("Gerenciamento de Usuario");
      SetSAP(false);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      setDateEquip(false);
      return;
    } else if (option === "internet") {
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
      SetAlocate(false);
      setDateEquip(false);
      setOccurrence("Internet");
      SetSAP(false);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      setDateEquip(false);
      return;
    } else if (option === "folder") {
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
      SetAlocate(false);
      setDateEquip(false);
      setOccurrence("Permissão");
      SetSAP(false);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      setDateEquip(false);
      return;
    } else if (option === "none") {
      setBackup(false);
      setAlert(false);
      setMail(false);
      setEquip(false);
      setUser(false);
      setFormNewUser(false);
      setFormDelUser(false);
      setInternet(false);
      setFolder(false);
      SetSAP(false);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      SetAlocate(false);
      setDateEquip(false);
      return;
    } else if (option === "sap") {
      SetSAP(true);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
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
      SetEng(false);
      SetAlocate(false);
      setDateEquip(false);
      return;
    } else if (option === "mbi") {
      SetMBI(true);
      SetSAP(false);
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
      SetSynch(false);
      SetOffice(false);
      SetAlocate(false);
      SetEng(false);
      setDateEquip(false);
      return;
    } else if (option === "synch") {
      SetSynch(true);
      SetMBI(false);
      SetSAP(false);
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
      SetOffice(false);
      SetAlocate(false);
      SetEng(false);
      setDateEquip(false);
      return;
    } else if (option === "office") {
      SetOffice(true);
      SetSynch(false);
      SetMBI(false);
      SetSAP(false);
      setBackup(false);
      setAlert(false);
      setMail(false);
      setEquip(false);
      setUser(false);
      SetAlocate(false);
      setFormNewUser(false);
      setFormDelUser(false);
      setInternet(false);
      setFolder(false);
      SetEng(false);
      setOccurrence("Office");
      setDateEquip(false);
      return;
    } else if (option === "eng") {
      SetEng(true);
      SetOffice(false);
      SetSynch(false);
      SetMBI(false);
      SetSAP(false);
      setBackup(false);
      SetAlocate(false);
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
      return;
    }
  }

  function selectSynch() {
    const selectSynch = document.getElementById("select-synch");
    const optionSynch = selectSynch.options[selectSynch.selectedIndex].value;

    if (optionSynch === "user") {
      setAlert(true);
      setMessagetitle("Caso de Criação/exclusão de usuários");
      setmessageinfo1(
        "1. Informar o usuário que deverá ser criado ou excluido"
      );
      setmessageinfo2("2. Informar os acessos que o mesmo poderá utilizar");
      setProblemn("Criação/exclusão usuário");
      setAlertVerify(false);
      return;
    } else if (optionSynch === "access") {
      setAlert(true);
      setMessagetitle("Caso de Liberação/bloqueio de acessos");
      setmessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
      setmessageinfo2("");
      setProblemn("Liberação/bloqueio de acessos");
      setAlertVerify(false);
      return;
    } else if (optionSynch === "quest") {
      setAlert(true);
      setMessagetitle("Caso de Dúvidas operacionais");
      setmessageinfo1("1. Descreva o que deseja saber");
      setmessageinfo2("");
      setProblemn("Dúvidas operacionais");
      setAlertVerify(false);
      return;
    } else if (optionSynch === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
    } else if (optionSynch === "none") {
      setAlert(false);
      return;
    }
  }

  function selectMBI() {
    const select_MBI = document.getElementById("select-mbi");
    const optionMBI = select_MBI.options[select_MBI.selectedIndex].value;

    if (optionMBI === "user") {
      setAlert(true);
      setMessagetitle("Caso de Criação/exclusão de usuários");
      setmessageinfo1(
        "1. Informar o usuário que deverá ser criado ou excluido"
      );
      setmessageinfo2("2. Informar os acessos que o mesmo poderá utilizar");
      setProblemn("Criação/exclusão usuário");
      setAlertVerify(false);
      return;
    } else if (optionMBI === "access") {
      setAlert(true);
      setMessagetitle("Caso de Liberação/bloqueio de acessos");
      setmessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
      setmessageinfo2("");
      setProblemn("Liberação/bloqueio de acessos");
      setAlertVerify(false);
      return;
    } else if (optionMBI === "quest") {
      setAlert(true);
      setMessagetitle("Caso de Dúvidas operacionais");
      setmessageinfo1("1. Descreva o que deseja saber");
      setmessageinfo2("");
      setProblemn("Dúvidas operacionais");
      setAlertVerify(false);
      return;
    } else if (optionMBI === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
      return;
    } else if (optionMBI === "none") {
      setAlert(false);
      return;
    }
  }

  function selectSAP() {
    const selectSAP = document.getElementById("select-sap");
    const optionSAP = selectSAP.options[selectSAP.selectedIndex].value;

    if (optionSAP === "user") {
      setAlert(true);
      setMessagetitle("Caso de Criação/exclusão de usuários");
      setmessageinfo1(
        "1. Informar o usuário que deverá ser criado ou excluido"
      );
      setmessageinfo2("2. Informar os acessos que o mesmo poderá utilizar");
      setProblemn("Criação/exclusão usuário");
      setAlertVerify(false);
      return;
    } else if (optionSAP === "access") {
      setAlert(true);
      setMessagetitle("Caso de Liberação/bloqueio de acessos");
      setmessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
      setmessageinfo2("");
      setProblemn("Liberação/bloqueio de acessos");
      setAlertVerify(false);
      return;
    } else if (optionSAP === "quest") {
      setAlert(true);
      setMessagetitle("Caso de Dúvidas operacionais");
      setmessageinfo1("1. Descreva o que deseja saber");
      setmessageinfo2("");
      setProblemn("Dúvidas operacionais");
      setAlertVerify(false);
      return;
    } else if (optionSAP === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
      return;
    } else if (optionSAP === "none") {
      setAlert(false);
      return;
    }
  }

  function selectOffice() {
    const selectOffice = document.getElementById("select-office");
    const optionOffice = selectOffice.options[selectOffice.selectedIndex].value;

    if (optionOffice === "buy") {
      setAlert(true);
      setMessagetitle("Aquisição de software/licenciamento");
      setmessageinfo1("1. Informe para quem será a licença");
      setmessageinfo2("");
      setProblemn("Aquisição de software/licenciamento");
      setAlertVerify(false);
      return;
    } else if (optionOffice === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
      return;
    } else if (optionOffice === "none") {
      setAlert(false);
      return;
    }
  }

  function getObservation() {
    const textArea = document.getElementById("floatingTextarea2");

    setObservation(textArea.value);

    return;
  }

  function selectEng() {
    const selectEng = document.getElementById("select-eng");
    const optionEng = selectEng.options[selectEng.selectedIndex].value;

    if (optionEng === "buy") {
      setAlert(true);
      setMessagetitle("Aquisição de software/licenciamento");
      setmessageinfo1("1. Informe para quem será a licença");
      setmessageinfo2("");
      setProblemn("Aquisição de software/licenciamento");
      setAlertVerify(false);
      return;
    } else if (optionEng === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
      return;
    } else if (optionEng === "none") {
      setAlert(false);
      return;
    }
  }

  function selectBackup() {
    const selectBackup = document.getElementById("select-backup");
    const optionBackup = selectBackup.options[selectBackup.selectedIndex].value;

    if (optionBackup === "pasta") {
      setAlert(true);
      setMessagetitle("Caso de pasta");
      setmessageinfo1("1. Informar o caminho completo da pasta");
      setmessageinfo2("2. Informar a data de criação e exclusão do arquivo");
      setProblemn("Restaurar pasta");
      setAlertVerify(false);
      return;
    } else if (optionBackup === "mail") {
      setAlert(true);
      setMessagetitle("Caso de e-mail");
      setmessageinfo1("1. Descreva o que deseja restaurar");
      setmessageinfo2("");
      setProblemn("Restaurar e-mail");
      setAlertVerify(false);
      return;
    } else if (optionBackup === "none") {
      setAlert(false);
      return;
    }
  }

  function selectMail() {
    const selectMail = document.getElementById("select-mail");
    const optionMail = selectMail.options[selectMail.selectedIndex].value;

    if (optionMail === "maxcap") {
      setAlert(false);
      setProblemn("Aumentar capacidade de e-mail");
      setAlertVerify(false);
      return;
    } else if (optionMail === "conect") {
      setAlert(true);
      setMessagetitle("Caso de email não conecta na internet");
      setmessageinfo1("1. Informar mensagem de erro");
      setmessageinfo2("");
      setProblemn("Problema com conexão");
      setAlertVerify(false);
      return;
    } else if (optionMail === "none") {
      setAlert(false);
      return;
    } else if (optionMail === "domin") {
      setAlert(true);
      setMessagetitle("Caso de liberar domínion de e-mail");
      setmessageinfo1("1. Informar dóminio, exemplo @lupatech.com.br");
      setmessageinfo2("");
      setProblemn("Liberar domínio");
      setAlertVerify(false);
      return;
    }
  }

  function selectEquipament({ element, id }) {
    SetEquipamentSelected(id);
    const allElements = document.querySelectorAll(".equipsclass");
    allElements.forEach((el) => {
      el.style.border = "none";
    });

    element.style.border = "2px solid #5FDD9D";
    setDateEquip(true);
    return;
  }

  function selectEquip() {
    const selectEquip = document.getElementById("select-equip");
    const optionEquip = selectEquip.options[selectEquip.selectedIndex].value;

    if (optionEquip === "off") {
      SetAlocate(false);
      setAlert(true);
      setMessagetitle("Caso de computador não ligar");
      setmessageinfo1(
        "1. Informar o usuario e setor de onde fica o equipamento"
      );
      setmessageinfo2("");
      setProblemn("Equipamento não liga");
      setAlertVerify(false);
      return;
    } else if (optionEquip === "printer") {
      SetAlocate(false);
      setAlert(true);
      setMessagetitle("Caso de problema com a impressora");
      setmessageinfo1("1. Informar onde a impressora está localizada");
      setmessageinfo2("2. Informar menssagem de erro que aparece");
      setProblemn("Problema com a impressora");
      setAlertVerify(false);
      return;
    } else if (optionEquip === "roaming") {
      SetAlocate(false);
      setAlert(true);
      setMessagetitle("Caso de troca de local de trabalho");
      setmessageinfo1(
        "1. Informar se no local existe ponto de rede e de energia"
      );
      setmessageinfo2("");
      setProblemn("Mudanca de local de trabalho");
      setAlertVerify(false);
      return;
    } else if (optionEquip === "usb") {
      SetAlocate(false);
      setAlert(true);
      setMessagetitle("Caso de liberação/bloqueio de USB");
      setmessageinfo1("1. Justificar a solicitação");
      setmessageinfo2(
        "2. Caso não seja o gestor da area, anexar a autorização do mesmo"
      );
      setProblemn("USB");
      setAlertVerify(false);
      return;
    } else if (optionEquip === "none") {
      setAlert(false);
      SetAlocate(false);
      return;
    } else if (optionEquip === "alocate") {
      SetDashEquipaments("");
      setAlert(true);
      setMessagetitle("Caso de Alocação de equipamento");
      setmessageinfo1("1. Selecionar o equipamento desejado");
      setmessageinfo2(
        "2. Informar a data e a necessidade de equipamentos adicionais como teclado, etc..."
      );
      setAlertVerify(false);
      SetAlocate(true);
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
              <ImageEquip
                src={`data:image/jpeg;base64,${equipament.image}`}
                alt=""
              />
              <p>Modelo: {equipament.model}</p>
              <p>Empresa: {equipament.company}</p>
            </DivEquip>
          );

          SetDashEquipaments((prvDiv) => [...prvDiv, Div]);
        });
        return;
      } else {
        setTypeError("Falta de Dados");
        setMessageError("Nenhum equipamento Cadastrado");
        return;
      }
    } else if (optionEquip === "change") {
      setAlert(true);
      setMessagetitle("Caso de Troca de Equipamento");
      setmessageinfo1("1. Informar o Equipamento");
      setmessageinfo2("2. Justificar o motivo da troca");
      setProblemn("Trocar Equipamento");
      setAlertVerify(false);
      return;
    }
  }

  function selectUser() {
    const select = document.getElementById("select-user");
    const option = select.options[select.selectedIndex].value;

    if (option === "adduser") {
      setAlert(false);
      setFormNewUser(true);
      setFormDelUser(false);
      setProblemn("Criacao de usuario de rede");
      setAlertVerify(false);
      SetMotivationContract("");
      SetSectorNewUser("");
      SetNewName("");
      return;
    } else if (option === "deluser") {
      setFormDelUser(true);
      setFormNewUser(false);
      setAlert(false);
      setProblemn("Exclusao de usuario de rede");
      setAlertVerify(false);
      return;
    } else if (option === "none") {
      setAlert(false);
      setFormNewUser(false);
      setFormDelUser(false);
      setAlertVerify(false);
      return;
    }
  }

  function selectFolder() {
    const select = document.getElementById("select-folder");
    const option = select.options[select.selectedIndex].value;

    if (option === "lib") {
      setAlert(true);
      setMessagetitle("Caso de liberação de pasta");
      setmessageinfo1("1. Informar o diretorio completo da pasta");
      setmessageinfo2(
        "2.Caso não seja o gestor responsavel pela pasta, anexar a autorização do mesmo"
      );
      setProblemn("Liberar pasta");
      setAlertVerify(false);
      return;
    } else if (option === "block") {
      setAlert(true);
      setMessagetitle("Caso de bloqueio de pasta");
      setmessageinfo1("1. Informar o diretorio completo da pasta");
      setmessageinfo2(
        "2.Caso não seja o gestor responsavel pela pasta, anexar a autorização do mesmo"
      );
      setProblemn("Bloquear pasta");
      setAlertVerify(false);
      return;
    } else if (option === "none") {
      setAlert(false);
      setMessagetitle("");
      setmessageinfo1("");
      setmessageinfo2("");
      return;
    }
  }

  function selectInternet() {
    const select = document.getElementById("select-internet");
    const option = select.options[select.selectedIndex].value;

    if (option === "lib") {
      setAlert(true);
      setMessagetitle("Caso de liberação de site");
      setmessageinfo1("1. Informar o link completo do site");
      setmessageinfo2(
        "2.Caso não seja o gestor da area, anexar a autorização do mesmo"
      );
      setProblemn("Liberacao de site");
      setAlertVerify(false);
      return;
    } else if (option === "block") {
      setAlert(true);
      setMessagetitle("Caso de bloqueio de site");
      setmessageinfo1("1. Informar o link completo do site");
      setmessageinfo2(
        "2.Caso não seja o gestor da area, anexar a autorização do mesmo"
      );
      setProblemn("Bloqueio de site");
      setAlertVerify(false);
      return;
    } else if (option === "none") {
      setAlert(false);
      setMessagetitle("");
      setmessageinfo1("");
      setmessageinfo2("");
      return;
    }
  }

  function selectMotivation() {
    const option = document.querySelectorAll("input[name='motivation']");

    option.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        if (event.target.checked) {
          const selectedValue = event.target.value;

          SetMotivationContract(selectedValue);

          if (selectedValue === "other") {
            setMotivation(false);
          } else {
            setMotivation(true);
          }
        }
      });
    });
    return;
  }

  function selectMachine() {
    const option = document.querySelectorAll("input[name='machine']");

    option.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        if (event.target.checked) {
          const selectedValue = event.target.value;
          if (selectedValue === "yes") {
            setMachine(false);
            SetNecessaryMachine(false);
            return;
          } else if (selectedValue === "no") {
            setMachine(true);
            setMessagetitle("Caso de não haver maquina");
            setmessageinfo1(
              "1. Deverá ser feita uma solicitação de equipamento"
            );
            setmessageinfo2("");
            SetNecessaryMachine(true);
            return;
          }
        }
      });
    });
  }

  function submitTicket(event) {
    event.preventDefault();

    // * Caso nenhuma opção seja selecionada mostra mensagem e não cria o chamado

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

    // Obter o dia, mês e ano da data atual
    var dataAtual = new Date();

    var dia = dataAtual.getDate();
    var mes = dataAtual.getMonth() + 1; // Os meses em JavaScript são indexados a partir de zero, por isso é necessário adicionar 1
    var ano = dataAtual.getFullYear();

    // Formatar a data no formato dd/mm/yy

    // Formatando para data BR
    var dataFormatada =
      ano + "-" + ("0" + mes).slice(-2) + "-" + ("0" + dia).slice(-2);

    ano.toString().slice(-2);
    // Formatando para data BR

    let Status;
    let NewDatesAlocate = [];

    const formData = new FormData();

    var total_size = 0;

    if (filename.length > 0) {
      formData.append("ticketRequester", Data.name);
      formData.append("department", Data.department);
      formData.append("mail", Data.mail);
      formData.append("company", Data.company);
      formData.append("phone", Data.phone);
      formData.append("sector", sector);
      formData.append("occurrence", occurrence);
      formData.append("problemn", problemn);
      formData.append("observation", observation);
      formData.append("start_date", dataFormatada);
      formData.append("PID", Data.pid);
      formData.append("respective_area", respectiveArea);
      for (let i = 0; i < fileimg.length; i++) {
        const file = fileimg[i];
        total_size += file.size;
        formData.append("image", file);
      }
    } else if (daysForAlocate.length > 0) {
      for (let dateObj of daysForAlocate) {
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        const year = dateObj.getFullYear();
        const dateFormated = `${year}-${month}-${day}`;
        NewDatesAlocate.push(dateFormated);
      }
      formData.append("ticketRequester", Data.name);
      formData.append("department", Data.department);
      formData.append("mail", Data.mail);
      formData.append("company", Data.company);
      formData.append("phone", Data.phone);
      formData.append("sector", sector);
      formData.append("occurrence", occurrence);
      formData.append("problemn", problemn);
      formData.append("observation", observation);
      formData.append("start_date", dataFormatada);
      formData.append("PID", Data.pid);
      formData.append("respective_area", respectiveArea);
      formData.append("id_equipament", equipamentSelected);
      formData.append("days_alocated", NewDatesAlocate);
    } else if (problemn === "Criacao de usuario de rede") {
      if (newname.length < 2) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Nome Obrigatório!!!");
        return;
      }

      if (sectornewuser.length < 1) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Setor Obrigatório!!!");
        return;
      }

      if (motivationContract.length < 2) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Tipo da Contratação Obrigatória!!!");
        return;
      }

      if (necessaryMachine === undefined) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Obigatório informar a necessidade de Máquina!!!");
        return;
      }

      if (companynewUser.length < 2) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Obigatório informar a Unidade!!!");
        return;
      }

      if (centralcost.length < 2) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Obigatório Informar Centro de Custo!!!");
        return;
      }

      if (jobtitlenewuser.length < 2) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Obigatório Informar o cargo!!!");
        return;
      }

      formData.append("ticketRequester", Data.name);
      formData.append("department", Data.department);
      formData.append("mail", Data.mail);
      formData.append("company", Data.company);
      formData.append("phone", Data.phone);
      formData.append("sector", sector);
      formData.append("occurrence", occurrence);
      formData.append("problemn", problemn);
      formData.append("observation", observation);
      formData.append("start_date", dataFormatada);
      formData.append("PID", Data.pid);
      formData.append("respective_area", respectiveArea);
      formData.append("new_user", newname);
      formData.append("sector_new_user", sectornewuser);
      formData.append("where_from", motivationContract);
      formData.append("machine_new_user", necessaryMachine);
      formData.append("company_new_user", companynewUser);
      formData.append("software_new_user", softwareNewUser);
      formData.append("cost_center", centralcost);
      formData.append("job_title_new_user", jobtitlenewuser);
      formData.append("start_work_new_user", selectedDay);
      formData.append("copy_profile_new_user", copyUser);
    } else if (problemn === "Exclusao de usuario de rede") {
      if (newname.length < 2) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError("Nome Obrigatório!!!");
        return;
      }
      if (maildelegation.length < 2) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError("E-mail para transferencia Obrigatório!!!");
        return;
      }
      if (dirsave.length < 2) {
        SetMessage(true);
        setTypeError("Falta de dados");
        setMessageError(
          "Obrigatório informar onde os dados devem ser salvos!!!"
        );
        return;
      }
      formData.append("ticketRequester", Data.name);
      formData.append("department", Data.department);
      formData.append("mail", Data.mail);
      formData.append("company", Data.company);
      formData.append("phone", Data.phone);
      formData.append("sector", sector);
      formData.append("occurrence", occurrence);
      formData.append("problemn", problemn);
      formData.append("observation", observation);
      formData.append("start_date", dataFormatada);
      formData.append("PID", Data.pid);
      formData.append("respective_area", respectiveArea);
      formData.append("new_user", newname);
      formData.append("mail_tranfer", maildelegation);
      formData.append("old_files", dirsave);
      formData.append("start_work_new_user", selectedDay);
    } else {
      formData.append("ticketRequester", Data.name);
      formData.append("department", Data.department);
      formData.append("mail", Data.mail);
      formData.append("company", Data.company);
      formData.append("phone", Data.phone);
      formData.append("sector", sector);
      formData.append("occurrence", occurrence);
      formData.append("problemn", problemn);
      formData.append("observation", observation);
      formData.append("start_date", dataFormatada);
      formData.append("PID", Data.pid);
      formData.append("respective_area", respectiveArea);
    }
    if (total_size > 10 * 1024 * 1024) {
      SetMessage(true);
      setTypeError("Capacidade Máxima Ultrapassada");
      setMessageError("Capacidade Máxima de Arquivos Anexado é de 10MB");
      return;
    }
    fetch("submitTicket/", {
      method: "POST",
      headers: {
        "X-CSRFToken": csrf,
      },
      body: formData,
    })
      .then((response) => {
        Status = response.status;
        return response.json();
      })
      .then((data) => {
        if (Status === 403) {
          SetMessage(true);
          setTypeError("Falta de dados");
          setMessageError("PID Não cadastrado, favor contatar equipe de TI");
          return window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } else if (Status === 200) {
          SetMessage(false);
          return window.location.reload();
        } else if (Status === 320) {
          SetMessage(true);
          setTypeError("Dados Inválidos");
          setMessageError("Arquivo Anexado Inválido");
          return window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } else if (Status === 310) {
          SetDaysForAlocate([]);
          const dates = data.dates;
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

          SetMessage(true);
          setTypeError("Dados Inválidos");
          setMessageError("Data de Alocação Indisponivel");
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
    return SetMessage(false);
  }

  function inputDrop() {
    file_name = fileimg.map((fileItem) => fileItem.name);

    SetFileName(file_name);

    const paragraphs = file_name.map((fileName, index) => (
      <DivNameFile>
        <PNameFile key={index} className="text-break">
          {fileName}
        </PNameFile>
        <BtnFile
          type="button"
          onClick={() => {
            fileimg.splice(index, 1);
            inputDrop();
          }}
        >
          <ImgFile src={Exclude} alt="Excluir arquivo" />
        </BtnFile>
      </DivNameFile>
    ));

    const Div = <div className="w-100">{paragraphs}</div>;

    SetNameOnDropFiles(Div);

    return nameOnDropFiles;
  }

  function selectCompanyEquip() {
    SetDashEquipaments("");
    const select = document.getElementById("select-company-equip");
    const option = select.options[select.selectedIndex].value;

    if (option === "csc") {
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
              <ImageEquip
                src={`data:image/jpeg;base64,${equipament.image}`}
                alt=""
              />
              <p>Modelo: {equipament.model}</p>
              <p>Empresa: {equipament.company}</p>
            </DivEquip>
          );

          SetDashEquipaments((prvDiv) => [...prvDiv, Div]);
        }
      });
    } else if (option === "fiber") {
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
              <ImageEquip
                src={`data:image/jpeg;base64,${equipament.image}`}
                alt=""
              />
              <p>Modelo: {equipament.model}</p>
              <p>Empresa: {equipament.company}</p>
            </DivEquip>
          );

          SetDashEquipaments((prvDiv) => [...prvDiv, Div]);
        }
      });
    } else if (option === "vera") {
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
              <ImageEquip
                src={`data:image/jpeg;base64,${equipament.image}`}
                alt=""
              />
              <p>Modelo: {equipament.model}</p>
              <p>Empresa: {equipament.company}</p>
            </DivEquip>
          );

          SetDashEquipaments((prvDiv) => [...prvDiv, Div]);
        }
      });
    } else if (option === "ropes") {
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
              <ImageEquip
                src={`data:image/jpeg;base64,${equipament.image}`}
                alt=""
              />
              <p>Modelo: {equipament.model}</p>
              <p>Empresa: {equipament.company}</p>
            </DivEquip>
          );

          SetDashEquipaments((prvDiv) => [...prvDiv, Div]);
        }
      });
    } else if (option === "mna") {
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
              <ImageEquip
                src={`data:image/jpeg;base64,${equipament.image}`}
                alt=""
              />
              <p>Modelo: {equipament.model}</p>
              <p>Empresa: {equipament.company}</p>
            </DivEquip>
          );

          SetDashEquipaments((prvDiv) => [...prvDiv, Div]);
        }
      });
    } else if (option === "all") {
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
            <ImageEquip
              src={`data:image/jpeg;base64,${equipament.image}`}
              alt=""
            />
            <p>Modelo: {equipament.model}</p>
            <p>Empresa: {equipament.company}</p>
          </DivEquip>
        );

        SetDashEquipaments((prvDiv) => [...prvDiv, Div]);
      });
    }
    return;
  }

  function nameNewUser(event) {
    var nameUser = event.target.value;
    SetNewName(nameUser);
    return;
  }

  function emailDelegation(event) {
    var mailDele = event.target.value;
    SetMailDelegation(mailDele);
    return;
  }

  function saveU(event) {
    var dir = event.target.value;
    SetDirSave(dir);
    return;
  }

  function SectorNewUser(event) {
    var company = event.target.value;
    SetSectorNewUser(company);
    return;
  }

  function selectCompanyNW() {
    const select = document.getElementById("select-company-new-user");
    const option = select.options[select.selectedIndex].value;

    if (option === "0") {
      SetCompanyNewUser("CSC");
      return;
    } else if (option === "1") {
      SetCompanyNewUser("Fiberliners");
      return;
    } else if (option === "2") {
      SetCompanyNewUser("Valmicro");
      return;
    } else if (option === "3") {
      SetCompanyNewUser("Valmicro – Mipel Sul");
      return;
    } else if (option === "4") {
      SetCompanyNewUser("Ropes");
      return;
    } else if (option === "5") {
      SetCompanyNewUser("Escritorio Corporativo SP");
      return;
    } else if (option === "6") {
      SetCompanyNewUser("Valmicro SP");
      return;
    } else if (option === "7") {
      SetCompanyNewUser("Mipel Microfusão");
      return;
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

    return SetSoftwareNewUser(Array);
  }

  function centralCost(event) {
    var cost = event.target.value;

    return SetCentralCost(cost);
  }

  function jobTitleFunct(event) {
    var job = event.target.value;

    return SetJobTitleNewUser(job);
  }

  function nameCopyUser(event) {
    var copy = event.target.value;

    return SetCopyUser(copy);
  }

  return (
    <Div className={theme}>
      {navbar && <NavBar Name={Data.name} JobTitle={Data.job_title} />}
      {loading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <Loading />
        </div>
      )}
      {message && (
        <div className="position-fixed top-50 start-50 translate-middle z-3">
          <Message
            TypeError={typeError}
            MessageError={messageError}
            CloseMessage={closeMessage}
          />
        </div>
      )}
      {dashboard && (
        <Form
          className={`mx-auto d-flex flex-column align-items-center justify-content-around ${themeTicket}`}
        >
          <div className="mb-3">
            <input type="hidden" name="_csrf" value={csrf} />
            <label htmlFor="nameInput" className="form-label">
              Nome
            </label>
            <Input
              type="name"
              className="form-control"
              id="nameInput"
              value={Data.name}
              disabled
            />
          </div>
          <div className="mb-3">
            <label htmlFor="departmentInput" className="form-label">
              Departamento
            </label>
            <Input
              type="text"
              className="form-control"
              id="departmentInput"
              value={Data.department || ""}
              disabled={Data.department}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="mailInput" className="form-label">
              Email
            </label>
            <Input
              type="text"
              className="form-control"
              id="mailInput"
              value={Data.mail || ""}
              disabled={Data.mail}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="companyInput" className="form-label">
              Empresa
            </label>
            <Input
              type="text"
              className="form-control"
              id="companyInput"
              value={Data.company || ""}
              disabled={Data.company}
            />
          </div>
          <Select
            className="form-select mb-3"
            aria-label="Default select example"
            id="selectAR"
            onChange={selectARes}
          >
            <option value="none" disabled selected>
              Seleciona a Área Respectiva
            </option>
            <option value="TI">TI</option>
          </Select>
          {respectiveTI && (
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-Form"
              onChange={handleSelect}
            >
              <option value="none" disabled selected>
                Selecione o tipo de ocorrência
              </option>
              <option value="infra">Infra</option>
              <option value="sistema">Sistema</option>
            </Select>
          )}
          {infra && (
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-error"
              onChange={selectProblem}
            >
              <option value="none" disabled selected>
                Selecione o problema ocorrido
              </option>
              <option value="backup">Backup/Restore</option>
              <option value="mail">E-mail</option>
              <option value="equip">Equipamento</option>
              {(Data.helpdesk === "Admin" || Data.helpdesk === "Gestor") && (
                <option value="user">Gerenciamento de usuário</option>
              )}
              <option value="internet">Internet</option>
              <option value="folder">Pasta</option>
            </Select>
          )}
          {backup && (
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-backup"
              onChange={selectBackup}
            >
              <option value="none" disabled selected>
                Selecione o problema ocorrido
              </option>
              <option value="pasta">Pasta/Arquivo</option>
              <option value="mail">E-mail</option>
            </Select>
          )}
          {mail && (
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-mail"
              onChange={selectMail}
            >
              <option value="none" disabled selected>
                Selecione o problema ocorrido
              </option>
              <option value="maxcap">Aumentar capacidade</option>
              <option value="conect">Não conecta</option>
              <option value="domin">Liberar domínio de E-mail</option>
            </Select>
          )}
          {equip && (
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-equip"
              onChange={selectEquip}
            >
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
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-user"
              onChange={selectUser}
            >
              <option value="none" disabled selected>
                Selecione o problema ocorrido
              </option>
              <option value="adduser">Criar usuário de rede</option>
              <option value="deluser">Excluir usuário de rede</option>
            </Select>
          )}
          {internet && (
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-internet"
              onChange={selectInternet}
            >
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
                <input
                  type="text"
                  className="form-control"
                  placeholder="NOME COMPLETO!!"
                  aria-label="newname"
                  aria-describedby="basic-addon1"
                  onKeyDown={nameNewUser}
                />
              </div>
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon1">
                  Setor
                </span>
                <input
                  type="text"
                  className="form-control w-75"
                  placeholder="Setor/Departamento"
                  aria-label="newdepartamen"
                  aria-describedby="basic-addon1"
                  onKeyDown={SectorNewUser}
                />
              </div>
              <div className="d-flex flex-column justify-content-start">
                <div className="d-flex mb-3">
                  <InputRadio
                    type="radio"
                    className="form-check-input"
                    name="motivation"
                    onChange={selectMotivation}
                    value="new"
                  />
                  <span>Nova contratação</span>
                </div>
                <div className="d-flex mb-3">
                  <InputRadio
                    type="radio"
                    className="form-check-input"
                    name="motivation"
                    onChange={selectMotivation}
                    value="old"
                  />
                  <span>Remanejamento para outro setor/departamento</span>
                </div>
                <div className="d-flex mb-3">
                  <InputRadio
                    type="radio"
                    className="form-check-input"
                    name="motivation"
                    onChange={selectMotivation}
                    value="other"
                  />
                  <span>Outro</span>
                  <Input2
                    type="text"
                    className="form-control"
                    disabled={motivation}
                  />
                </div>
              </div>
              <div className="d-flex flex-column justify-content-start mb-3">
                <span className="mb-3">
                  Existe equipamento de informática disponivel no setor para o
                  usuário?
                </span>
                <div className="d-flex">
                  <InputRadio
                    type="radio"
                    className="form-check-input"
                    name="machine"
                    onChange={selectMachine}
                    value="yes"
                  />
                  <span className="mb-3">SIM</span>
                </div>
                <div className="d-flex mb-3">
                  <InputRadio
                    type="radio"
                    className="form-check-input"
                    name="machine"
                    onChange={selectMachine}
                    value="no"
                  />
                  <span>NÃO</span>
                </div>
                {machine && (
                  <Div2
                    className="alert alert-warning d-flex flex-column text-center"
                    role="alert"
                  >
                    <h5>{messagetitle}</h5>
                    <span>{messageinfo1}</span>
                  </Div2>
                )}
              </div>
              <div className="w-100 ">
                <span>Informe a unidade</span>
                <Select
                  className="form-select mb-3 mt-3 text-center mx-auto"
                  aria-label="Default select example"
                  id="select-company-new-user"
                  onChange={selectCompanyNW}
                >
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
                <span className="mb-1">
                  Informe o sistemas/softwares que requisitam usuario/licença
                </span>
                <div className="mx-auto">
                  <ul className="list-group">
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value="SAP"
                        onChange={softwaresNewUser}
                      />
                      <label className="form-check-label" htmlFor="SAP">
                        SAP
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value="MBI"
                        onChange={softwaresNewUser}
                      />
                      <label className="form-check-label" htmlFor="MBI">
                        MBI / NetTerm
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value="Solfis"
                        onChange={softwaresNewUser}
                      />
                      <label className="form-check-label" htmlFor="Solfis">
                        Synchro Fiscal (Solfis)
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value="DFe Manager"
                        onChange={softwaresNewUser}
                      />
                      <label className="form-check-label" htmlFor="DFe">
                        Synchro NFe (DFe Manager)
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value="Metadados"
                        onChange={softwaresNewUser}
                      />
                      <label className="form-check-label" htmlFor="Metadados">
                        Metadados
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value="AutoCad"
                        onChange={softwaresNewUser}
                      />
                      <label className="form-check-label" htmlFor="AutoCad">
                        AutoCad
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value="SolidWorks"
                        onChange={softwaresNewUser}
                      />
                      <label className="form-check-label" htmlFor="SolidWorks">
                        SolidWorks
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value="Office"
                        onChange={softwaresNewUser}
                      />
                      <label className="form-check-label" htmlFor="Office">
                        Office
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <span>Centro de custo:</span>
                <input
                  type="number"
                  className="form-control"
                  onKeyDown={centralCost}
                />
              </div>
              <div className="mb-3">
                <span>Cargo/Função:</span>
                <input
                  type="text"
                  className="form-control"
                  onKeyDown={jobTitleFunct}
                />
              </div>
              <div className="text-center">
                <span className="mb-3">Data de inicio das atitividades:</span>
                <Calendar className="mt-3 d-flex">
                  <DayPicker
                    fixedWeeks
                    showOutsideDays
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    mode="single"
                    footer={footerDay}
                    locale={ptBR}
                  />
                </Calendar>
              </div>
              <div>
                <span className="mb-2">
                  Informe um usuário que tenha o perfil semelhante ao do
                  contratado. Inclua observações caso exista alguma restrição na
                  cópia deste, ou digite nenhum caso não exista semelhante.(terá
                  as mesmas permissões)
                </span>
                <input
                  type="text"
                  className="form-control mt-3"
                  placeholder="NOME COMPLETO!!!"
                  onKeyDown={nameCopyUser}
                />
              </div>
            </div>
          )}
          {formdeluser && (
            <div className="p-2 bg-light w-75 mb-3 d-flex flex-column">
              <div className="input-group mb-3 mt-3">
                <span className="input-group-text" id="basic-addon1">
                  Nome
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="NOME COMPLETO!!"
                  aria-label="delname"
                  aria-describedby="basic-addon1"
                  onKeyDown={nameNewUser}
                />
              </div>
              <span>
                Informar para quem os e-mails deverão ser direcionados
              </span>
              <div className="input-group mb-3 mt-3">
                <span className="input-group-text" id="basic-addon1">
                  email
                </span>
                <input
                  type="mail"
                  className="form-control"
                  placeholder="NOME COMPLETO!!"
                  aria-label="delmail"
                  aria-describedby="basic-addon1"
                  onKeyDown={emailDelegation}
                />
              </div>
              <span className="mb-3">
                Informar diretorio onde deverá ser salvo os documentos da pasta
                pessoal U
              </span>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="informar diretorio completo"
                onKeyDown={saveU}
              />
              <span className="mb-3">
                Informar a data que deverá ser feito o bloqueio do usuario
              </span>
              <div className="t-3 d-flex justify-content-center">
                <DayPicker
                  fixedWeeks
                  showOutsideDays
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  mode="single"
                  footer={footerDay}
                  locale={ptBR}
                />
              </div>
            </div>
          )}
          {folder && (
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-folder"
              onChange={selectFolder}
            >
              <option value="none" disabled selected>
                Selecione o problema ocorrido
              </option>
              <option value="lib">Liberação de Pasta</option>
              <option value="block">Bloqueio de Pasta</option>
            </Select>
          )}
          {system && (
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-error"
              onChange={selectProblem}
            >
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
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-sap"
              onChange={selectSAP}
            >
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
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-mbi"
              onChange={selectMBI}
            >
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
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-synch"
              onChange={selectSynch}
            >
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
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-office"
              onChange={selectOffice}
            >
              <option value="none" disabled selected>
                Selecione o Problema
              </option>
              <option value="buy">Aquisição de software/licenciamento</option>
              <option value="error">Correção de falhas</option>
            </Select>
          )}
          {eng && (
            <Select
              className="form-select mb-3"
              aria-label="Default select example"
              id="select-eng"
              onChange={selectEng}
            >
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
                <Select
                  className="form-select mb-3"
                  aria-label="Default select example"
                  id="select-company-equip"
                  onChange={selectCompanyEquip}
                >
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
              <div className="d-flex flex-wrap justify-content-center">
                {dashequipaments}
              </div>
            </div>
          )}
          {dateequip && (
            <div className="justify-content-center text-center">
              <span className="mb-1 mt-2">
                Data de alocagem do Equipamento:
              </span>
              <Calendar className="mt-3">
                <DayPicker
                  mode="multiple"
                  selected={daysForAlocate}
                  onSelect={SetDaysForAlocate}
                  footer={footerAlocate}
                  locale={ptBR}
                />
              </Calendar>
            </div>
          )}
          <div className="d-flex flex-column">
            <div className="form-floating mb-3 mx-auto">
              <Textarea
                className="form-control"
                id="floatingTextarea2"
                onKeyUp={getObservation}
              ></Textarea>
              <label htmlFor="floatingTextarea2">Observação</label>
            </div>
            <h3 className="text-center mt-1">Upload de Arquivo</h3>
            <DivUpload className="upload">
              <div className="upload-files">
                <HeaderFiles>
                  <PFiles>
                    <IMGFile2 src={Cloud} alt="" />
                    <Span1 className="up">up</Span1>
                    <Span2 className="load">load</Span2>
                  </PFiles>
                </HeaderFiles>
                <BodyFiles
                  className="body"
                  id="drop"
                  onDrop={() => inputDrop()}
                >
                  <IMGFile src={File} alt="" />
                  <PFiles2 className="pointer-none">
                    <B1>Drag and drop</B1> files here to begin the upload
                  </PFiles2>
                  <InputFiles type="file" id="inputName" multiple />
                </BodyFiles>
                <FooterFiles id="footerFiles">
                  <Divider className="divider overflow-hidden" id="divider">
                    <Span3 className="mb-3">FILE</Span3>
                  </Divider>
                  <ListFiles className="list-files" id="list-files">
                    {nameOnDropFiles}
                  </ListFiles>
                </FooterFiles>
              </div>
            </DivUpload>
          </div>
          <input
            type="submit"
            className="importar btn btn-primary mt-3 mb-3"
            onClick={submitTicket}
            value={"Enviar"}
          />
        </Form>
      )}
    </Div>
  );
}
