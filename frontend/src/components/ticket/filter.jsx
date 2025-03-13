import React, { useEffect, useRef, useState, useContext } from "react";
import { DivFilter, Input1, Select1, DivContainerImages, PSelectView, DivImages, IMGS1, PQuantity, Button1, Button2, DivSelectView, ImgSelectView } from "../../styles/filter";
import IMG1 from "../../images/dashboard_TI/quantity_1.png";
import IMG2 from "../../images/dashboard_TI/quantity_2.png";
import IMG3 from "../../images/dashboard_TI/quantity_3.png";
import IMG4 from "../../images/dashboard_TI/quantity_4.png";
import List from "../../images/components/lista-de-itens.png";
import Card from "../../images/components/identificacao.png";
import { TicketContext } from "../../context/TicketContext";
import { MessageContext } from "../../context/MessageContext";
// import { FilterContext } from "../../context/FilterContext";

export default function FilterTickets({ url, blurNav, themeFilter, dateValue, quantityMap, statusFilter, userName, moreTickets }) {
  const [fakeSelect, setFakeSelect] = useState(true);
  const [problemInfra, setProblemInfra] = useState(false);
  const [problemSyst, setProblemSyst] = useState(false);

  const selectOccurrence = useRef(null);
  const selectProblem = useRef(null);
  const dateSelect = useRef(null);
  const fiveView = useRef(null);
  const thenView = useRef(null);
  const fiftyView = useRef(null);
  const allView = useRef(null);
  const btnOpen = useRef(null);
  const btnClose = useRef(null);
  const btnStop = useRef(null);
  const btnAll = useRef(null);

  const { setLoadingDash, setBtnMore, setCardOrList, setTicketData } = useContext(TicketContext);
  const { setMessage, setMessageError, setTypeError } = useContext(MessageContext);
  useEffect(() => {
    if (moreTickets > 0) {
      getTicketFilter({ id: "null", quantity: moreTickets, statusTicket: "null", search_query: "null" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moreTickets]);

  // const {} = useContext(FilterContext);
  useEffect(() => {
    dateSelect.current.value = dateValue;
  }, [dateValue]);

  useEffect(() => {
    // Mapeia valores de quantity para os refs correspondentes
    const refMapQuantity = {
      5: fiveView,
      10: thenView,
      50: fiftyView,
      100000: allView, // Supondo que "all" seja um valor possível
    };

    // Obtém o ref correspondente ao valor de quantity
    const selectedRefQuantity = refMapQuantity[quantityMap];

    // Aplica o estilo apenas se o ref existir
    if (selectedRefQuantity?.current) {
      selectedRefQuantity.current.style.backgroundColor = "#00B4D8";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantityMap]);

  useEffect(() => {
    switch (statusFilter) {
      default:
        break;
      case "open":
        btnOpen.current.classList.add("btn-open"); // Marca o botão "Open" como ativo
        break;
      case "stop":
        btnStop.current.classList.add("btn-light"); // Remove o estilo de luz do botão "Stop"
        break;
      case "close":
        btnClose.current.classList.add("btn-success"); // Remove o estilo de sucesso do botão "Close"
        break;
      case "all":
        btnAll.current.classList.add("btn-all"); // Remove o estilo do botão "All"
        break;
    }
  }, [statusFilter]);

  function validateSelectFilter() {
    if (selectOccurrence.current) {
      switch (selectOccurrence.current.value) {
        default:
          break;
        case "Infraestrutura":
          setFakeSelect(false);
          setProblemInfra(true);
          setProblemSyst(false);
          break;
        case "Sistema":
          setFakeSelect(false);
          setProblemInfra(false);
          setProblemSyst(true);
          break;
        case "all":
          setFakeSelect(true);
          setProblemInfra(false);
          setProblemSyst(false);
      }
    }
    if (selectProblem.current) {
      selectProblem.current.value = "";
    }
  }

  function getTicketFilter({ id, quantity, statusTicket, search_query }) {
    setTicketData([]);
    setLoadingDash(true);

    if (id !== "null") {
      switch (id) {
        default:
          break;
        case "fiveView":
          fiveView.current.style.backgroundColor = "#00B4D8";
          thenView.current.style.backgroundColor = "transparent";
          fiftyView.current.style.backgroundColor = "transparent";
          allView.current.style.backgroundColor = "transparent";
          break;
        case "thenView":
          fiveView.current.style.backgroundColor = "transparent";
          thenView.current.style.backgroundColor = "#00B4D8";
          fiftyView.current.style.backgroundColor = "transparent";
          allView.current.style.backgroundColor = "transparent";
          break;
        case "fiftyView":
          fiveView.current.style.backgroundColor = "transparent";
          thenView.current.style.backgroundColor = "transparent";
          fiftyView.current.style.backgroundColor = "#00B4D8";
          allView.current.style.backgroundColor = "transparent";
          break;
        case "allView":
          fiveView.current.style.backgroundColor = "transparent";
          thenView.current.style.backgroundColor = "transparent";
          fiftyView.current.style.backgroundColor = "transparent";
          allView.current.style.backgroundColor = "#00B4D8";
          break;
      }
    }

    if (statusTicket !== "null") {
      switch (statusTicket) {
        default:
          break;
        case "open":
          btnOpen.current.classList.add("btn-open"); // Marca o botão "Open" como ativo
          btnStop.current.classList.remove("btn-light");
          btnClose.current.classList.remove("btn-success");
          btnAll.current.classList.remove("btn-all");
          break;
        case "stop":
          btnOpen.current.classList.remove("btn-open"); // Marca o botão "Open" como ativo
          btnStop.current.classList.add("btn-light");
          btnClose.current.classList.remove("btn-success");
          btnAll.current.classList.remove("btn-all");
          break;
        case "close":
          btnOpen.current.classList.remove("btn-open"); // Marca o botão "Open" como ativo
          btnStop.current.classList.remove("btn-light");
          btnClose.current.classList.add("btn-success");
          btnAll.current.classList.remove("btn-all");
          break;
        case "all":
          btnOpen.current.classList.remove("btn-open"); // Marca o botão "Open" como ativo
          btnStop.current.classList.remove("btn-light");
          btnClose.current.classList.remove("btn-success");
          btnAll.current.classList.add("btn-all");
          break;
      }
    }

    var orderTicket = dateSelect.current.value;

    if (statusTicket === "null") {
      statusTicket = localStorage.getItem("status");
    }

    var sector = selectOccurrence.current.value;
    var occurrence = "null";

    if (selectProblem.current) {
      occurrence = selectProblem.current.value;
    }

    if (occurrence === "") {
      occurrence = "null";
    }

    if (search_query === "") {
      search_query = "null";
    }

    if (quantity === "null") {
      quantity = localStorage.getItem("quantity");
    }

    fetch("/helpdesk/get-ticket-filter/" + url + "/" + sector + "/" + occurrence + "/" + orderTicket + "/" + userName + "/" + quantity + "/" + statusTicket + "/" + search_query, {
      method: "GET",
      headers: {
        Accept: "application/json",
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
          return;
        } else {
          setLoadingDash(false);
          localStorage.setItem("quantity", quantity);
          localStorage.setItem("status", statusTicket);
          localStorage.setItem("order", orderTicket);
          return setTicketData(data.tickets);
        }
      })
      .catch((err) => {
        setMessageError(err);
        setTypeError("Fatal ERROR");
        setMessage(true);
        return console.log(err);
      });
  }

  return (
    <DivFilter className={`${blurNav} ${themeFilter}`}>
      <div className="form-floating">
        <Input1
          type="text"
          className="form-control"
          id="floatingInput"
          onKeyUp={(event) => {
            getTicketFilter({ id: "null", quantity: "null", statusTicket: "null", search_query: event.target.value });
          }}
        />
        <label htmlFor="floatingInput">Ocorrência | Problema | Data...</label>
      </div>
      <Select1
        id="selectOcorrence"
        className="form-select"
        ref={selectOccurrence}
        onChange={() => {
          validateSelectFilter();
          getTicketFilter({ id: "null", quantity: "null", statusTicket: "null", search_query: "null" });
        }}
      >
        <option value="null" selected disabled>
          Tipo de Ocorrência
        </option>
        <option value="Infraestrutura">Infra</option>
        <option value="Sistema">Sistema</option>
        <option value="all">Todos</option>
      </Select1>
      {fakeSelect && (
        <Select1 className="form-select" disabled>
          <option selected value="null">
            Problema
          </option>
        </Select1>
      )}
      {problemInfra && (
        <Select1
          id="selectBo"
          className="form-select"
          ref={selectProblem}
          onChange={() => {
            getTicketFilter({ id: "null", quantity: "null", statusTicket: "null", search_query: "null" });
          }}
        >
          <option value="null" selected disabled>
            Problema
          </option>
          <option value="Backup">Backup/Restore</option>
          <option value="E-mail">E-mail</option>
          <option value="Equipamento">Equipamento</option>
          <option value="Gerenciamento de Usuario">Gerenciamento de Usuario</option>
          <option value="Internet">Internet</option>
          <option value="Permissão">Pasta</option>
          <option value="Novo SoftWare">Software e Aplicativos</option>
          <option value="Integridade de Dados">Integridade de Dados</option>
          <option value="all">Todos</option>
        </Select1>
      )}
      {problemSyst && (
        <Select1
          id="selectBo"
          className="form-select"
          ref={selectProblem}
          onChange={() => {
            getTicketFilter({ id: "null", quantity: "null", statusTicket: "null", search_query: "null" });
          }}
        >
          <option value="null" selected disabled>
            Problema
          </option>
          <option value="SAP">SAP</option>
          <option value="MBI">MBI</option>
          <option value="Synchro">Synchro</option>
          <option value="Office">Office</option>
          <option value="Softwares de Eng">Softwares de Eng</option>
          <option value="all">Todos</option>
        </Select1>
      )}
      <Select1
        ref={dateSelect}
        name=""
        id="select-order"
        className="form-select"
        onChange={() => {
          getTicketFilter({ id: "null", quantity: "null", statusTicket: "null", search_query: "null" });
        }}
      >
        <option value="none" disabled>
          Ordernar
        </option>
        <option value="-id">Data Recente</option>
        <option value="id">Data Antiga</option>
      </Select1>
      <DivContainerImages className="d-flex">
        <PSelectView className="position-absolute top-0 start-0 translate-middle">Quantidade</PSelectView>
        <DivImages
          className="btn"
          id="fiveView"
          ref={fiveView}
          onClick={() => {
            getTicketFilter({ id: "fiveView", quantity: 5, statusTicket: "null", search_query: "null" });
          }}
        >
          <IMGS1 src={IMG1} alt="" />
          <PQuantity>5</PQuantity>
        </DivImages>
        <DivImages
          className="btn"
          id="thenView"
          ref={thenView}
          onClick={() => {
            getTicketFilter({ id: "thenView", quantity: 10, statusTicket: "null", search_query: "null" });
          }}
        >
          <IMGS1 src={IMG2} alt="" />
          <PQuantity>10</PQuantity>
        </DivImages>
        <DivImages
          className="btn"
          id="fiftyView"
          ref={fiftyView}
          onClick={() => {
            getTicketFilter({ id: "fiftyView", quantity: 50, statusTicket: "null", search_query: "null" });
          }}
        >
          <IMGS1 src={IMG3} alt="" />
          <PQuantity>50</PQuantity>
        </DivImages>
        <DivImages
          className="btn"
          id="allView"
          ref={allView}
          onClick={() => {
            getTicketFilter({ id: "allView", quantity: 100000, statusTicket: "null", search_query: "null" });
          }}
        >
          <IMGS1 src={IMG4} alt="" />
          <PQuantity>todos</PQuantity>
        </DivImages>
      </DivContainerImages>
      <DivSelectView>
        <PSelectView className="position-absolute top-0 start-0 translate-middle">Modo de Visualização</PSelectView>
        <button
          className="btn"
          id="selectView-List"
          onClick={() => {
            setCardOrList("List");
          }}
        >
          <ImgSelectView src={List} className="img-fluid" alt="" />
        </button>
        <button
          className="btn"
          id="selectView-Card"
          onClick={() => {
            setCardOrList("Card");
          }}
        >
          <ImgSelectView src={Card} clasName="img-fluid" alt="" />
        </button>
      </DivSelectView>
      <DivSelectView>
        <PSelectView className="position-absolute top-0 start-0 translate-middle">Status</PSelectView>
        <Button1
          className="btn"
          id="btnopen"
          ref={btnOpen}
          onClick={() => {
            getTicketFilter({ id: "null", quantity: "null", statusTicket: "open", search_query: "null" });
          }}
        >
          Aberto
        </Button1>
        <button
          className="btn"
          value="close"
          id="btnclose"
          ref={btnClose}
          onClick={() => {
            getTicketFilter({ id: "null", quantity: "null", statusTicket: "close", search_query: "null" });
          }}
        >
          Fechado
        </button>
        <button
          className="btn"
          value="close"
          id="btnstop"
          ref={btnStop}
          onClick={() => {
            getTicketFilter({ id: "null", quantity: "null", statusTicket: "stop", search_query: "null" });
          }}
        >
          Aguardo
        </button>
        <Button2
          className="btn"
          value="all"
          id="btnall"
          ref={btnAll}
          onClick={() => {
            getTicketFilter({ id: "null", quantity: "null", statusTicket: "all", search_query: "null" });
          }}
        >
          Todos
        </Button2>
      </DivSelectView>
    </DivFilter>
  );
}
