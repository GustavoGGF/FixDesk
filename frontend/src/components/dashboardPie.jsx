import React, { useState, useEffect } from "react";
import Loading from "./loading";
import { Chart } from "chart.js/auto";
import { Div, Div2 } from "../styles/dashboardPie";

export default function DashBoardPie({ sector }) {
  const [dataPie, setDataPie] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`getDashBoardPie/${sector}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.status === 210) {
          // Faça algo aqui se a resposta for 210
        }

        const data = await response.json();
        setDataPie(data);
        setLoading(false);
        return;
      } catch (err) {
        return console.error(err);
      }
    };

    return fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dash = document.getElementById("dashpie");
    let myChart = null;

    if (dataPie && dataPie.data) {
      if (myChart) {
        myChart.destroy();
      }

      myChart = new Chart(dash, {
        type: "pie",
        data: {
          labels: ["Chamados", "Chamados em Aberto", "Chamados Finalizados", "Chamados Urgentes(mais de 7 dias aberto)"],
          datasets: [
            {
              data: dataPie.data,
              backgroundColor: ["#00b4d8", "#ffd60a", "#38b000", "#d00000"],
              hoverOffset: 4,
            },
          ],
        },
      });

      dash.style.display = "block";
    }
  }, [dataPie]);

  return (
    <Div>
      {loading && <Loading />}
      <Div2>
        <canvas id="dashpie" className="hidden"></canvas>
      </Div2>
    </Div>
  );
}
