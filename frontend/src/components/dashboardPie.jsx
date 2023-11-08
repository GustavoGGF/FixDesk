import React, { useState, useEffect } from "react";
import Loading from "./loading";
import { Chart } from "chart.js/auto";
import { Div, Div2 } from "../styles/dashboardPie";

export default function DashBoardPie({ sector }) {
  const [dataPie, SetDataPie] = useState("");
  const [showpie, SetShowpie] = useState(false);
  const [loading, SetLoading] = useState(true);

  useEffect(() => {
    fetch(`getDashBoardPie/${sector}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        SetDataPie(data);
        SetLoading(false);
        SetShowpie(true);
        return dataPie;
      })
      .catch((err) => {
        return console.log(err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dash = document.getElementById("pie");
    let myChart = null;

    if (myChart) {
      myChart.destroy();
    }

    myChart = new Chart(dash, {
      type: "pie",
      data: {
        labels: [
          "Chamados",
          "Chamados em Aberto",
          "Chamados Finalizados",
          "Chamados Urgentes",
        ],
        datasets: [
          {
            data: dataPie.data,
            backgroundColor: [
              "rgb(0, 180, 216)",
              "rgb(255, 214, 10)",
              "rgb(56, 176, 0)",
              "rgb(208, 0, 0)",
            ],
            hoverOffset: 4,
          },
        ],
      },
    });

    return () => {
      if (myChart) {
        myChart.destroy();
      }
    };
  }, [dataPie]);

  return (
    <Div>
      {loading && <Loading />}
      <Div2>{showpie && <canvas id="pie"></canvas>}</Div2>
    </Div>
  );
}
