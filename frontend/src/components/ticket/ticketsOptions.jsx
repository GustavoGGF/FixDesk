import { useContext, useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { OptionsContext } from "../../context/OptionsContext";
import { AreaContext } from "../../context/AreaContext";
import Close from "../../images/components/close.png";
import {
	Contract,
	DivMachine,
	ImgMachines,
	Select,
} from "../../styles/ticketsOptionsStyle";
import RoboGlimpse from "../loading/robotGlimpse";
import "react-day-picker/src/style.css";

export default function TicketsOptions({ Name }) {
	const [respectiveTI, setRespectiveTI] = useState(false);
	const [respectiveFiscal, setRespectiveFiscal] = useState(false);
	const [fiscalOcorrencia, setFiscalOcorrencia] = useState(false);
	const [fiscalProblema, setFiscalProblema] = useState(false);
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
	const [loadingoFetchingEquipaments, setLoadingoFetchingEquipaments] =
		useState(true);

	const {
		messagetitle,
		respectiveArea,
		setAlert,
		messageinfo2,
		messageinfo3,
		machineAlocate,
		alocate_machine_acess,
		messageinfo1,
		selectedDay,
		sector,
		occurrence,
		problemn,
		setAlertVerify,
		reset,
		setReset,
		linkAcess,
	} = useContext(OptionsContext);

	const { activeAreas } = useContext(AreaContext);

	const [selectedInternal, setSelectedInternal] = useState([]);

	const [disabledDates, setDisabledDates] = useState([]);

	const [dashequipaments, setDashEquipaments] = useState("");
	const [equipaments, setEquipaments] = useState("");
	const [dashEquipamentSelected, setDashEquipamentSelected] = useState("");
	const [locationCurrentMachines, setLocationCurrentMachines] = useState("");

	const companyEquip = useRef(null);

	const footer =
		selectedInternal.length > 0
			? `Datas de Locação: ${selectedInternal
					.sort((a, b) => a - b) // Ordena as datas em ordem crescente
					.map((date) =>
						date.toLocaleDateString("pt-BR", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric",
						}),
					) // Formata como dd/mm/yyyy
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
			sector.current = "";
			setSystem(false);
			setSYS(false);
			setSYS2(false);
			setAlocate(false);
			setDateEquip(false);
			setRespectiveTI(false);
			setRespectiveFiscal(false);
			setFiscalOcorrencia(false);
			setFiscalProblema(false);
			setReset(false);
			setSoftAPP(false);
			setDados(false);
			setComodato(false);
			linkAcess.current = "";
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [reset]);

	function SelectARes(event) {
		const selectedId = Number(event.target.value);
		const areaObj = activeAreas?.find((a) => a.respective_area === selectedId);

		if (!areaObj) return;

		const selectedValue = areaObj.respective_area_code;
		respectiveArea.current = selectedId;

		if (selectedValue === "TI") {
			setAlert(false);
			setRespectiveTI(true);
			setRespectiveFiscal(false);
			setFiscalOcorrencia(false);
			setFiscalProblema(false);
			setAlertVerify(false);
		} else if (selectedValue === "Fiscal") {
			setAlert(false);
			setRespectiveTI(false);
			setRespectiveFiscal(true);
			setFiscalOcorrencia(true);
			setFiscalProblema(false);
			setAlertVerify(false);
		} else {
			setRespectiveTI(false);
			setRespectiveFiscal(false);
			setFiscalOcorrencia(false);
			setFiscalProblema(false);
			setAlert(false);
		}
	}

	function SelectFiscalOcorrence(event) {
		const option = event.target.value;

		switch (option) {
			case "lancamentos":
				sector.current = "Lançamentos Fiscais";
				occurrence.current = "Lançamentos Fiscais";
				setFiscalProblema(true);
				break;
			case "tributario":
				sector.current = "Tributário";
				occurrence.current = "Tributário";
				setFiscalProblema(true);
				break;
			case "duvidas":
				sector.current = "Dúvidas Fiscais";
				occurrence.current = "Dúvidas Fiscais";
				setFiscalProblema(true);
				break;
			default:
				setFiscalProblema(false);
				break;
		}
	}

	function SelectFiscalProblem(event) {
		const option = event.target.value;

		switch (option) {
			case "nf":
				problemn.current = "Nota Fiscal (Emissão/Correção)";
				setAlertVerify(false);
				break;
			case "impostos":
				problemn.current = "Impostos / Retenções";
				setAlertVerify(false);
				break;
			case "xml":
				problemn.current = "Manifestação / XML";
				setAlertVerify(false);
				break;
			case "outros":
				problemn.current = "Outros";
				setAlertVerify(false);
				break;
			default:
				break;
		}
	}

	function UpdateOccurrence({
		infra = false,
		backup = false,
		mail = false,
		equip = false,
		internet = false,
		folder = false,
		alert = false,
		user = false,
		alertVerify = false,
		sectorValue = "",
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
		sector.current = sectorValue;
		setSystem(system);
		setSYS(sys);
		setSYS2(sys2);
		setAlocate(alocate);
		setDateEquip(dateEquip);
	}

	function SelectOcorrence() {
		const select = document.getElementById("select-Form");
		const option = select.options[select.selectedIndex].value;

		switch (option) {
			case "infra":
				UpdateOccurrence({ infra: true, sectorValue: "Infraestrutura" });
				break;
			case "sistema":
				UpdateOccurrence({ system: true, sectorValue: "Sistema" });
				break;
			case "none":
				break;
			default:
				break;
		}
	}

	function UpdateProblemn({
		backup = false,
		mail = false,
		equip = false,
		internet = false,
		folder = false,
		alert = false,
		user = false,
		alertVerify = false,
		occurrenceValue = "",
		sys = false,
		sys2 = false,
		alocate = false,
		dateEquip = false,
		dados = false,
		softApp = false,
		linkAcessValue = "",
	}) {
		setBackup(backup);
		setMail(mail);
		setEquip(equip);
		setInternet(internet);
		setFolder(folder);
		setAlert(alert);
		setUser(user);
		setAlertVerify(alertVerify);
		occurrence.current = occurrenceValue;
		setSYS(sys);
		setSYS2(sys2);
		setAlocate(alocate);
		setDateEquip(dateEquip);
		setDados(dados);
		setSoftAPP(softApp);
		linkAcess.current = linkAcessValue;
	}

	function SelectProblem() {
		const select = document.getElementById("select-error");
		const option = select.options[select.selectedIndex].value;

		switch (option) {
			case "backup":
				UpdateProblemn({ backup: true, occurrenceValue: "Backup" });
				break;
			case "mail":
				UpdateProblemn({ mail: true, occurrenceValue: "E-mail" });
				break;
			case "equip":
				UpdateProblemn({ equip: true, occurrenceValue: "Equipamento" });
				break;
			case "user":
				UpdateProblemn({
					user: true,
					occurrenceValue: "Gerenciamento de Usuario",
				});
				break;
			case "internet":
				UpdateProblemn({ internet: true, occurrenceValue: "Internet" });
				break;
			case "folder":
				UpdateProblemn({ folder: true, occurrenceValue: "Permissão" });
				break;
			case "none":
				break;
			case "sap":
				UpdateProblemn({ sys: true, occurrenceValue: "SAP" });
				break;
			case "mbi":
				UpdateProblemn({ sys: true, occurrenceValue: "MBI" });
				break;
			case "synch":
				UpdateProblemn({ sys: true, occurrenceValue: "Synchro" });
				break;
			case "office":
				UpdateProblemn({ sys2: true, occurrenceValue: "Office" });
				break;
			case "eng":
				UpdateProblemn({ sys2: true, occurrenceValue: "Softwares de Eng" });
				break;
			case "soft":
				UpdateProblemn({ softApp: true, occurrenceValue: "Novo SoftWare" });
				break;
			case "dados":
				UpdateProblemn({
					dados: true,
					occurrenceValue: "Integridade de Dados",
				});
				break;
			case "metadados":
				UpdateProblemn({ sys: true, occurrenceValue: "Metadados" });
				break;
			default:
				break;
		}
	}

	function SelectBackup() {
		const selectBackup = document.getElementById("select-backup");
		const optionBackup = selectBackup.options[selectBackup.selectedIndex].value;

		switch (optionBackup) {
			case "pasta":
				setAlert(true);
				messagetitle.current = "Caso de pasta";
				messageinfo1.current = "1. Informar o caminho completo da pasta";
				messageinfo2.current =
					"2. Informar a dataUser de criação e exclusão do arquivo";
				messageinfo3.current = "";
				problemn.current = "Restaurar pasta";
				setAlertVerify(false);
				break;
			case "mail":
				setAlert(true);
				messagetitle.current = "Caso de e-mail";
				messageinfo1.current = "1. Descreva o que deseja restaurar";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Restaurar e-mail";
				setAlertVerify(false);

				break;
			case "none":
				setAlert(false);
				break;
			default:
				break;
		}
	}

	function SelectMail() {
		const selectMail = document.getElementById("select-mail");
		const optionMail = selectMail.options[selectMail.selectedIndex].value;

		switch (optionMail) {
			case "maxcap":
				setAlert(false);
				problemn.current = "Aumentar capacidade de e-mail";
				setAlertVerify(false);
				break;
			case "conect":
				setAlert(true);
				messagetitle.current = "Caso de email não conecta na internet";
				messageinfo1.current = "1. Informar mensagem de erro";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Problema com conexão";
				setAlertVerify(false);
				break;
			case "none":
				setAlert(false);
				break;
			case "domin":
				setAlert(true);
				messagetitle.current = "Caso de liberar domínion de e-mail";
				messageinfo1.current = "1. Informar dóminio, exemplo @lupatech.com.br";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Liberar domínio";
				setAlertVerify(false);
				break;
			default:
				break;
		}
	}

	function SelectEquip() {
		const selectEquip = document.getElementById("select-equip");
		const optionEquip = selectEquip.options[selectEquip.selectedIndex].value;

		switch (optionEquip) {
			case "off":
				setAlocate(false);
				setAlert(true);
				messagetitle.current = "Caso de computador não ligar";
				messageinfo1.current =
					"1. Informar o usuario e setor de onde fica o equipamento";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Equipamento não liga";
				setAlertVerify(false);
				break;
			case "printer":
				setAlocate(false);
				setAlert(true);
				messagetitle.current = "Caso de problema com a impressora";
				messageinfo1.current = "1. Informar onde a impressora está localizada";
				messageinfo2.current = "2. Informar menssagem de erro que aparece";
				problemn.current = "Problema com a impressora";
				setAlertVerify(false);
				break;
			case "roaming":
				setAlocate(false);
				setAlert(true);
				messagetitle.current = "Caso de troca de local de trabalho";
				messageinfo1.current =
					"1. Informar se no local existe ponto de rede e de energia";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Mudanca de local de trabalho";
				setAlertVerify(false);
				break;
			case "usb":
				setAlocate(false);
				setAlert(true);
				messagetitle.current = "Caso de liberação/bloqueio de USB";
				messageinfo1.current = "1. Justificar a solicitação";
				messageinfo2.current =
					"2. Caso não seja o gestor da area, anexar a autorização do mesmo";
				problemn.current = "USB";
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
				messagetitle.current = "Caso de Alocação de equipamento";
				messageinfo1.current = "1. Selecionar o equipamento desejado";
				messageinfo2.current =
					"2. Informar a dataUser e a necessidade de equipamentos adicionais como teclado, etc...";
				setAlertVerify(false);
				setAlocate(true);
				setLoadingoFetchingEquipaments(true);
				setDisabledDates([]);
				setSelectedInternal([]);
				problemn.current = "Alocação de Máquina";
				break;
			case "change":
				setAlert(true);
				messagetitle.current = "Caso de Troca de Equipamento";
				messageinfo1.current = "1. Informar o Equipamento";
				messageinfo2.current = "2. Justificar o motivo da troca";
				problemn.current = "Trocar Equipamento";
				setAlertVerify(false);
				break;
			default:
				break;
		}
	}

	useEffect(() => {
		if (equipaments.length !== 0) {
			const newDashEquipaments = equipaments.map((element) => {
				// Separando o campo "name" para extrair o prefixo

				// eslint-disable-next-line no-unused-vars
				const [_prefix, _] = element.name.split("-");

				return (
					<DivMachine
						key={element.mac_address}
						onClick={() => {
							SelectMachine(element.mac_address);
						}}
					>
						<ImgMachines
							src={`https://techmind.lupatech.com.br/home/computers/get-image/${element.model}`}
							className="img-fluid"
							alt={`imagem ${element.model}`}
						/>
						<h3>{element.model}</h3>
						<span>{element.manufacturer}</span>
						<span>{element.distribution}</span>
						<div className="mt-2">{`Lupatech ${locationCurrentMachines}`}</div>
					</DivMachine>
				);
			});

			setDashEquipaments(newDashEquipaments);
			setLoadingoFetchingEquipaments(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [equipaments]);

	const findEquipamentByMacAddress = (macAddress) => {
		return equipaments.find(
			(equipament) => equipament.mac_address === macAddress,
		);
	};

	function SelectMachine(mac) {
		setLoadingoFetchingEquipaments(true);
		setDashEquipaments("");
		const foundEquipament = findEquipamentByMacAddress(mac);

		const newDashEquipaments = (
			<DivMachine
				key={foundEquipament.mac_address}
				onClick={() => {
					SelectMachine(foundEquipament.mac_address);
				}}
			>
				<ImgMachines
					src={`https://techmind.lupatech.com.br/home/computers/get-image/${foundEquipament.model}`}
					className="img-fluid"
					alt={`imagem ${foundEquipament.model}`}
				/>
				<h3>{foundEquipament.model}</h3>
				<span>{foundEquipament.manufacturer}</span>
				<span>{foundEquipament.distribution}</span>
			</DivMachine>
		);

		setDashEquipamentSelected(newDashEquipaments);
		setDateEquip(true);
		fetch(`date-equipaments-alocate/${mac}`, {
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
				console.error(err);
			});
		setLoadingoFetchingEquipaments(false);
		machineAlocate.current = mac;
	}

	function SelectUser() {
		problemn.current = "Criacao/Exclusão de usuario de rede";
		messagetitle.current = "Caso de Criar/Excluir Usuario";
		messageinfo1.current = "1. Acessar: ";
		linkAcess.current =
			"https://tilupatech.sharepoint.com/sites/Intranet/SitePages/Formul%C3%A1rios-Internos-LUPATECH-S-A.aspx";
		messageinfo2.current =
			"2. No link a cima escolher seguinte opção: Fomulários de TI.";
		messageinfo3.current = "3. Abrir o chamado após preencher o formulário.";
		setAlert(true);
		setAlertVerify(false);
	}

	function SelectInternet() {
		const select = document.getElementById("select-internet");
		const option = select.options[select.selectedIndex].value;

		switch (option) {
			case "lib":
				setAlert(true);
				messagetitle.current = "Caso de liberação de site";
				messageinfo1.current = "1. Informar o link completo do site";
				messageinfo2.current =
					"2.Caso não seja o gestor da area, anexar a autorização do mesmo";
				problemn.current = "Liberacao de site";
				setAlertVerify(false);
				break;
			case "block":
				setAlert(true);
				messagetitle.current = "Caso de bloqueio de site";
				messageinfo1.current = "1. Informar o link completo do site";
				messageinfo2.current =
					"2.Caso não seja o gestor da area, anexar a autorização do mesmo";
				problemn.current = "Bloqueio de site";
				setAlertVerify(false);
				break;
			case "none":
				setAlert(false);
				messagetitle.current = "";
				messageinfo1.current = "";
				messageinfo2.current = "";
				messageinfo3.current = "";
				break;
			default:
				break;
		}
	}

	function SelectFolder() {
		const select = document.getElementById("select-folder");
		const option = select.options[select.selectedIndex].value;

		switch (option) {
			case "lib":
				setAlert(true);
				messagetitle.current = "Caso de liberação de pasta";
				messageinfo1.current = "1. Informar o diretorio completo da pasta";
				messageinfo2.current =
					"2.Caso não seja o gestor responsavel pela pasta, anexar a autorização do mesmo";
				problemn.current = "Liberar pasta";
				setAlertVerify(false);
				break;
			case "block":
				setAlert(true);
				messagetitle.current = "Caso de bloqueio de pasta";
				messageinfo1.current = "1. Informar o diretorio completo da pasta";
				messageinfo2.current =
					"2.Caso não seja o gestor responsavel pela pasta, anexar a autorização do mesmo";
				problemn.current = "Bloquear pasta";
				setAlertVerify(false);
				break;
			case "none":
				setAlert(false);
				messagetitle.current = "";
				messageinfo1.current = "";
				messageinfo2.current = "";
				messageinfo3.current = "";
				break;
			default:
				break;
		}
	}

	function SelectSys() {
		const select = document.getElementById("select-sap");
		const option = select.options[select.selectedIndex].value;

		switch (option) {
			case "user":
				messagetitle.current = "Caso de Criação/exclusão de usuários";
				messageinfo1.current =
					"1. Informar o usuário que deverá ser criado ou excluido";
				messageinfo2.current =
					"2. Informar os acessos que o mesmo poderá utilizar";
				problemn.current = "Criação/exclusão usuário";
				setAlert(true);
				setAlertVerify(false);
				break;
			case "access":
				messagetitle.current = "Caso de Liberação/bloqueio de acessos";
				messageinfo1.current = "1. Descreva o que deseja bloquear e/ou liberar";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Liberação/bloqueio de acessos";
				setAlert(true);
				setAlertVerify(false);
				break;
			case "quest":
				messagetitle.current = "Caso de Dúvidas operacionais";
				messageinfo1.current = "1. Descreva o que deseja saber";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Dúvidas operacionais";
				setAlertVerify(false);
				setAlert(true);
				break;
			case "error":
				messagetitle.current = "Caso de Correção de falhas";
				messageinfo1.current = "1. Informe o Erro";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Correção de falhas";
				setAlertVerify(false);
				setAlert(true);
				break;
			case "upg":
				messagetitle.current = "Caso de Melhorias";
				messageinfo1.current = "1. Informe a melhoria que deseja implementar";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Melhoria";
				setAlertVerify(false);
				setAlert(true);
				break;
			case "none":
				setAlert(false);
				break;
			default:
				break;
		}
	}

	function SelectOffice() {
		const selectOffice = document.getElementById("select-office");
		const optionOffice = selectOffice.options[selectOffice.selectedIndex].value;

		switch (optionOffice) {
			case "buy":
				setAlert(true);
				messagetitle.current = "Aquisição de software/licenciamento";
				messageinfo1.current = "1. Informe para quem será a licença";
				messageinfo3.current = "";
				problemn.current = "Aquisição de software/licenciamento";
				setAlertVerify(false);
				break;
			case "error":
				setAlert(true);
				messagetitle.current = "Caso de Correção de falhas";
				messageinfo1.current = "1. Informe o Erro";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Correção de falhas";
				setAlertVerify(false);
				break;
			case "none":
				setAlert(false);
				break;
			default:
				break;
		}
	}

	function SelectSoftAPP() {
		const select = document.getElementById("select-soft");
		const option = select.options[select.selectedIndex].value;

		switch (option) {
			case "install":
				setAlert(true);
				messagetitle.current = "Instalação de Novo Software";
				messageinfo1.current = "1. Informar nome do Software";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Instalação de Novo Software";
				setAlertVerify(false);
				break;
			case "none":
				setAlert(false);
				break;
			case "error":
				setAlert(true);
				messagetitle.current = "Erro e Problema em Software gerais";
				messageinfo1.current = "1. Informar nome do Software";
				messageinfo2.current = "2. Informar o erro";
				problemn.current = "Erro e Problema em Software gerais";
				setAlertVerify(false);
				break;
			default:
				break;
		}
	}

	function SelectDado() {
		const selectOffice = document.getElementById("select-dado");
		const optionOffice = selectOffice.options[selectOffice.selectedIndex].value;

		switch (optionOffice) {
			case "corrupted":
				setAlert(true);
				messagetitle.current = "Arquivo Corrompido";
				messageinfo1.current =
					"1. Informar local deste arquivo ou Anexar o Mesmo";
				messageinfo2.current = "";
				messageinfo3.current = "";
				problemn.current = "Arquivo Corrompido";
				setAlertVerify(false);
				break;
			case "none":
				setAlert(false);
				break;
			default:
				break;
		}
	}

	// Atualiza o contexto e o estado local ao selecionar datas
	const handleSelect = (dates) => {
		setSelectedInternal(dates);
		selectedDay.current = dates;
	};

	// Essa função busca pelo equipamento pela sua respectiva unidade
	function SelectCompanyEquip() {
		setLoadingoFetchingEquipaments(true);
		setEquipaments("");
		setDashEquipaments("");
		if (!companyEquip) {
			return;
		}
		// O valor de companyEquip.current.value deve ser correspondente a unidade do banco de dados do TechMind
		fetch(`equipaments-for-alocate/${companyEquip.current.value}`, {
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
				if (data.machines && data.machines.length !== 0) {
					setLocationCurrentMachines(companyEquip.current.value);
					setEquipaments(data.machines);
				}
			})
			.catch((err) => {
				console.error(err);
			});
	}

	return (
		<>
			<Select
				ref={selectAR}
				className="form-select mb-3"
				aria-label="Default select example"
				id="selectAR"
				onChange={SelectARes}
				defaultValue="none"
			>
				<option value="none" disabled>
					Seleciona a Área Respectiva
				</option>
				{activeAreas.map((area) => (
					<option key={area.respective_area} value={area.respective_area}>
						{area.respective_area_code}
					</option>
				))}
			</Select>
			{respectiveFiscal && fiscalOcorrencia && (
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-fiscal-ocorrencia"
					onChange={SelectFiscalOcorrence}
					defaultValue="none"
				>
					<option value="none" disabled>
						Selecione o tipo de ocorrência
					</option>
					<option value="lancamentos">Lançamentos Fiscais</option>
					<option value="tributario">Tributário</option>
					<option value="duvidas">Dúvidas Fiscais</option>
				</Select>
			)}
			{respectiveFiscal && fiscalProblema && (
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-fiscal-problema"
					onChange={SelectFiscalProblem}
					defaultValue="none"
				>
					<option value="none" disabled>
						Selecione o problema ocorrido
					</option>
					<option value="nf">Nota Fiscal (Emissão/Correção)</option>
					<option value="impostos">Impostos / Retenções</option>
					<option value="xml">Manifestação / XML</option>
					<option value="outros">Outros</option>
				</Select>
			)}
			{respectiveTI && (
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-Form"
					onChange={SelectOcorrence}
					defaultValue="none"
				>
					<option value="none" disabled>
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
					onChange={SelectProblem}
					defaultValue="none"
				>
					<option value="none" disabled>
						Selecione o problema ocorrido
					</option>
					<option value="backup">Backup/Restore</option>
					<option value="mail">E-mail</option>
					<option value="equip">Equipamento</option>
					<option value="user">Gerenciamento de usuário</option>
					<option value="internet">Internet</option>
					<option value="folder">Pasta</option>
					<option value="soft">Software e Aplicativos</option>
					<option value="dados">Integridade de Dados</option>
				</Select>
			)}
			{backup && (
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-backup"
					onChange={SelectBackup}
					defaultValue="none"
				>
					<option value="none" disabled>
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
					onChange={SelectMail}
					defaultValue="none"
				>
					<option value="none" disabled>
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
					onChange={SelectEquip}
					defaultValue="none"
				>
					<option value="none" disabled>
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
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-user"
					onChange={SelectUser}
					defaultValue="none"
				>
					<option value="none" disabled>
						Selecione o problema ocorrido
					</option>
					<option value="adduser">Criar/Excluir usuário de rede</option>
				</Select>
			)}
			{internet && (
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-internet"
					onChange={SelectInternet}
					defaultValue="none"
				>
					<option value="none" disabled>
						Selecione o problema ocorrido
					</option>
					<option value="lib">Liberação de site</option>
					<option value="block">Bloqueio de site</option>
				</Select>
			)}
			{folder && (
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-folder"
					onChange={SelectFolder}
					defaultValue="none"
				>
					<option value="none" disabled>
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
					onChange={SelectProblem}
					defaultValue="none"
				>
					<option value="none" disabled>
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
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-sap"
					onChange={SelectSys}
					defaultValue="none"
				>
					<option value="none" disabled>
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
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-office"
					onChange={SelectOffice}
					defaultValue="none"
				>
					<option value="none" disabled>
						Selecione o Problema
					</option>
					<option value="buy">Aquisição de software/licenciamento</option>
					<option value="error">Correção de falhas</option>
				</Select>
			)}
			{softAPP && (
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-soft"
					onChange={SelectSoftAPP}
					defaultValue="none"
				>
					<option value="none" disabled>
						Selecione o Problema
					</option>
					<option value="install">Instalação de Software Novo</option>
					<option value="error">Erros e Problemas em Softwares Gerais</option>
				</Select>
			)}
			{dadosCase && (
				<Select
					className="form-select mb-3"
					aria-label="Default select example"
					id="select-dado"
					onChange={SelectDado}
					defaultValue="none"
				>
					<option value="none" disabled>
						Selecione o Problema
					</option>
					<option value="corrupted">Arquivo Corrompido</option>
				</Select>
			)}
			{alocate && (
				<div className="w-100">
					<div className="d-flex justify-content-center">
						<Select
							className="form-select mb-3"
							aria-label="Default select example"
							id="select-company-equip"
							onChange={SelectCompanyEquip}
							ref={companyEquip}
							defaultValue="none"
						>
							<option value="none" disabled>
								Selecione uma Unidade
							</option>
							<option value="CSC">CSC</option>
							<option value="fiber">Fiber</option>
							<option value="vera">Vera</option>
							<option value="ropes">Ropes</option>
							<option value="mna">MNA</option>
						</Select>
					</div>
					<div className="d-flex flex-wrap justify-content-center position-relative">
						<div className="d-flex flex-column">
							{dashEquipamentSelected}
							{dateequip && (
								<DayPicker
									mode="multiple"
									disabled={disabledDates}
									onSelect={handleSelect}
									selected={selectedInternal}
									showOutsideDays
									footer={footer}
								/>
							)}
						</div>
						{dashequipaments} {loadingoFetchingEquipaments && <RoboGlimpse />}
					</div>
				</div>
			)}
			{comodato && (
				<Contract className="position-fixed top-50 start-50 translate-middle d-flex flex-column">
					<div className="d-flex">
						<h3 className="text-center w-100 fw-bold">Contrato Comodato</h3>
						<button
							type="button"
							onClick={() => {
								setComodato(false);
							}}
						>
							<img src={Close} alt="botão de fechar" />
						</button>
					</div>
					<div className="d-flex flex-column">
						<h3 className="mt-3">INSTRUMENTO PARTICULAR DE COMODATO</h3>
						<span className="mt-3">
							<b>LUPATECH S.A. - EM RECUPERAÇÃO JUDICIAL, </b>à, Rua Dalton Lanh
							dos reis, 201, bairro Distrito Industrial, no Município de Caxias
							do Sul, Estado de Rio Grande do Sul &ndash; CEP 95112-090,
							regularmente inscrita no CNPJ/MF sob o nº89.463.822/0012-75,
							doravante denominada simplesmente de <b>COMODANTE.</b>
						</span>
						<span className="mt-3">e</span>
						<span className="mt-3">
							<b>{Name}</b>, doravante denominada simplesmente
							<b>COMODATÁRIO</b>.
						</span>
						<span className="mt-3">
							<b>CONSIDERAÇÕES</b>
						</span>
						<span>
							A <b>COMODANTE </b> é proprietária e legítima possuidora do
							seguinte equipamento:
						</span>
					</div>
					<button type="button">Concordo</button>
				</Contract>
			)}
		</>
	);
}
