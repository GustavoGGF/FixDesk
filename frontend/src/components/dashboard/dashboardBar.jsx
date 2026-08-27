import { Chart } from "chart.js/auto";
import { useContext, useEffect, useRef, useState } from "react";
import { MessageContext } from "../../context/MessageContext";
import { Div1, Div2 } from "../../styles/dashboardBar";
import Loading from "../loading/loading";
import Message from "../utility/message";

export default function DashboardBar({ activeArea }) {
	const [histogramData, setHistogramData] = useState([]);
	const [oldHistogramData, setOldHistogramData] = useState([]);
	const [loadingHistogram, setLoadingHistogram] = useState(true);
	const [messageBar, setMessageBar] = useState(false);
	const [myChart, setMyChart] = useState(null);
	const dashboardBar = useRef(null);
	const selectPeriod = useRef(null);
	const timeoutBarUpdateRef = useRef(null);
	const barChatDataRange = useRef("");
	const labeldash = useRef("");
	const countAccess = useRef(0);

	const { typeError, messageError } = useContext(MessageContext);

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
		GetDataBar({ range_days: barChatDataRange.current || "week" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeArea]);

	/**
	 * Função periodweek() utilizada para buscar os dados semanais para o dashboard.
	 */
	function GetDataBar({ range_days }) {
		fetch(`/dashboard/get-dash-board-bar/${activeArea}/${range_days}`, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		})
			.then((response) => {
				if (response.status === 204) {
					let day = "";
					switch (range_days) {
						case "week":
							day = "month";
							break;
						case "month":
							day = "year";
							break;
						case "year":
							day = "all";
							break;
						default:
							day = "month";
							break;
					}
					return RecallGetBarData({ range: day });
				}
				return response.json();
			})
			.then((data) => {
				if (data) {
					try {
						switch (range_days) {
							case "week":
								barChartData = range_days;

								labeldash.current = "Chamados da Semana";
								break;
							case "month":
								barChartData = range_days;
								labeldash.current = "Chamados do Mês";
								break;
							case "year":
								barChartData = "year";
								labeldash.current = "Chamados deste Ano";
								break;
							case "all":
								barChartData = "all";
								labeldash.current = "Todos os Chamados";
								break;
							default:
								break;
						}
						barChatDataRange.current = barChartData;
						setHistogramData(data);
					} catch (err) {
						return console.error(err);
					}
				}
			})
			.catch((err) => {
				setMessageBar(true);
				typeError.current = "Fatal Error";
				messageError.current = err;
			});
	}

	// Função para fazer um Recall dos dados quando um falha
	function RecallGetBarData({ range }) {
		try {
			switch (range) {
				case "week":
					setHistogramData([]);
					selectPeriod.current.value = "2";
					setMessageBar(true);
					typeError.current = "Falta de Dados";
					messageError.current = "Buscando Chamados do Mês";
					barChartData = "";
					barChatDataRange.current = "";
					GetDataBar({ range_days: "month" });
					break;
				case "month":
					selectPeriod.current.value = "3";
					setMessageBar(true);
					typeError.current = "Falta de Dados";
					messageError.current = "Buscando Chamados do Ano";
					barChartData = "";
					barChatDataRange.current = "";
					GetDataBar({ range_days: "year" });
					break;
				case "year":
					selectPeriod.current.value = "4";
					setMessageBar(true);
					typeError.current = "Falta de Dados";
					messageError.current = "Buscando todos os Chamados";
					barChartData = "";
					barChatDataRange.current = "";
					GetDataBar({ range_days: "all" });
					break;
				default:
					setHistogramData([]);
					selectPeriod.current.value = "4";
					setMessageBar(true);
					typeError.current = "Falta de Dados";
					messageError.current = "Buscando todos os Chamados";
					barChartData = "";
					barChatDataRange.current = "";
					GetDataBar({ range_days: "all" });
					break;
			}
		} catch (err) {
			return console.error(err);
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
				if (histogramData?.days && histogramData?.values) {
					try {
						if (
							countAccess.current > 0 &&
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
										label: [labeldash.current],
										data: histogramData.values,
									},
								],
							},
						});

						setMyChart(newChart);
						setOldHistogramData(histogramData);
						countAccess.current++;
						dashboardBar.current.style.display = "block";
						setLoadingHistogram(false);
						return CallNewBar();
					} catch (err) {
						return console.error(err);
					}
				} else {
					dashboardBar.current.style.display = "block";
					setLoadingHistogram(false);
					return;
				}
			} catch (err) {
				setMessageBar(true);
				typeError.current = "Fatal Error";
				messageError.current = err;
				console.error(err);
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
				GetDataBar({ range_days: barChatDataRange.current });

				timeoutBarUpdateRef.current = null;
			}, 60000);
		} catch (err) {
			return console.error(err);
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
					GetDataBar({ range_days: "week" });
					break;
				case "2":
					GetDataBar({ range_days: "month" });
					break;
				case "3":
					GetDataBar({ range_days: "year" });
					break;
				case "4":
					GetDataBar({ range_days: "all" });
					break;
				default:
					setMessageBar(true);
					typeError.current = "Fatal Error";
					messageError.current = `Periodo inválido: ${period}`;
					break;
			}
		} catch (err) {
			return console.error(err);
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
