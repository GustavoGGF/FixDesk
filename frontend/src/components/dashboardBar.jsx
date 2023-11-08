import React, { useState, useEffect } from "react";
import Loading from "./loading";
import { Div1, DivContainer, Div2 } from "../styles/dashboardBar";
import { Chart } from "chart.js/auto";

export default function DashboardBar() {
  const [loadingHistogram, setLoadingHistogram] = useState(true);
  const [histogram, SetHistogram] = useState(false);
  const [histogramData, SetHistogramData] = useState([]);
  const [labeldash, Setlabeldash] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("getDashBoardBar/", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.status === 210) {
          // Faça algo aqui se a resposta for 210
        }

        const data = await response.json();
        Setlabeldash("Chamados da Semana");
        SetHistogramData(data);
        SetHistogram(true);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const dashbar = document.getElementById("histogramRC");
    let myChart = null;

    if (histogramData && histogramData.days) {
      if (myChart) {
        myChart.destroy();
      }

      myChart = new Chart(dashbar, {
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
    } else {
      return;
    }

    dashbar.style.display = "block";

    setLoadingHistogram(false);

    return () => {
      if (myChart) {
        myChart.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [histogramData]);

  return (
    <Div1 className="mt-5 mb-5 position-relative">
      <div className="position-relative">
        <div className="h-100 w-100 d-flex justify-content-center">
          {loadingHistogram && <Loading />}
        </div>
        <Div2 className="d-flex flex-column">
          <select className="form-select" id="select" onChange={"changePeriod"}>
            <option value="1" selected>
              Está Semana
            </option>
            <option value="2">Este Mês</option>
            <option value="3">Este Ano</option>
            <option value="4">Todo Período</option>
          </select>
          {histogram && <canvas id="histogramRC" className="hidden"></canvas>}
        </Div2>
      </div>
      <DivContainer>
        <canvas id="pie"></canvas>
      </DivContainer>
    </Div1>
  );
}
