/**
 * Importações internas necessárias para este componente.
 * - React: permite a criação e manipulação de componentes React.
 * - useState: hook que possibilita a adição de estado a componentes funcionais.
 * - useEffect: hook utilizado para executar efeitos colaterais em componentes funcionais, como ações após renderizações.
 * - Loading: componente responsável pela exibição de um indicador de carregamento.
 * - Chart: importação da classe Chart do módulo "chart.js/auto" para a renderização de gráficos.
 */
import React, { useState, useEffect, useRef, useContext } from "react";
import { Chart } from "chart.js/auto";

/**
 * Importação de um componente que atuará como um elemento do DOM neste componente.
 * - Div: importação do componente Div do módulo "../styles/dashboardPie".
 */
import { Div, Div2 } from "../../styles/dashboardPie";
import { TicketContext } from "../../context/TicketContext";

let myChart = null;

export default function DashBoardPie({ sector, clss }) {
  /**
   * Variáveis de estado utilizadas neste componente.
   * - dataPie: estado que armazena os dados para o gráfico de pizza.
   */
  const [dataPie, setDataPie] = useState("");

  const { totalTickets, setTotalTickets } = useContext(TicketContext);

  const timeoutRef = useRef(null);

  /**
   * - Acionado ao inicializar o componente para buscar dados para o dashboard de pizza.
   * - Utiliza uma função assíncrona para realizar a requisição dos dados.
   * - Realiza uma requisição GET para obter os dados do dashboard de pizza.
   * - Se a resposta for 210, define o estado de loading como verdadeiro.
   * - Se a requisição for bem-sucedida, define os dados recebidos como estado e define loading como falso.
   * - Em caso de erro, imprime o erro no console.
   * - A função de limpeza da useEffect não é necessária neste caso, pois não há nada para limpar.
   * - O useEffect é executado apenas uma vez após a montagem do componente devido à dependência vazia [].
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`get-dash-board-pie/${sector}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        const data = await response.json();
        setDataPie(data.data);

        return dataPie;
      } catch (err) {
        return console.error(err);
      }
    };

    return fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dataPie && dataPie.length !== 0) {
      try {
        const dash = document.getElementById("dashpie");
        if (myChart) {
          myChart.destroy();
        }

        var total = dataPie.at(0);
        setTotalTickets(total);

        var dataPieCopy = dataPie; // Cria uma cópia do array

        dataPieCopy = dataPieCopy.slice(1);

        myChart = new Chart(dash, {
          type: "pie",
          data: {
            labels: [
              "Chamados em Aberto",
              "Chamados Finalizados",
              "Chamados em Aguardo",
              "Chamados Urgentes(mais de 7 dias aberto)",
            ],
            datasets: [
              {
                data: dataPieCopy,
                backgroundColor: ["#ffd60a", "#38b000", "#f9f9f9", "#d00000"],
                hoverOffset: 4,
              },
            ],
          },
        });

        dash.style.display = "block";

        return CallNewBar();
      } catch (err) {
        return console.log(err);
      }
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataPie]);

  function CallNewBar() {
    // Se já houver um timeout ativo, não cria um novo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      FetchPie();
      timeoutRef.current = null; // Reseta após a execução
    }, 60000);
  }

  function FetchPie() {
    const fetchData = async () => {
      try {
        const response = await fetch(`get-dash-board-pie/${sector}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        const data = await response.json();

        if (JSON.stringify(data.data) !== JSON.stringify(dataPie)) {
          setDataPie(data.data);
        }
        CallNewBar();
        return;
      } catch (err) {
        if (err instanceof SyntaxError) {
          return (window.location.href = "/login");
        }
        return console.error(err);
      }
    };

    return fetchData();
  }

  return (
    <Div>
      <Div2>
        <canvas id="dashpie" className="hidden"></canvas>
      </Div2>
      <div className="d-flex w-100 text-center justify-content-center">
        <p className={clss}>{totalTickets}</p>
      </div>
    </Div>
  );
}
