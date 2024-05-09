/**
 * Importações internas necessárias para este componente.
 * - React: permite a criação e manipulação de componentes React.
 * - useState: hook que possibilita a adição de estado a componentes funcionais.
 * - useEffect: hook utilizado para executar efeitos colaterais em componentes funcionais, como ações após renderizações.
 * - Loading: componente responsável pela exibição de um indicador de carregamento.
 * - Chart: importação da classe Chart do módulo "chart.js/auto" para a renderização de gráficos.
 */
import React, { useState, useEffect } from "react";
import Loading from "./loading";
import { Chart } from "chart.js/auto";

/**
 * Importação de um componente que atuará como um elemento do DOM neste componente.
 * - Div: importação do componente Div do módulo "../styles/dashboardPie".
 */
import { Div } from "../styles/dashboardPie";

export default function DashBoardPie({ sector }) {
  /**
   * Variáveis de estado utilizadas neste componente.
   * - dataPie: estado que armazena os dados para o gráfico de pizza.
   * - loading: estado que controla a exibição do indicador de carregamento.
   */
  const [dataPie, setDataPie] = useState("");
  const [loading, setLoading] = useState(true);

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
          },
        });

        if (response.status === 210) {
          setLoading(true);
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
      <div>
        <canvas id="dashpie" className="hidden"></canvas>
      </div>
    </Div>
  );
}
