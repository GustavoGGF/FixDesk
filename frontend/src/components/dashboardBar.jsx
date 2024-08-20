/**
 * Importações internas do React necessárias para o funcionamento deste componente.
 * - React: permite a criação e manipulação de componentes React.
 * - useState: hook que possibilita a adição de estado a componentes funcionais.
 * - useEffect: hook utilizado para executar efeitos colaterais em componentes funcionais, como ações após renderizações.
 * - useRef: hook que fornece uma maneira de armazenar referências a elementos DOM ou valores mutáveis que persistem entre as renderizações.
 * Importação da classe Chart do módulo "chart.js/auto" para a renderização de gráficos.
 */
import React, { useState, useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

/**
 * Importações de componentes e estilos já criados neste projeto.
 * - Loading: componente responsável pela exibição de um indicador de carregamento.
 * - Message: componente utilizado para exibir mensagens ao usuário.
 * - Div1 e Div2: estilos importados do módulo "../styles/dashboardBar", utilizados para estilizar elementos do componente DashboardBar.
 */
import Loading from "./loading";
import Message from "./message";
import { Div1, Div2 } from "../styles/dashboardBar";

export default function DashboardBar() {
  /**
   * Constantes de estado utilizadas neste componente para gerenciar diferentes aspectos da sua funcionalidade.
   * - loadingHistogram: estado que controla a exibição do indicador de carregamento para o histograma.
   * - histogramData: estado que armazena os dados do histograma.
   * - labeldash: estado utilizado para definir o rótulo do dashboard.
   * - myChart: estado que mantém a instância do gráfico criado com a biblioteca Chart.js.
   * - message: estado que controla a exibição de mensagens no componente.
   * - typeError: estado que define o tipo de erro ocorrido.
   * - messageError: estado que armazena a mensagem de erro a ser exibida.
   */
  const [loadingHistogram, setLoadingHistogram] = useState(true);
  const [histogramData, setHistogramData] = useState([]);
  const [labeldash, setLabelDash] = useState("");
  const [myChart, setMyChart] = useState(null);
  const [message, setMessage] = useState(false);
  const [typeError, setTypeError] = useState("");
  const [messageError, setMessageError] = useState("");

  /**
   * Constantes useRef utilizadas para referenciar elementos do DOM neste componente.
   * - selectPeriod: referência ao elemento select utilizado para selecionar o período.
   * - dashboardBar: referência ao elemento DOM que representa a barra do dashboard.
   * - timeoutBarUpdateRef: referência ao elemento timeout para buscar informações em determinado periodo.
   */
  const dashboardBar = useRef(null);
  const selectPeriod = useRef(null);
  const timeoutBarUpdateRef = useRef(null);

  /**
   * Variável timeoutBarUpdate utilizada para armazenar o identificador do timeout responsável pela atualização contínua do dashboard.
   * barChartData: variável que armazena os dados do dashboard em formato de string.
   */
  let barChartData = "";

  /**
   * Efeito colateral utilizado para buscar os dados da semana ao inicializar o componente.
   * - periodweek(): função responsável por buscar os dados da semana.
   * A dependência vazia [] garante que o efeito será executado apenas uma vez após a montagem do componente.
   */
  useEffect(() => {
    periodweek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Função periodweek() utilizada para buscar os dados semanais para o dashboard.
   * - Reinicia o rótulo do dashboard e os dados do histograma.
   * - Realiza uma requisição GET para obter os dados da semana.
   * - Se o status da resposta for 210 (falta de dados), a função tenta buscar os dados mensais e exibe uma mensagem informativa.
   * - Se a requisição for bem-sucedida, atualiza o rótulo do dashboard, chama a função CallNewBar() para atualizar o gráfico e define os dados do histograma.
   * - Em caso de erro, exibe uma mensagem de erro.
   */
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
          try {
            selectPeriod.current.value = "2";
            setMessage(true);
            setTypeError("Falta de Dados");
            setMessageError("Buscando Chamados do Mês");
            barChartData = "";
            periodMonth();
          } catch (err) {
            console.log(err);
          }
        }
        return response.json();
      })
      .then((data) => {
        try {
          barChartData = "week";
          setLabelDash("Chamados da Semana");
          CallNewBar();
          setHistogramData(data);
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError(err);
      });
  }

  /**
   * Função periodMonth() utilizada para buscar os dados mensais para o dashboard.
   * - Reinicia o rótulo do dashboard e os dados do histograma.
   * - Realiza uma requisição GET para obter os dados do mês.
   * - Se o status da resposta for 210 (falta de dados), a função tenta buscar os dados anuais e exibe uma mensagem informativa.
   * - Se a requisição for bem-sucedida, atualiza o rótulo do dashboard, define os dados do histograma e chama a função CallNewBar() para atualizar o gráfico.
   * - Em caso de erro, exibe uma mensagem de erro.
   */
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
          try {
            selectPeriod.current.value = "3";
            setMessage(true);
            setTypeError("Falta de Dados");
            setMessageError("Buscando Chamados do Ano");
            barChartData = "";
            periodYear();
          } catch (err) {
            console.log(err);
          }
        }
        if (response.status === 302) {
          return window.location.href("/login");
        }
        return response.json();
      })
      .then((data) => {
        try {
          barChartData = "month";
          setLabelDash("Chamados do Mês");
          setHistogramData(data);
          CallNewBar();
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError(err);
      });
  }

  /**
   * Função periodYear() utilizada para buscar os dados anuais para o dashboard.
   * - Reinicia o rótulo do dashboard e os dados do histograma.
   * - Realiza uma requisição GET para obter os dados do mês.
   * - Se o status da resposta for 210 (falta de dados), a função tenta buscar os dados totais e exibe uma mensagem informativa.
   * - Se a requisição for bem-sucedida, atualiza o rótulo do dashboard, define os dados do histograma e chama a função CallNewBar() para atualizar o gráfico.
   * - Em caso de erro, exibe uma mensagem de erro.
   */
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
          try {
            selectPeriod.current.value = "4";
            setMessage(true);
            setTypeError("Falta de Dados");
            setMessageError("Buscando Todos os Chamados");
            barChartData = "";
            periodAll();
          } catch (err) {
            console.log(err);
          }
        }
        return response.json();
      })
      .then((data) => {
        try {
          barChartData = "year";
          setLabelDash("Chamados deste Ano");
          setHistogramData(data);
          CallNewBar();
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError(err);
      });
  }

  /**
   * Função periodYear() utilizada para buscar os dados totais para o dashboard.
   * - Reinicia o rótulo do dashboard e os dados do histograma.
   * - Realiza uma requisição GET para obter os dados do mês.
   * - Se o status da resposta for 210 (falta de dados), exibe uma mensagem informativa.
   * - Se a requisição for bem-sucedida, atualiza o rótulo do dashboard, define os dados do histograma e chama a função CallNewBar() para atualizar o gráfico.
   * - Em caso de erro, exibe uma mensagem de erro.
   */
  function periodAll() {
    fetch("getDashBoardBar/updateAll/", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.status === 210) {
          try {
            selectPeriod.current.value = "4";
            setMessage(true);
            setTypeError("Falta de Dados");
            setMessageError("Nenhum Chamado Foi Criado");
            setLoadingHistogram(false);
            barChartData = "";
          } catch (err) {
            console.log(err);
          }
        }
        return response.json();
      })
      .then((data) => {
        try {
          barChartData = "all";
          setLabelDash("Todos os Chamados");
          setHistogramData(data);
          CallNewBar();
        } catch (err) {
          console.log(err);
        }
      })
      .catch((err) => {
        setMessage(true);
        setTypeError("Fatal Error");
        setMessageError(err);
      });
  }

  /**
   * Acionado sempre que os dados do dashboard (histogramData) são atualizados.
   * - A função initChart() é chamada para inicializar o gráfico com os novos dados.
   * - Verifica se os dados do histograma estão presentes e válidos antes de criar o gráfico.
   * - Se o gráfico já existir, ele é destruído para evitar duplicatas.
   * - Cria um novo gráfico utilizando os dados atualizados.
   * - Define o novo gráfico como estado.
   * - Exibe a barra do dashboard e desativa o indicador de carregamento.
   * - Em caso de erro, exibe uma mensagem de erro.
   * - O retorno da função de limpeza é responsável por destruir o gráfico ao desmontar o componente.
   * - É executado apenas quando os dados do histograma são modificados.
   */
  useEffect(() => {
    const initChart = () => {
      try {
        if (histogramData && histogramData.days && histogramData.values) {
          if (myChart) {
            myChart.destroy();
          }
          const dashboard = document.getElementById("dashboard");
          const newChart = new Chart(dashboard, {
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

          dashboardBar.current.style.display = "block";
          setLoadingHistogram(false);
        } else {
          dashboardBar.current.style.display = "block";
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

  /**
   * Função CallNewBar() utilizada para reativar a função de busca de dados do dashboard a cada 1 minuto, caso existam dados.
   * - Se houver um timeoutBarUpdate anteriormente definido, ele é limpo para evitar múltiplas execuções.
   * - Determina a função de atualização com base no tipo de dados do dashboard selecionado.
   * - Define um novo timeoutBarUpdate para chamar a função de atualização a cada 1 minuto.
   */
  function CallNewBar() {
    if (timeoutBarUpdateRef.current) {
      clearTimeout(timeoutBarUpdateRef.current);
    }

    let updateFunction;
    const currentBarChartData = barChartData;

    switch (currentBarChartData) {
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

    timeoutBarUpdateRef.current = setTimeout(() => {
      updateFunction();
    }, 60000);
  }

  /**
   * Função changePeriod() acionada pelo evento de seleção do período na interface do usuário.
   * - Obtém o valor selecionado no elemento select de período.
   * - Com base no valor selecionado, chama a função correspondente para buscar os dados do dashboard.
   * - Em caso de valor inválido, exibe uma mensagem de erro.
   */
  function changePeriod() {
    const period = selectPeriod.current.options[selectPeriod.current.selectedIndex].value;

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
          <select className="form-select" ref={selectPeriod} onChange={changePeriod} defaultValue="1">
            <option value="1" selected>
              Está Semana
            </option>
            <option value="2">Este Mês</option>
            <option value="3">Este Ano</option>
            <option value="4">Todo Período</option>
          </select>
          <canvas id="dashboard" ref={dashboardBar}></canvas>
        </Div2>
      </div>
    </Div1>
  );
}
