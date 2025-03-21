/**
 * Importações internas necessárias para este componente.
 * - React: permite a criação e manipulação de componentes React.
 * - useState: hook que possibilita a adição de estado a componentes funcionais.
 * - useEffect: hook utilizado para executar efeitos colaterais em componentes funcionais, como ações após renderizações.
 * - Loading: componente responsável pela exibição de um indicador de carregamento.
 * - Chart: importação da classe Chart do módulo "chart.js/auto" para a renderização de gráficos.
 */
import React, { useState, useEffect } from "react";
import { Chart } from "chart.js/auto";

/**
 * Importação de um componente que atuará como um elemento do DOM neste componente.
 * - Div: importação do componente Div do módulo "../styles/dashboardPie".
 */
import { Div, Div2 } from "../../styles/dashboardPie";

let myChart = null;
let totalTickets = 0;

export default function DashBoardPie({ sector, clss }) {
  /**
   * Variáveis de estado utilizadas neste componente.
   * - dataPie: estado que armazena os dados para o gráfico de pizza.
   * - loading: estado que controla a exibição do indicador de carregamento.
   */
  const [dataPie, setDataPie] = useState("");

  /**
   * Variável timeoutBarUpdate utilizada para armazenar o identificador do timeout responsável pela atualização contínua do dashboard.
   */
  let timeoutBarUpdate;
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
        const response = await fetch(`getDashBoardPie/${sector}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        if (response.status === 210) {
          // setLoading(true);
          // Faça algo aqui se a resposta for 210
        }

        const data = await response.json();

        setDataPie(data);
        CallNewBar();
        return;
      } catch (err) {
        return console.error(err);
      }
    };

    return fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Acionado sempre que os dados do dashboard de pizza (dataPie) são atualizados.
   * - Obtém a referência do elemento DOM que representa o dashboard de pizza.
   * - Inicializa uma variável local para armazenar a instância do gráfico.
   * - Verifica se existem dados válidos para o gráfico de pizza.
   * - Se existirem dados válidos, cria um novo gráfico de pizza utilizando os dados atualizados.
   * - Se um gráfico anterior já existir, ele é destruído para evitar duplicatas.
   * - Define o gráfico como estado e exibe o dashboard de pizza.
   * - O efeito é executado sempre que os dados do dashboard de pizza são modificados.
   */
  useEffect(() => {
    const dash = document.getElementById("dashpie");

    if (dataPie && dataPie.data) {
      if (myChart) {
        myChart.destroy();
      }

      totalTickets = dataPie.data.shift();

      myChart = new Chart(dash, {
        type: "pie",
        data: {
          labels: ["Chamados em Aberto", "Chamados Finalizados", "Chamados em Aguardo", "Chamados Urgentes(mais de 7 dias aberto)"],
          datasets: [
            {
              data: dataPie.data,
              backgroundColor: ["#ffd60a", "#38b000", "#f9f9f9", "#d00000"],
              hoverOffset: 4,
            },
          ],
        },
      });

      dash.style.display = "block";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataPie]);

  function CallNewBar() {
    if (timeoutBarUpdate) {
      clearTimeout(timeoutBarUpdate);
    }

    timeoutBarUpdate = setTimeout(() => {
      fetchPie();
    }, 60000);
  }

  function fetchPie() {
    const fetchData = async () => {
      try {
        const response = await fetch(`getDashBoardPie/${sector}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Cache-Control": "no-cache",
          },
        });

        if (response.status === 210) {
          // setLoading(true);
          // Faça algo aqui se a resposta for 210
        }

        const data = await response.json();

        setDataPie(data);
        // setLoading(false);
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
