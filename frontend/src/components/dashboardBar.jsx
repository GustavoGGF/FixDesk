import React, { useState, useEffect } from "react";
import { Chart } from "chart.js/auto";

import Loading from "./loading";
import Message from "./message";
import { Div1, Div2 } from "../styles/dashboardBar";

export default function DashboardBar() {
  const [loadingHistogram, setLoadingHistogram] = useState(true);
  const [histogramData, setHistogramData] = useState([]);
  const [labeldash, setLabelDash] = useState("");
  const [myChart, setMyChart] = useState(null);
  const [message, setMessage] = useState(false);
  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");

  let timeoutBarUpdate;
  let barChartData = "";

  useEffect(() => {
    periodweek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function periodweek() {
    setLabelDash("");
    setHistogramData([]);
    fetch("getDashBoardBar/week/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.status === 210) {
          const select = document.getElementById("select");
          select.value = "2";
          setMessage(true);
          setTypeError("Falta de Dados");
          setMessageError("Buscando Chamados do Mês");
          barChartData = "";
          periodMonth();
        }
        return response.json();
      })
      .then((data) => {
        barChartData = "week";
        setLabelDash("Chamados da Semana");
        CallNewBar();
        setHistogramData(data);
      })
      .catch((err) => {
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError(err);
      });
  }

  function periodMonth() {
    setLabelDash("");
    setHistogramData([]);
    fetch("getDashBoardBar/updateMonth/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.status === 210) {
          const select = document.getElementById("select");
          select.value = "3";
          setMessage(true);
          setTypeError("Falta de Dados");
          setMessageError("Buscando Chamados do Ano");
          barChartData = "";
          periodYear();
        }
        return response.json();
      })
      .then((data) => {
        barChartData = "month";
        setLabelDash("Chamados do Mês");
        setHistogramData(data);
        CallNewBar();
      })
      .catch((err) => {
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError(err);
      });
  }

  function periodYear() {
    setLabelDash("");
    setHistogramData([]);
    fetch("getDashBoardBar/updateYear/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.status === 210) {
          const select = document.getElementById("select");
          select.value = "4";
          setMessage(true);
          setTypeError("Falta de Dados");
          setMessageError("Buscando Todos os Chamados");
          barChartData = "";
          periodAll();
        }
        return response.json();
      })
      .then((data) => {
        barChartData = "year";
        setLabelDash("Chamados deste Ano");
        setHistogramData(data);
        CallNewBar();
      })
      .catch((err) => {
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError(err);
      });
  }

  function periodAll() {
    fetch("getDashBoardBar/updateAll/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.status === 210) {
          const select = document.getElementById("select");

          select.value = "4";

          setMessage(true);
          setTypeError("Falta de Dados");
          setMessageError("Nenhum Chamado Foi Criado");
          setLoadingHistogram(false);
          barChartData = "";
        }
        return response.json();
      })
      .then((data) => {
        barChartData = "all";
        setLabelDash("Todos os Chamados");
        setHistogramData(data);
        CallNewBar();
      })
      .catch((err) => {
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError(err);
      });
  }

  useEffect(() => {
    const initChart = () => {
      try {
        const dashbar = document.getElementById("dashbar");

        if (histogramData && histogramData.days && histogramData.values) {
          if (myChart) {
            myChart.destroy();
          }

          const newChart = new Chart(dashbar, {
            type: "bar",
            data: {
              labels: histogramData.days,
              datasets: [
                {
                  label: [labeldash],
                  data: histogramData.values,
                },
              ],
            },
          });

          setMyChart(newChart);

          dashbar.style.display = "block";

          setLoadingHistogram(false);
        } else {
          dashbar.style.display = "block";

          setLoadingHistogram(false);
        }
      } catch (err) {
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError(err);
        console.log(err);
      }
    };

    initChart();

    return () => {
      if (myChart) {
        myChart.destroy();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [histogramData]);

  function CallNewBar() {
    if (timeoutBarUpdate) {
      clearTimeout(timeoutBarUpdate);
    }

    let updateFunction;

    switch (barChartData) {
      case "week":
        updateFunction = periodweek;
        break;
      case "month":
        updateFunction = periodMonth;
        break;
      case "year":
        updateFunction = periodYear;
        break;
      case "all":
        updateFunction = periodAll;
        break;
      default:
        return;
    }

    timeoutBarUpdate = setTimeout(() => {
      updateFunction();
    }, 60000);
  }

  function changePeriod() {
    const select = document.getElementById("select");
    const period = select.options[select.selectedIndex].value;

    switch (period) {
      case "1":
        periodweek();
        break;
      case "2":
        periodMonth();
        break;
      case "3":
        periodYear();
        break;
      case "4":
        periodAll();
        break;
      default:
        console.log("periodo inválido: ", period);
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError("Periodo inválido:", period);
        break;
    }
  }

  return (
    <Div1 className="mt-5 mb-5 position-relative">
      {message && (
        <div className="position-absolute top-50 start-50 translate-middle z-1">
          <Message
            TypeError={typeError}
            MessageError={messageError}
            CloseMessage={() => {
              setTypeError("");
              setMessageError("");
              setMessage(false);
              return;
            }}
          />
        </div>
      )}
      <div>
        <div className="h-100 w-100 d-flex justify-content-center">{loadingHistogram && <Loading />}</div>
        <Div2 className="d-flex flex-column">
          <select className="form-select" id="select" onChange={changePeriod} defaultValue="1">
            <option value="1" selected>
              Está Semana
            </option>
            <option value="2">Este Mês</option>
            <option value="3">Este Ano</option>
            <option value="4">Todo Período</option>
          </select>
          <canvas id="dashbar"></canvas>
        </Div2>
      </div>
    </Div1>
  );
}
