import React, { useState, useEffect } from "react";
import Loading from "./loading";
import { Div1, Div2 } from "../styles/dashboardBar";
import { Chart } from "chart.js/auto";
import Message from "./message";

export default function DashboardBar() {
  const [loadingHistogram, setLoadingHistogram] = useState(true);
  const [histogramData, SetHistogramData] = useState([]);
  const [labeldash, Setlabeldash] = useState("");
  const [myChart, setMyChart] = useState(null);
  const [message, SetMessage] = useState(false);
  const [typeError, SetTypeError] = useState("");
  const [messageError, SetMessageError] = useState("");

  let timeoutBR;
  let callBar = "";

  useEffect(() => {
    periodweek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const initFunct = () => {
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

        return () => {
          if (myChart) {
            myChart.destroy();
          }
        };
      } catch (err) {
        console.log(err);
      }
    };

    initFunct();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [histogramData]);

  function CallNewBar() {
    console.log(callBar);
    if (callBar === "week") {
      if (timeoutBR) {
        clearTimeout(timeoutBR);
      }
      return (timeoutBR = setTimeout(CallNewBar && periodweek, 60000));
    } else if (callBar === "month") {
      if (timeoutBR) {
        clearTimeout(timeoutBR);
      }
      return (timeoutBR = setTimeout(CallNewBar && periodMonth, 60000));
    } else if (callBar === "year") {
      if (timeoutBR) {
        clearTimeout(timeoutBR);
      }
      return (timeoutBR = setTimeout(CallNewBar && periodYear, 60000));
    } else if (callBar === "all") {
      if (timeoutBR) {
        clearTimeout(timeoutBR);
      }
      return (timeoutBR = setTimeout(CallNewBar && periodAll, 60000));
    } else if (callBar === "") {
      if (timeoutBR) {
        clearTimeout(timeoutBR);
      }
      return;
    }
  }

  function changePeriod() {
    const select = document.getElementById("select");
    const period = select.options[select.selectedIndex].value;

    if (period === "1") {
      return periodweek();
    } else if (period === "2") {
      return periodMonth();
    } else if (period === "3") {
      return periodYear();
    } else if (period === "4") {
      return periodAll();
    } else {
      return;
    }
  }

  function periodMonth() {
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

          SetMessage(true);
          SetTypeError("Falta de Dados");
          SetMessageError("Buscando Chamados do Ano");
          callBar = "";

          return window.addEventListener("load", periodYear());
        }
        return response.json();
      })
      .then((data) => {
        callBar = "month";
        Setlabeldash("Chamados do Mês");
        SetHistogramData(data);
        CallNewBar();
        return;
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function periodweek() {
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

          SetMessage(true);
          SetTypeError("Falta de Dados");
          SetMessageError("Buscando Chamados do Mês");
          callBar = "";

          return window.addEventListener("load", periodMonth());
        }
        return response.json();
      })
      .then((data) => {
        callBar = "week";
        Setlabeldash("Chamados da Semana");
        CallNewBar();
        SetHistogramData(data);
        return;
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  function periodYear() {
    Setlabeldash("");
    SetHistogramData([]);
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

          SetMessage(true);
          SetTypeError("Falta de Dados");
          SetMessageError("Buscando Todos os Chamados");
          callBar = "";

          return window.addEventListener("load", periodAll());
        }
        return response.json();
      })
      .then((data) => {
        callBar = "year";
        Setlabeldash("Chamados deste Ano");
        SetHistogramData(data);
        CallNewBar();
        return;
      })
      .catch((err) => {
        return console.log(err);
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

          SetMessage(true);
          SetTypeError("Falta de Dados");
          SetMessageError("Nenhum Chamado Foi Criado");
          setLoadingHistogram(false);
          callBar = "";
        }
        return response.json();
      })
      .then((data) => {
        callBar = "all";
        Setlabeldash("Todos os Chamados");
        SetHistogramData(data);
        CallNewBar();
        return;
      })
      .catch((err) => {
        return console.log(err);
      });
  }

  return (
    <Div1 className="mt-5 mb-5 position-relative">
      {message && (
        <div className="position-absolute top-50 start-50 translate-middle z-1">
          <Message
            TypeError={typeError}
            MessageError={messageError}
            CloseMessage={() => {
              SetTypeError("");
              SetMessage("");
              SetMessage(false);
              return;
            }}
          />
        </div>
      )}
      <div className="position-relative">
        <div className="h-100 w-100 d-flex justify-content-center">
          {loadingHistogram && <Loading />}
        </div>
        <Div2 className="d-flex flex-column">
          <select className="form-select" id="select" onChange={changePeriod}>
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
