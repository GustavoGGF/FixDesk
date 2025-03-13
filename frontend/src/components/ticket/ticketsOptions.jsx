import React, { useRef, useState, useContext, useEffect } from "react";
import { Select, DivMachine, Contract } from "../../styles/ticketsOptionsStyle";
import Close from "../../images/components/close.png";
import { TickerContext } from "../../context/TickerContext";
import RoboGlimpse from "../loading/robotGlimpse";
import { DayPicker } from "react-day-picker";
import "react-day-picker/src/style.css";

export default function TicketsOptions({ reset, Helpdesk, Name, Dashboard }) {
  const [respectiveTI, setRespectiveTI] = useState(false);
  const [infra, setInfra] = useState(false);
  const [backup, setBackup] = useState(false);
  const [mail, setMail] = useState(false);
  const [equip, setEquip] = useState(false);
  const [internet, setInternet] = useState(false);
  const [folder, setFolder] = useState(false);
  const [user, setUser] = useState(false);
  const [sys, setSYS] = useState(false);
  const [sys2, setSYS2] = useState(false);
  const [system, setSystem] = useState(false);
  const [alocate, setAlocate] = useState(false);
  const [dateequip, setDateEquip] = useState(false);
  const [dadosCase, setDados] = useState(false);
  const [softAPP, setSoftAPP] = useState(false);
  const [comodato, setComodato] = useState(false);
  const [loadingoFetchingEquipaments, setLoadingoFetchingEquipaments] = useState(true);

  const { setMessagetitle } = useContext(TickerContext);
  const { setRespectiveArea } = useContext(TickerContext);
  const { setAlert } = useContext(TickerContext);
  const { setMessageinfo1 } = useContext(TickerContext);
  const { setMessageinfo2 } = useContext(TickerContext);
  const { setSector } = useContext(TickerContext);
  const { setOccurrence } = useContext(TickerContext);
  const { setProblemn } = useContext(TickerContext);
  const { setAlertVerify } = useContext(TickerContext);
  const { setSelectedDay } = useContext(TickerContext);
  const { setMachineAlocate } = useContext(TickerContext);
  const { create_user_acess } = useContext(TickerContext);
  const { alocate_machine_acess } = useContext(TickerContext);

  const [selectedInternal, setSelectedInternal] = useState([]);

  const [disabledDates, setDisabledDates] = useState([]);

  const [dashequipaments, setDashEquipaments] = useState("");
  const [equipaments, setEquipaments] = useState("");
  const [dashEquipamentSelected, setDashEquipamentSelected] = useState("");

  const footer =
    selectedInternal.length > 0
      ? `Datas de Locação: ${selectedInternal
          .sort((a, b) => a - b) // Ordena as datas em ordem crescente
          .map((date) => date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })) // Formata como dd/mm/yyyy
          .join(", ")}` // Junta as datas formatadas em uma string
      : "Selecione pelo menos um dia.";

  const selectAR = useRef(null);

  useEffect(() => {
    if (reset) {
      selectAR.current.selectedIndex = 0;
      setInfra(false);
      setBackup(false);
      setMail(false);
      setEquip(false);
      setInternet(false);
      setFolder(false);
      setAlert(false);
      setUser(false);
      setAlertVerify(false);
      setSector(false);
      setSystem(false);
      setSYS(false);
      setSYS2(false);
      setAlocate(false);
      setDateEquip(false);
      setRespectiveTI(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  function selectARes(event) {
    const selectedValue = event.target.value;

    if (selectedValue === "TI") {
      setAlert(false);
      setRespectiveTI(true);
      setRespectiveArea("TI");
      setAlertVerify(false);
    } else {
      setRespectiveTI(false);
      setAlert(false);
    }
  }

  function updateOccurrence({
    infra = false,
    backup = false,
    mail = false,
    equip = false,
    internet = false,
    folder = false,
    alert = false,
    user = false,
    alertVerify = false,
    sector = "",
    system = false,
    sys = false,
    sys2 = false,
    alocate = false,
    dateEquip = false,
  }) {
    setInfra(infra);
    setBackup(backup);
    setMail(mail);
    setEquip(equip);
    setInternet(internet);
    setFolder(folder);
    setAlert(alert);
    setUser(user);
    setAlertVerify(alertVerify);
    setSector(sector);
    setSystem(system);
    setSYS(sys);
    setSYS2(sys2);
    setAlocate(alocate);
    setDateEquip(dateEquip);
  }

  function selectOcorrence() {
    const select = document.getElementById("select-Form");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "infra":
        updateOccurrence({ infra: true, sector: "Infraestrutura" });
        break;
      case "sistema":
        updateOccurrence({ system: true, sector: "Sistema" });
        break;
      case "none":
        break;
    }
  }

  function updateProblemn({
    backup = false,
    mail = false,
    equip = false,
    internet = false,
    folder = false,
    alert = false,
    user = false,
    alertVerify = false,
    occurrence = "",
    sys = false,
    sys2 = false,
    alocate = false,
    dateEquip = false,
    dados = false,
    softApp = false,
  }) {
    setBackup(backup);
    setMail(mail);
    setEquip(equip);
    setInternet(internet);
    setFolder(folder);
    setAlert(alert);
    setUser(user);
    setAlertVerify(alertVerify);
    setOccurrence(occurrence);
    setSYS(sys);
    setSYS2(sys2);
    setAlocate(alocate);
    setDateEquip(dateEquip);
    setDados(dados);
    setSoftAPP(softApp);
  }

  function selectProblem() {
    const select = document.getElementById("select-error");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "backup":
        updateProblemn({ backup: true, occurrence: "Backup" });
        break;
      case "mail":
        updateProblemn({ mail: true, occurrence: "E-mail" });
        break;
      case "equip":
        updateProblemn({ equip: true, occurrence: "Equipamento" });
        break;
      case "user":
        updateProblemn({ user: true, occurrence: "Gerenciamento de Usuario" });
        break;
      case "internet":
        updateProblemn({ internet: true, occurrence: "Internet" });
        break;
      case "folder":
        updateProblemn({ folder: true, occurrence: "Permissão" });
        break;
      case "none":
        break;
      case "sap":
        updateProblemn({ sys: true, occurrence: "SAP" });
        break;
      case "mbi":
        updateProblemn({ sys: true, occurrence: "MBI" });
        break;
      case "synch":
        updateProblemn({ sys: true, occurrence: "Synchro" });
        break;
      case "office":
        updateProblemn({ sys2: true, occurrence: "Office" });
        break;
      case "eng":
        updateProblemn({ sys2: true, occurrence: "Softwares de Eng" });
        break;
      case "soft":
        updateProblemn({ softApp: true, occurrence: "Novo SoftWare" });
        break;
      case "dados":
        updateProblemn({ dados: true, occurrence: "Integridade de Dados" });
        break;
      case "metadados":
        updateProblemn({ sys: true, occurrence: "Metadados" });
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
        setEquipaments("");
        setDashEquipamentSelected("");
        setAlert(true);
        setMessagetitle("Caso de Alocação de equipamento");
        setMessageinfo1("1. Selecionar o equipamento desejado");
        setMessageinfo2("2. Informar a dataUser e a necessidade de equipamentos adicionais como teclado, etc...");
        setAlertVerify(false);
        setAlocate(true);
        setLoadingoFetchingEquipaments(true);
        setDisabledDates([]);
        setSelectedInternal([]);
        fetch("equipaments-for-alocate", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            if (data.machines) {
              setEquipaments(data.machines);
            }
          })
          .catch((err) => {
            console.log(err);
          });
        setProblemn("Alocação de Máquina");
        break;
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

  useEffect(() => {
    if (equipaments.length > 0) {
      const newDashEquipaments = equipaments.map((element) => (
        <DivMachine
          key={element.mac_address}
          onClick={() => {
            selectMachine(element.mac_address);
          }}
        >
          <h3>{element.model}</h3>
          <span>{element.manufacturer}</span>
          <span>{element.distribution}</span>
        </DivMachine>
      ));

      setDashEquipaments(newDashEquipaments);
      setLoadingoFetchingEquipaments(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipaments]);

  const findEquipamentByMacAddress = (macAddress) => {
    return equipaments.find((equipament) => equipament.mac_address === macAddress);
  };

  function selectMachine(mac) {
    setLoadingoFetchingEquipaments(true);
    setDashEquipaments("");
    const foundEquipament = findEquipamentByMacAddress(mac);

    const newDashEquipaments = (
      <DivMachine
        key={foundEquipament.mac_address}
        onClick={() => {
          selectMachine(foundEquipament.mac_address);
        }}
      >
        <h3>{foundEquipament.model}</h3>
        <span>{foundEquipament.manufacturer}</span>
        <span>{foundEquipament.distribution}</span>
      </DivMachine>
    );

    setDashEquipamentSelected(newDashEquipaments);
    setDateEquip(true);
    fetch("date-equipaments-alocate/" + mac, {
      method: "GET",
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.dates) {
          // Itera sobre cada item em data.dates
          data.dates.forEach((dateString) => {
            // Divide as datas por vírgulas para garantir que todas sejam separadas corretamente
            const dates = dateString.split(",");

            // Para cada data, converte para um objeto Date e adiciona ao estado
            dates.forEach((date) => {
              setDisabledDates((prevDates) => [...prevDates, new Date(date)]);
            });
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
    setLoadingoFetchingEquipaments(false);
    setMachineAlocate(mac);
  }

  function selectUser() {
    const select = document.getElementById("select-user");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "adduser":
        setAlert(false);
        setProblemn("Criacao de usuario de rede");
        setAlertVerify(false);
        break;
      case "deluser":
        setAlert(false);
        setProblemn("Exclusao de usuario de rede");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        setAlertVerify(false);
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

  function selectSys() {
    const select = document.getElementById("select-sap");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "user":
        setMessagetitle("Caso de Criação/exclusão de usuários");
        setMessageinfo1("1. Informar o usuário que deverá ser criado ou excluido");
        setMessageinfo2("2. Informar os acessos que o mesmo poderá utilizar");
        setProblemn("Criação/exclusão usuário");
        setAlert(true);
        setAlertVerify(false);
        break;
      case "access":
        setMessagetitle("Caso de Liberação/bloqueio de acessos");
        setMessageinfo1("1. Descreva o que deseja bloquear e/ou liberar");
        setMessageinfo2("");
        setProblemn("Liberação/bloqueio de acessos");
        setAlert(true);
        setAlertVerify(false);
        break;
      case "quest":
        setMessagetitle("Caso de Dúvidas operacionais");
        setMessageinfo1("1. Descreva o que deseja saber");
        setMessageinfo2("");
        setProblemn("Dúvidas operacionais");
        setAlertVerify(false);
        setAlert(true);
        break;
      case "error":
        setMessagetitle("Caso de Correção de falhas");
        setMessageinfo1("1. Informe o Erro");
        setMessageinfo2("");
        setProblemn("Correção de falhas");
        setAlertVerify(false);
        setAlert(true);
        break;
      case "upg":
        setMessagetitle("Caso de Melhorias");
        setMessageinfo1("1. Informe a melhoria que deseja implementar");
        setMessageinfo2("");
        setProblemn("Melhoria");
        setAlertVerify(false);
        setAlert(true);
        break;
      case "none":
        setAlert(false);
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

  function selectSoftAPP() {
    const select = document.getElementById("select-soft");
    const option = select.options[select.selectedIndex].value;

    switch (option) {
      default:
        break;
      case "install":
        setAlert(true);
        setMessagetitle("Instalação de Novo Software");
        setMessageinfo1("1. Informar nome do Software");
        setMessageinfo2("");
        setProblemn("Instalação de Novo Software");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        break;
      case "error":
        setAlert(true);
        setMessagetitle("Erro e Problema em Software gerais");
        setMessageinfo1("1. Informar nome do Software");
        setMessageinfo2("2. Informar o erro");
        setProblemn("Erro e Problema em Software gerais");
        setAlertVerify(false);
        break;
    }
  }

  function selectDado() {
    const selectOffice = document.getElementById("select-dado");
    const optionOffice = selectOffice.options[selectOffice.selectedIndex].value;

    switch (optionOffice) {
      default:
        break;
      case "corrupted":
        setAlert(true);
        setMessagetitle("Arquivo Corrompido");
        setMessageinfo1("1. Informar local deste arquivo ou Anexar o Mesmo");
        setMessageinfo2("");
        setProblemn("Arquivo Corrompido");
        setAlertVerify(false);
        break;
      case "none":
        setAlert(false);
        break;
    }
  }

  // Atualiza o contexto e o estado local ao selecionar datas
  const handleSelect = (dates) => {
    console.log(dates);
    setSelectedInternal(dates);
    setSelectedDay(dates);
  };

  return (
    <>
      <Select ref={selectAR} className="form-select mb-3" aria-label="Default select example" id="selectAR" onChange={selectARes}>
        <option value="none" disabled selected>
          Seleciona a Área Respectiva
        </option>
        <option value="TI">TI</option>
      </Select>
      {respectiveTI && (
        <Select className="form-select mb-3" aria-label="Default select example" id="select-Form" onChange={selectOcorrence}>
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
          <option value="user" hidden={!create_user_acess}>
            Gerenciamento de usuário
          </option>
          )<option value="internet">Internet</option>
          <option value="folder">Pasta</option>
          <option value="soft">Software e Aplicativos</option>
          <option value="dados">Integridade de Dados</option>
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
          <option value="alocate" hidden={!alocate_machine_acess}>
            Alocar equipamento
          </option>
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
          <option value="metadados">MetaDados</option>
          <option value="eng">Softwares de Engenharia</option>
        </Select>
      )}
      {sys && (
        <Select className="form-select mb-3" aria-label="Default select example" id="select-sap" onChange={selectSys}>
          <option value="none" disabled selected>
            Selecione o Problema
          </option>
          <option value="user">Criação/exclusão de usuários</option>
          <option value="access">Liberação/bloqueio de acessos</option>
          <option value="quest">Dúvidas operacionais</option>
          <option value="error">Correção de falhas</option>
          <option value="upg">Melhorias</option>
        </Select>
      )}
      {sys2 && (
        <Select className="form-select mb-3" aria-label="Default select example" id="select-office" onChange={selectOffice}>
          <option value="none" disabled selected>
            Selecione o Problema
          </option>
          <option value="buy">Aquisição de software/licenciamento</option>
          <option value="error">Correção de falhas</option>
        </Select>
      )}
      {softAPP && (
        <Select className="form-select mb-3" aria-label="Default select example" id="select-soft" onChange={selectSoftAPP}>
          <option value="none" disabled selected>
            Selecione o Problema
          </option>
          <option value="install">Instalação de Software Novo</option>
          <option value="error">Erros e Problemas em Softwares Gerais</option>
        </Select>
      )}
      {dadosCase && (
        <Select className="form-select mb-3" aria-label="Default select example" id="select-dado" onChange={selectDado}>
          <option value="none" disabled selected>
            Selecione o Problema
          </option>
          <option value="corrupted">Arquivo Corrompido</option>
        </Select>
      )}
      {alocate && (
        <div className="w-100">
          <div className="d-flex justify-content-center">
            <Select className="form-select mb-3" aria-label="Default select example" id="select-company-equip" onChange={"selectCompanyEquip"}>
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
          <div className="d-flex flex-wrap justify-content-center position-relative">
            <div className="d-flex flex-column">
              {dashEquipamentSelected}
              {dateequip && <DayPicker mode="multiple" disabled={disabledDates} onSelect={handleSelect} selected={selectedInternal} showOutsideDays footer={footer} />}
            </div>
            {dashequipaments} {loadingoFetchingEquipaments && <RoboGlimpse />}
          </div>
        </div>
      )}
      {comodato && (
        <Contract class="position-fixed top-50 start-50 translate-middle d-flex flex-column">
          <div class="d-flex">
            <h3 className="text-center w-100 fw-bold">Contrato Comodato</h3>
            <button
              onClick={() => {
                setComodato(false);
              }}
            >
              <img src={Close} alt="botão de fechar" />
            </button>
          </div>
          <div class="d-flex flex-column">
            <h3 class="mt-3">INSTRUMENTO PARTICULAR DE COMODATO</h3>
            <span class="mt-3">
              <b>LUPATECH S.A. - EM RECUPERAÇÃO JUDICIAL, </b>à, Rua Dalton Lanh dos reis, 201, bairro Distrito Industrial, no Município de Caxias do Sul, Estado de Rio Grande do Sul &ndash; CEP
              95112-090, regularmente inscrita no CNPJ/MF sob o nº89.463.822/0012-75, doravante denominada simplesmente de <b>COMODANTE.</b>
            </span>
            <span class="mt-3">e</span>
            <span class="mt-3">
              <b>{Name}</b>, doravante denominada simplesmente <b>COMODATÁRIO</b>.
            </span>
            <span class="mt-3">
              <b>CONSIDERAÇÕES</b>
            </span>
            <span>
              A <b>COMODANTE </b> é proprietária e legítima possuidora do seguinte equipamento:
            </span>
          </div>
          <button>Concordo</button>
        </Contract>
      )}
    </>
  );
}
