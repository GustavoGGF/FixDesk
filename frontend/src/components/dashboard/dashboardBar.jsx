/**
 * Importações internas do React necessárias para o funcionamento deste componente.
 * - React: permite a criação e manipulação de componentes React.
 * - useState: hook que possibilita a adição de estado a componentes funcionais.
 * - useEffect: hook utilizado para executar efeitos colaterais em componentes funcionais, como ações após renderizações.
 * - useRef: hook que fornece uma maneira de armazenar referências a elementos DOM ou valores mutáveis que persistem entre as renderizações.
 * Importação da classe Chart do módulo "chart.js/auto" para a renderização de gráficos.
 */
import React, { useState, useEffect, useRef, useContext } from "react";
import { Chart } from "chart.js/auto";

/**
 * Importações de componentes e estilos já criados neste projeto.
 * - Loading: componente responsável pela exibição de um indicador de carregamento.
 * - Message: componente utilizado para exibir mensagens ao usuário.
 * - Div1 e Div2: estilos importados do módulo "../styles/dashboardBar", utilizados para estilizar elementos do componente DashboardBar.
 */
import Loading from "../loading/loading";
import Message from "../utility/message";
import { Div1, Div2 } from "../../styles/dashboardBar";
import { MessageContext } from "../../context/MessageContext";

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
  const [histogramData, setHistogramData] = useState([]);
  const [oldHistogramData, setOldHistogramData] = useState([]);

  const [labeldash, setLabelDash] = useState("");
  const [barChatDataRange, setBarChatDataRange] = useState("");

  const [loadingHistogram, setLoadingHistogram] = useState(true);
  const [messageBar, setMessageBar] = useState(false);

  const [countAccess, setCountAccess] = useState(0);

  const [myChart, setMyChart] = useState(null);

  /**
   * Constantes useRef utilizadas para referenciar elementos do DOM neste componente.
   * - selectPeriod: referência ao elemento select utilizado para selecionar o período.
   * - dashboardBar: referência ao elemento DOM que representa a barra do dashboard.
   * - timeoutBarUpdateRef: referência ao elemento timeout para buscar informações em determinado periodo.
   */
  const dashboardBar = useRef(null);
  const selectPeriod = useRef(null);
  const timeoutBarUpdateRef = useRef(null);

  const { setTypeError, setMessageError } = useContext(MessageContext);

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
    GetDataBar({ range_days: "week" });
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
  function GetDataBar({ range_days }) {
    fetch("get-dash-board-bar/" + range_days, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    })
      .then((response) => {
        if (response.status === 204) {
          return RecallGetBarData({ range: range_days });
        }
        return response.json();
      })
      .then((data) => {
        try {
          setHistogramData([]);
          switch (range_days) {
            default:
              break;
            case "week":
              barChartData = range_days;

              setLabelDash("Chamados da Semana");
              break;
            case "month":
              barChartData = range_days;
              setLabelDash("Chamados do Mês");
              break;
            case "year":
              barChartData = "year";
              setLabelDash("Chamados deste Ano");
              break;
            case "all":
              barChartData = "all";
              setLabelDash("Todos os Chamados");
              break;
          }
          setBarChatDataRange(barChartData);
          setHistogramData(data);
        } catch (err) {
          return console.log(err);
        }
      })
      .catch((err) => {
        setMessageBar(true);
        setTypeError("Fatal Error");
        setMessageError(err);
      });
  }

  function RecallGetBarData({ range }) {
    try {
      switch (range) {
        default:
          break;
        case "week":
          selectPeriod.current.value = "2";
          setMessageBar(true);
          setTypeError("Falta de Dados");
          setMessageError("Buscando Chamados do Mês");
          barChartData = "";
          setBarChatDataRange("");
          GetDataBar({ range_days: "month" });
          break;
        case "month":
          selectPeriod.current.value = "3";
          setMessageBar(true);
          setTypeError("Falta de Dados");
          setMessageError("Buscando Chamados do Ano");
          barChartData = "";
          setBarChatDataRange("");
          GetDataBar({ range_days: "year" });
          break;
      }
    } catch (err) {
      return console.log(err);
    }
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
    var recall = false;
    const initChart = () => {
      try {
        if (histogramData && histogramData.days && histogramData.values) {
          try {
            if (
              countAccess > 0 &&
              JSON.stringify(histogramData) === JSON.stringify(oldHistogramData)
            ) {
              CallNewBar();
              recall = true;
              return;
            }

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
            setOldHistogramData(histogramData);
            var count = countAccess + 1;
            setCountAccess(count);
            dashboardBar.current.style.display = "block";
            setLoadingHistogram(false);
            return CallNewBar();
          } catch (err) {
            return console.log(err);
          }
        } else {
          dashboardBar.current.style.display = "block";
          setLoadingHistogram(false);
          return;
        }
      } catch (err) {
        setMessageBar(true);
        setTypeError("Fatal Error");
        setMessageError(err);
        console.log(err);
        return;
      }
    };

    initChart();

    return () => {
      if (!recall) {
        if (myChart) {
          myChart.destroy();
        }
      }
      return;
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
    try {
      if (timeoutBarUpdateRef.current) {
        clearTimeout(timeoutBarUpdateRef.current);
      }

      timeoutBarUpdateRef.current = setTimeout(() => {
        GetDataBar({ range_days: barChatDataRange });

        timeoutBarUpdateRef.current = null;
      }, 60000);
    } catch (err) {
      return console.log(err);
    }
  }

  /**
   * Função changePeriod() acionada pelo evento de seleção do período na interface do usuário.
   * - Obtém o valor selecionado no elemento select de período.
   * - Com base no valor selecionado, chama a função correspondente para buscar os dados do dashboard.
   * - Em caso de valor inválido, exibe uma mensagem de erro.
   */
  function ChangePeriod() {
    try {
      const period =
        selectPeriod.current.options[selectPeriod.current.selectedIndex].value;

      switch (period) {
        case "1":
          // setCountAccess(count);
          // setHistogramData([]);
          // setOldHistogramData([]);
          GetDataBar({ range_days: "week" });
          break;
        case "2":
          // setCountAccess(count);
          GetDataBar({ range_days: "month" });
          break;
        case "3":
          // setCountAccess(count);
          GetDataBar({ range_days: "year" });
          break;
        case "4":
          // setCountAccess(count);
          GetDataBar({ range_days: "all" });
          break;
        default:
          console.log("periodo inválido: ", period);
          setMessageBar(true);
          setTypeError("Fatal Error");
          setMessageError("Periodo inválido:", period);
          break;
      }
    } catch (err) {
      return console.log(err);
    }
  }

  return (
    <Div1 className="mt-5 mb-5 position-relative">
      {messageBar && (
        <div className="position-absolute top-50 start-50 translate-middle z-1">
          <Message
            CloseMessage={() => {
              setMessageBar(false);
            }}
          />
        </div>
      )}
      <div>
        <div className="h-100 w-100 d-flex justify-content-center">
          {loadingHistogram && <Loading />}
        </div>
        <Div2 className="d-flex flex-column">
          <select
            className="form-select"
            ref={selectPeriod}
            onChange={ChangePeriod}
            defaultValue="1"
          >
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
