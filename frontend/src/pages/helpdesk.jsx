import React, { useState, useEffect } from "react";
import NavBar from "../components/navbar";
import "../styles/bootstrap-5.3.0-dist/css/bootstrap.css";
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
} from "../styles/helpdeskStyle";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import Loading from "../components/loading";
import Message from "../components/message";

export default function Helpdesk() {
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

  const footerDay = selectedDay ? (
    <p>Você selecionou {format(selectedDay, "PPP")}</p>
  ) : (
    <p>Selecione uma data</p>
  );

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
        console.error("Erro na solicitação:", err);
      });

    return;
  }, []);

  useEffect(() => {
    if (Data && Object.keys(Data).length > 0) {
      SetLoading(false);
      SetNavbar(true);
      return SetDashboard(true);
    } else {
      return;
    }
  }, [Data]);

  function HelpdeskPage() {
    window.location.reload();
  }
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
      SetAlocate(false);
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
      SetAlocate(false);
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
      setOccurrence("Internet");
      SetSAP(false);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      SetAlocate(false);
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
      setOccurrence("Permissão");
      SetSAP(false);
      SetMBI(false);
      SetSynch(false);
      SetOffice(false);
      SetEng(false);
      SetAlocate(false);
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
    } else if (optionSynch === "access") {
      setAlert(true);
      setMessagetitle("Caso de Liberação/bloqueio de acessos");
      setmessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
      setmessageinfo2("");
      setProblemn("Liberação/bloqueio de acessos");
      setAlertVerify(false);
    } else if (optionSynch === "quest") {
      setAlert(true);
      setMessagetitle("Caso de Dúvidas operacionais");
      setmessageinfo1("1. Descreva o que deseja saber");
      setmessageinfo2("");
      setProblemn("Dúvidas operacionais");
      setAlertVerify(false);
    } else if (optionSynch === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
    } else if (optionSynch === "none") {
      setAlert(false);
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
    } else if (optionMBI === "access") {
      setAlert(true);
      setMessagetitle("Caso de Liberação/bloqueio de acessos");
      setmessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
      setmessageinfo2("");
      setProblemn("Liberação/bloqueio de acessos");
      setAlertVerify(false);
    } else if (optionMBI === "quest") {
      setAlert(true);
      setMessagetitle("Caso de Dúvidas operacionais");
      setmessageinfo1("1. Descreva o que deseja saber");
      setmessageinfo2("");
      setProblemn("Dúvidas operacionais");
      setAlertVerify(false);
    } else if (optionMBI === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
    } else if (optionMBI === "none") {
      setAlert(false);
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
    } else if (optionSAP === "access") {
      setAlert(true);
      setMessagetitle("Caso de Liberação/bloqueio de acessos");
      setmessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
      setmessageinfo2("");
      setProblemn("Liberação/bloqueio de acessos");
      setAlertVerify(false);
    } else if (optionSAP === "quest") {
      setAlert(true);
      setMessagetitle("Caso de Dúvidas operacionais");
      setmessageinfo1("1. Descreva o que deseja saber");
      setmessageinfo2("");
      setProblemn("Dúvidas operacionais");
      setAlertVerify(false);
    } else if (optionSAP === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
    } else if (optionSAP === "none") {
      setAlert(false);
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
    } else if (optionOffice === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
    } else if (optionOffice === "none") {
      setAlert(false);
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
    } else if (optionEng === "error") {
      setAlert(true);
      setMessagetitle("Caso de Correção de falhas");
      setmessageinfo1("1. Informe o Erro");
      setmessageinfo2("");
      setProblemn("Correção de falhas");
      setAlertVerify(false);
    } else if (optionEng === "none") {
      setAlert(false);
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
    } else if (optionBackup === "mail") {
      setAlert(true);
      setMessagetitle("Caso de e-mail");
      setmessageinfo1("1. Descreva o que deseja restaurar");
      setmessageinfo2("");
      setProblemn("Restaurar e-mail");
      setAlertVerify(false);
    } else if (optionBackup === "none") {
      setAlert(false);
    }
  }
  function selectMail() {
    const selectMail = document.getElementById("select-mail");
    const optionMail = selectMail.options[selectMail.selectedIndex].value;

    if (optionMail === "maxcap") {
      setAlert(false);
      setProblemn("Aumentar capacidade de e-mail");
      setAlertVerify(false);
    } else if (optionMail === "conect") {
      setAlert(true);
      setMessagetitle("Caso de email não conecta na internet");
      setmessageinfo1("1. Informar mensagem de erro");
      setmessageinfo2("");
      setProblemn("Problema com conexão");
      setAlertVerify(false);
    } else if (optionMail === "none") {
      setAlert(false);
    }
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
    } else if (optionEquip === "printer") {
      SetAlocate(false);
      setAlert(true);
      setMessagetitle("Caso de problema com a impressora");
      setmessageinfo1("1. Informar onde a impressora está localizada");
      setmessageinfo2("2. Informar menssagem de erro que aparece");
      setProblemn("Problema com a impressora");
      setAlertVerify(false);
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
    } else if (optionEquip === "none") {
      setAlert(false);
      SetAlocate(false);
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

      if (equipaments && Object.keys(equipaments).length > 0) {
        equipaments.forEach((equipament) => {
          const Div = (
            <DivEquip>
              <ImageEquip
                src={`data:image/jpeg;base64,${equipament.image}`}
                alt=""
              />
              <p>Modelo: {equipament.model}</p>
              <p>Empresa: {equipament.company}</p>
            </DivEquip>
          );

          // Img.setAttribute("src", equipament.image);

          SetDashEquipaments((prvDiv) => [...prvDiv, Div]);
        });
      } else {
        setTypeError("Falta de Dados");
        setMessageError("Nenhum equipamento Cadastrado");
      }
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
    } else if (option === "deluser") {
      setFormDelUser(true);
      setFormNewUser(false);
      setAlert(false);
      setProblemn("Exclusao de usuario de rede");
      setAlertVerify(false);
    } else if (option === "none") {
      setAlert(false);
      setFormNewUser(false);
      setFormDelUser(false);
      setAlertVerify(false);
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
    } else if (option === "block") {
      setAlert(true);
      setMessagetitle("Caso de bloqueio de pasta");
      setmessageinfo1("1. Informar o diretorio completo da pasta");
      setmessageinfo2(
        "2.Caso não seja o gestor responsavel pela pasta, anexar a autorização do mesmo"
      );
      setProblemn("Bloquear pasta");
      setAlertVerify(false);
    } else if (option === "none") {
      setAlert(false);
      setMessagetitle("");
      setmessageinfo1("");
      setmessageinfo2("");
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
    } else if (option === "block") {
      setAlert(true);
      setMessagetitle("Caso de bloqueio de site");
      setmessageinfo1("1. Informar o link completo do site");
      setmessageinfo2(
        "2.Caso não seja o gestor da area, anexar a autorização do mesmo"
      );
      setProblemn("Bloqueio de site");
      setAlertVerify(false);
    } else if (option === "none") {
      setAlert(false);
      setMessagetitle("");
      setmessageinfo1("");
      setmessageinfo2("");
    }
  }
  function selectMotivation() {
    const option = document.querySelectorAll("input[name='motivation']");

    option.forEach((radio) => {
      radio.addEventListener("change", (event) => {
        if (event.target.checked) {
          const selectedValue = event.target.value;

          if (selectedValue === "other") {
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
          const selectedValue = event.target.value;
          if (selectedValue === "yes") {
            setMachine(false);
          } else if (selectedValue === "no") {
            setMachine(true);
            setMessagetitle("Caso de não haver maquina");
            setmessageinfo1(
              "1. Deverá ser feita uma solicitação de equipamento"
            );
            setmessageinfo2("");
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

    fetch("submitTicket/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf,
      },
      body: JSON.stringify({
        ticketRequester: Data.name,
        department: Data.department,
        mail: Data.mail,
        company: Data.company,
        phone: Data.phone,
        sector: sector,
        occurrence: occurrence,
        problemn: problemn,
        observation: observation,
        start_date: dataFormatada,
        PID: Data.pid,
        respective_area: respectiveArea,
      }),
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
        } else {
          SetMessage(false);
          window.location.reload();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function closeMessage() {
    SetMessage(false);
  }

  function HistoryPage() {
    return (window.location.href = "/helpdesk/history/");
  }

  function DashboardPage() {
    fetch("toDashboard", {
      method: "GET",
      headers: {
        Accept: "application/json,",
      },
    })
      .then((response) => {
        if (response.status === 403) {
          SetMessage(true);
          setTypeError("Permissões Insuficientes");
          setMessageError(
            "Seu Usuário não possui permissão para acessar este modulo"
          );
        } else if (response.status === 203) {
          return (window.location.href = "/dashboard_TI");
        }
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function FAQPage() {
    return (window.location.href = "/helpdesk/FAQ/");
  }

  function ExitFixDesk() {
    fetch("exit/", {
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

  return (
    <Div>
      {navbar && (
        <NavBar
          Name={Data.name}
          JobTitle={Data.job_title}
          Func2={HelpdeskPage}
          Func={HistoryPage}
          Func3={DashboardPage}
          Func5={FAQPage}
          Func4={ExitFixDesk}
        />
      )}
      {loading && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <Loading />
        </div>
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
      {dashboard && (
        <Form className="mx-auto d-flex flex-column align-items-center justify-content-around">
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
                />
              </div>
              <div className="d-flex flex-column justify-content-start">
                <div className="d-flex mb-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="motivation"
                    onChange={selectMotivation}
                    value="new"
                  />
                  <span>Nova contratação</span>
                </div>
                <div className="d-flex mb-3">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="motivation"
                    onChange={selectMotivation}
                    value="old"
                  />
                  <span>Remanejamento para outro setor/departamento</span>
                </div>
                <div className="d-flex mb-3">
                  <input
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
                  <input
                    type="radio"
                    className="form-check-input"
                    name="machine"
                    onChange={selectMachine}
                    value="yes"
                  />
                  <span className="mb-3">SIM</span>
                </div>
                <div className="d-flex mb-3">
                  <input
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
                  id="select-company"
                >
                  <option value="none" selected>
                    Selecione a unidade
                  </option>
                  <option value="cidade">CSC</option>
                  <option value="cidade">Escritório RJ</option>
                  <option value="cidade">Escritório SP</option>
                  <option value="cidade">Fiber Liners</option>
                  <option value="cidade">Microfusão</option>
                  <option value="cidade">MNA</option>
                  <option value="cidade">Mipel</option>
                  <option value="cidade">Oil&Gas</option>
                  <option value="cidade">Ropes</option>
                  <option value="cidade">Valmicro</option>
                </Select>
              </div>
              <div className="d-flex flex-column mb-3">
                <span className="mb-3">
                  Informe o sistemas/softwares que requisitam usuario/licença
                </span>
                <div className="mx-auto">
                  <ul className="list-group">
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value=""
                        id="SAP"
                      />
                      <label className="form-check-label" htmlFor="SAP">
                        SAP
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value=""
                        id="MBI"
                      />
                      <label className="form-check-label" htmlFor="MBI">
                        MBI / NetTerm
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value=""
                        id="Solfis"
                      />
                      <label className="form-check-label" htmlFor="Solfis">
                        Synchro Fiscal (Solfis)
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value=""
                        id="Solfis"
                      />
                      <label className="form-check-label" htmlFor="Solfis">
                        Synchro Fiscal (Solfis)
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value=""
                        id="DFe"
                      />
                      <label className="form-check-label" htmlFor="DFe">
                        Synchro NFe (DFe Manager)
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value=""
                        id="Metadados"
                      />
                      <label className="form-check-label" htmlFor="Metadados">
                        Metadados
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value=""
                        id="AutoCad"
                      />
                      <label className="form-check-label" htmlFor="AutoCad">
                        AutoCad
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value=""
                        id="SolidWorks"
                      />
                      <label className="form-check-label" htmlFor="SolidWorks">
                        SolidWorks
                      </label>
                    </li>
                    <li className="list-group-item">
                      <input
                        className="form-check-input me-1"
                        type="checkbox"
                        value=""
                        id="Office"
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
                <input type="number" className="form-control" />
              </div>
              <div className="mb-3">
                <span>Cargo/Função:</span>
                <input type="text" className="form-control" />
              </div>
              <div>
                <span className="mb-3">Data de inicio das atitividades:</span>
                <Calendar className="mt-3">
                  <DayPicker
                    fixedWeeks
                    showOutsideDays
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    mode="single"
                    footer={footerDay}
                  />
                </Calendar>
              </div>
              <div>
                <span>
                  Informe um usuário que tenha o perfil semelhante ao do
                  contratado. Inclua observações caso exista alguma restrição na
                  cópia deste, ou digite nenhum caso não exista semelhante.(terá
                  as mesmas permissões)
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="NOME COMPLETO!!!"
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
              />
              <span className="mb-3">
                Informar a data que deverá ser feito o bloqueio do usuario
              </span>
              <div className="t-3">
                <DayPicker
                  fixedWeeks
                  showOutsideDays
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  mode="single"
                  footer={footerDay}
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
            <div className="d-flex flex-wrap justify-content-center">
              {dashequipaments}
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
            {/* <UploadField token={csrf} equipamentforuser={true} /> */}
          </div>
          <input
            type="submit"
            className="btn btn-primary mt-3"
            onClick={submitTicket}
            value={"Enviar"}
          />
        </Form>
      )}
    </Div>
  );
}
