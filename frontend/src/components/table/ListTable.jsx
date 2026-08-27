import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useContext, useEffect, useRef, useState } from "react";
import { TicketContext } from "../../context/TicketContext";
import Loading from "../loading/loading.jsx";
import "../../styles/ticketStates.css";

/**
 * Renderiza uma tabela interativa para listagem e gerenciamento de chamados.
 *
 * @description
 * Mapeia e renderiza as linhas da tabela aplicando classes CSS dinâmicas baseadas
 * no estado do chamado (fechado, urgente sem técnico há mais de 7 dias, aberto sem atendimento,
 * ou parado). Permite a seleção de um chamado para visualização detalhada.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {Array<Object>} props.ticket - Lista de chamados a serem exibidos na tabela.
 * @returns {JSX.Element} Container da tabela ou indicador de carregamento.
 */
export default function ListTable({ ticket }) {
	const { setTicketIDOpen, ticketList, setTicketList } =
		useContext(TicketContext);

	const [loading, setLoading] = useState(true);

	const colorBorder = useRef("");

	useEffect(() => {
		function GenTable() {
			ticket.forEach((tk) => {
				if (tk.open === false) {
					colorBorder.current = "ticket-close";
				} else if (tk.open === true && tk.responsible_technician === null) {
					const date = new Date(tk.start_date);
					const currentDate = new Date();
					const diferenceMilisecond = currentDate - date;
					const diferenceDays = diferenceMilisecond / (1000 * 60 * 60 * 24);

					if (diferenceDays >= 7) {
						colorBorder.current = "ticket-urgent";
					} else {
						colorBorder.current = "ticket-open-not-view";
					}
				} else if (tk.open === true && tk.responsible_technician !== null) {
					colorBorder.current = "ticket-open-in-view";
				} else if (tk.open === null) {
					colorBorder.current = "ticket-stop";
				}

				const Div = (
					<TableRow
						className={`hover:!tw-opacity-75 tw-cursor-pointer tw-transition-opacity tw-duration-200 ${colorBorder.current}`}
						key={tk.id}
						onClick={() => {
							setTicketIDOpen(tk.id);
						}}
					>
						<TableCell className="user-select-none text-center">
							{tk.id}
						</TableCell>
						<TableCell className="user-select-none text-center" align="right">
							{tk.ticketRequester}
						</TableCell>
						<TableCell className="user-select-none text-center" align="right">
							{tk.occurrence}
						</TableCell>
						<TableCell className="user-select-none text-center" align="right">
							{tk.problemn}
						</TableCell>
						<TableCell className="user-select-none text-center" align="right">
							{tk.start_date ? genDate(tk.start_date) : "—"}
						</TableCell>
					</TableRow>
				);

				setTicketList((list) => [...list, Div]);
			});
		}

		if (ticket) {
			setTicketList([]);
			GenTable();
		}
		setLoading(false);
	}, [ticket, setTicketList, setTicketIDOpen]);

	if (loading) {
		return <Loading />;
	}

	return (
		<TableContainer className="w-60p" component={Paper}>
			<Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
				<TableHead>
					<TableRow>
						<TableCell className="text-center">Chamado</TableCell>
						<TableCell className="text-center" align="right">
							Usuario
						</TableCell>
						<TableCell className="text-center" align="right">
							Ocorrencia
						</TableCell>
						<TableCell className="text-center" align="right">
							problema
						</TableCell>
						<TableCell className="text-center" align="right">
							Data de Abertura
						</TableCell>
					</TableRow>
				</TableHead>
				{!loading && <TableBody>{ticketList}</TableBody>}
			</Table>
		</TableContainer>
	);
}

/**
 * Formata uma data para o padrão de exibição brasileiro.
 *
 * @description
 * Converte um valor de data (string ou Date) para uma representação legível
 * no formato dd/mm/aaaa hh:mm em conformidade com as convenções locais.
 *
 * @param {string|Date} date - A data de origem a ser formatada.
 * @returns {string} String contendo a data formatada no padrão 'pt-BR'.
 */
function genDate(date) {
	return new Date(date).toLocaleString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
