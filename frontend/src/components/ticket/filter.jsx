import { useEffect, useRef, useState, useContext } from "react";
import { TicketContext } from "../../context/TicketContext";
import { MessageContext } from "../../context/MessageContext";
import { Search, ChevronDown, Check } from "lucide-react";
import { logErrorFrontend } from "../../services/errorLogger";
import {
	getOccurrencesForArea,
	getProblemsForOccurrence,
} from "../../constants/ticketCatalog";
import api from "../../services/api";

/**
 * Retorna a chave de localStorage prefixada pela area ativa,
 * evitando que filtros de TI contaminem a area Fiscal e vice-versa.
 * @param {string} key
 * @param {string} area
 * @returns {string}
 */
function storageKey(key, area) {
	return `${key}_${area}`;
}

/**
 * Determina a area tecnica primaria do usuario com base nas permissoes ou prop.
 * @param {string} [activeAreaProp]
 * @returns {string}
 */
function getUserPrimaryArea(activeAreaProp) {
	if (activeAreaProp) return activeAreaProp;
	try {
		const storedGroups =
			localStorage.getItem("groups") || sessionStorage.getItem("groups");
		let groups = [];
		if (storedGroups) {
			groups = JSON.parse(storedGroups);
		} else {
			const storedDataUser = localStorage.getItem("dataInfo");
			if (storedDataUser) {
				groups = JSON.parse(storedDataUser)?.data?.groups || [];
			}
		}
		const hasTI = groups.some(
			(g) => g === "Helpdesk_Technician_TI" || g === "Helpdesk_Leader_TI",
		);
		const hasFiscal = groups.some((g) => g === "Helpdesk_Technician_Fiscal");
		if (hasFiscal && !hasTI) {
			return "Fiscal";
		}
	} catch (_) {}
	return "TI";
}

/**
 * Componente de filtro avancado de chamados.
 *
 * Recebe activeArea como prop (obrigatorio para tecnicos) para exibir
 * somente as ocorrencias e problemas pertencentes aquela area.
 * Usa o endpoint seguro v2 (/helpdesk/tickets/) com query params nomeados.
 *
 * @param {{ url: string, userName: string, moreTickets: number, activeArea: string }} props
 */
export default function FilterTickets({
	url,
	_userName,
	moreTickets,
	activeArea,
}) {
	const safeArea = getUserPrimaryArea(activeArea);

	const occurrences = getOccurrencesForArea(safeArea);

	const [problemOptions, setProblemOptions] = useState([]);

	const [activeQty, setActiveQty] = useState(
		() => localStorage.getItem(storageKey("quantity", safeArea)) || "10",
	);
	const [activeStatus, setActiveStatus] = useState(
		() => localStorage.getItem(storageKey("status", safeArea)) || "open",
	);

	const selectOccurrenceRef = useRef(null);
	const selectProblemRef = useRef(null);
	const dateSelect = useRef(null);

	const {
		setLoadingDash,
		setTicketData,
		totalTickets,
		reloadFilter,
		setReloadFilter,
		setFilterHistory,
		setTicketList,
	} = useContext(TicketContext);

	const { setMessage, messageError, typeError } = useContext(MessageContext);

	// Limpa selecoes dependentes de area quando a area ativa muda.
	useEffect(() => {
		setProblemOptions([]);
		if (selectOccurrenceRef.current) selectOccurrenceRef.current.value = "";
		if (selectProblemRef.current) selectProblemRef.current.value = "";

		const storedQty = localStorage.getItem(storageKey("quantity", safeArea));
		setActiveQty(storedQty || "10");

		const storedStatus = localStorage.getItem(storageKey("status", safeArea));
		setActiveStatus(storedStatus || "open");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [safeArea]);

	useEffect(() => {
		if (reloadFilter) {
			setReloadFilter(false);
			return GetTicketFilter({
				quantity: null,
				statusTicket: null,
				search: "",
			});
		}
		if (totalTickets) {
			return GetTicketFilter({
				quantity: null,
				statusTicket: null,
				search: "",
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [totalTickets, reloadFilter]);

	useEffect(() => {
		setTicketData([]);
		if (moreTickets > 0) {
			GetTicketFilter({
				quantity: moreTickets,
				statusTicket: null,
				search: "",
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [moreTickets]);

	useEffect(() => {
		const saved = localStorage.getItem(storageKey("order", safeArea));
		if (dateSelect.current) {
			dateSelect.current.value = saved ?? "-id";
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [safeArea]);

	function handleOccurrenceChange(occurrence) {
		setProblemOptions(getProblemsForOccurrence(safeArea, occurrence));
		if (selectProblemRef.current) selectProblemRef.current.value = "";
		GetTicketFilter({ quantity: null, statusTicket: null, search: "" });
		setTicketList([]);
	}

	function GetTicketFilter({ quantity, statusTicket, search }) {
		try {
			setLoadingDash(true);
			setTicketList([]);
			setTicketData([]);

			const orderTicket = dateSelect.current?.value || "-id";

			const resolvedStatus =
				statusTicket ??
				localStorage.getItem(storageKey("status", safeArea)) ??
				"open";

			const rawLimit =
				quantity && quantity !== "null" && quantity !== 0
					? String(quantity)
					: localStorage.getItem(storageKey("quantity", safeArea)) || "10";

			// "all" nao e aceito pela API v2 — usa o limite maximo permitido.
			const safeLimit = rawLimit === "all" ? "200" : rawLimit;

			const occurrence = selectOccurrenceRef.current?.value || "";
			const problem = selectProblemRef.current?.value || "";
			const safeSearch = search && search !== "null" ? search : "";

			const context = url === "dashboards" ? "dashboard" : "history";

			const params = new URLSearchParams({
				context,
				area: safeArea,
				status: resolvedStatus,
				order: orderTicket,
				limit: safeLimit,
			});

			if (occurrence && occurrence !== "all" && occurrence !== "null") {
				params.set("occurrence", occurrence);
			}
			if (problem && problem !== "all" && problem !== "null") {
				params.set("problem", problem);
			}
			if (safeSearch) {
				params.set("search", safeSearch);
			}

			api
				.get(`/helpdesk/tickets/?${params.toString()}`)
				.then((response) => {
					const data = response.data;
					if (!data.tickets || data.tickets.length === 0) {
						setMessage(true);
						typeError.current = "Falta de dados";
						messageError.current = "Nenhum ticket com esses Filtros";
						setLoadingDash(false);
						return;
					}
					setLoadingDash(false);
					localStorage.setItem(storageKey("quantity", safeArea), safeLimit);
					setActiveQty(safeLimit);
					localStorage.setItem(storageKey("status", safeArea), resolvedStatus);
					setActiveStatus(resolvedStatus);
					localStorage.setItem(storageKey("order", safeArea), orderTicket);
					setFilterHistory(true);
					setTicketData(data.tickets);
				})
				.catch((err) => {
					setLoadingDash(false);
					logErrorFrontend(
						err.message || "Erro na requisicao de filtro de tickets",
						err.stack || String(err),
					);
				});
		} catch (err) {
			logErrorFrontend(
				err.message || "Erro inesperado no filtro de tickets",
				err.stack || String(err),
			);
		}
	}

	return (
		<div className="tw-bg-white tw-rounded-xl tw-border tw-border-slate-100 tw-p-4 tw-shadow-xs tw-flex tw-flex-wrap tw-items-end tw-gap-6 tw-w-full">
			{/* Search Input */}
			<div className="tw-flex-1 tw-min-w-[240px]">
				<label
					className="tw-block tw-text-xs tw-font-semibold tw-text-slate-800 tw-mb-1.5 tw-uppercase tw-tracking-wider"
					id="search-label"
					htmlFor="search-input"
				>
					Buscar (Search)
				</label>
				<div className="tw-relative">
					<Search className="tw-absolute tw-left-3 tw-top-1/2 tw--translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400" />
					<input
						id="search-input"
						type="text"
						className="tw-w-full tw-pl-9 tw-pr-4 tw-py-2 tw-bg-slate-50/50 tw-border tw-border-slate-200 focus:tw-border-blue-600 focus:tw-bg-white focus:tw-ring-1 focus:tw-ring-blue-600 tw-rounded-lg tw-text-sm tw-text-slate-800 placeholder-slate-400 tw-outline-none tw-transition-all tw-duration-200"
						placeholder="Buscar por ID, Problema ou Data..."
						onKeyUp={(event) => {
							GetTicketFilter({
								quantity: null,
								statusTicket: null,
								search: event.target.value,
							});
							setTicketList([]);
						}}
					/>
				</div>
			</div>

			{/* Order Select */}
			<div className="tw-w-full sm:tw-w-[180px]">
				<label
					className="tw-block tw-text-xs tw-font-semibold tw-text-slate-800 tw-mb-1.5 tw-uppercase tw-tracking-wider"
					id="order-select-label"
					htmlFor="select-order"
				>
					Ordenar
				</label>
				<div className="tw-relative">
					<select
						id="select-order"
						className="tw-w-full tw-pl-3 tw-pr-8 tw-py-2 tw-bg-slate-50/50 tw-border tw-border-slate-200 focus:tw-border-blue-600 focus:tw-bg-white focus:tw-ring-1 focus:tw-ring-blue-600 tw-rounded-lg tw-text-sm tw-text-slate-700 tw-outline-none tw-appearance-none tw-cursor-pointer tw-transition-all tw-duration-200"
						ref={dateSelect}
						onChange={() => {
							GetTicketFilter({
								quantity: null,
								statusTicket: null,
								search: "",
							});
							setTicketList([]);
						}}
					>
						<option value="none" disabled>
							Ordenar
						</option>
						<option value="-id">Data Recente</option>
						<option value="id">Data Antiga</option>
					</select>
					<ChevronDown className="tw-absolute tw-right-2.5 tw-top-1/2 tw--translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400 tw-pointer-events-none" />
				</div>
			</div>

			{/* Occurrence Type Select — populado pelo catalogo da area ativa */}
			<div className="tw-w-full sm:tw-w-[180px]">
				<label
					className="tw-block tw-text-xs tw-font-semibold tw-text-slate-800 tw-mb-1.5 tw-uppercase tw-tracking-wider"
					id="occ-type-label"
					htmlFor="occurrence-type-select"
				>
					Tipo Ocorrencia
				</label>
				<div className="tw-relative">
					<select
						id="occurrence-type-select"
						className="tw-w-full tw-pl-3 tw-pr-8 tw-py-2 tw-bg-slate-50/50 tw-border tw-border-slate-200 focus:tw-border-blue-600 focus:tw-bg-white focus:tw-ring-1 focus:tw-ring-blue-600 tw-rounded-lg tw-text-sm tw-text-slate-700 tw-outline-none tw-appearance-none tw-cursor-pointer tw-transition-all tw-duration-200"
						ref={selectOccurrenceRef}
						onChange={(e) => handleOccurrenceChange(e.target.value)}
					>
						<option value="">Todos</option>
						{occurrences.map((occ) => (
							<option key={occ} value={occ}>
								{occ}
							</option>
						))}
					</select>
					<ChevronDown className="tw-absolute tw-right-2.5 tw-top-1/2 tw--translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400 tw-pointer-events-none" />
				</div>
			</div>

			{/* Problem Type Select — populado dinamicamente pela ocorrencia selecionada */}
			<div className="tw-w-full sm:tw-w-[180px]">
				<label
					className="tw-block tw-text-xs tw-font-semibold tw-text-slate-800 tw-mb-1.5 tw-uppercase tw-tracking-wider"
					id="prob-type-label"
					htmlFor="problem-type-select"
				>
					Tipo Problema
				</label>
				<div className="tw-relative">
					<select
						id="problem-type-select"
						className="tw-w-full tw-pl-3 tw-pr-8 tw-py-2 tw-bg-slate-50/50 tw-border tw-border-slate-200 focus:tw-border-blue-600 focus:tw-bg-white focus:tw-ring-1 focus:tw-ring-blue-600 tw-rounded-lg tw-text-sm tw-text-slate-700 tw-outline-none tw-appearance-none tw-cursor-pointer tw-transition-all tw-duration-200 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
						ref={selectProblemRef}
						disabled={problemOptions.length === 0}
						onChange={() => {
							GetTicketFilter({
								quantity: null,
								statusTicket: null,
								search: "",
							});
							setTicketList([]);
						}}
					>
						<option value="">
							{problemOptions.length === 0
								? "Selecione uma ocorrencia"
								: "Todos"}
						</option>
						{problemOptions.map((prob) => (
							<option key={prob} value={prob}>
								{prob}
							</option>
						))}
					</select>
					<ChevronDown className="tw-absolute tw-right-2.5 tw-top-1/2 tw--translate-y-1/2 tw-w-4 tw-h-4 tw-text-slate-400 tw-pointer-events-none" />
				</div>
			</div>

			{/* Quantity / Limit */}
			<div className="tw-flex tw-flex-col tw-items-start tw-min-w-[130px]">
				<label
					className="tw-block tw-text-xs tw-font-semibold tw-text-slate-800 tw-mb-1.5 tw-uppercase tw-tracking-wider"
					id="quantity-label"
					htmlFor="qty-btn-5"
				>
					Quantidade
				</label>
				<div className="tw-flex tw-items-center tw-gap-2 tw-py-1.5 tw-px-2 tw-bg-slate-50 tw-border tw-border-slate-200 tw-rounded-lg">
					{[5, 10, 50, 200].map((qty) => {
						const isActive = String(activeQty) === String(qty);
						return (
							<button
								key={qty}
								id={`qty-btn-${qty}`}
								type="button"
								className={`tw-w-8 tw-h-8 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-justify-center tw-transition-all tw-duration-150 tw-cursor-pointer ${
									isActive
										? "tw-bg-blue-600 tw-text-white tw-shadow-xs tw-font-bold"
										: "tw-text-slate-600 hover:tw-bg-slate-100 hover:tw-text-slate-900"
								}`}
								onClick={() => {
									GetTicketFilter({
										quantity: String(qty),
										statusTicket: null,
										search: "",
									});
									setTicketList([]);
								}}
							>
								{qty === 200 ? "Max" : qty}
							</button>
						);
					})}
				</div>
			</div>

			{/* Status Filter Buttons */}
			<div className="tw-flex tw-flex-col tw-items-start tw-min-w-[260px]">
				<span
					className="tw-block tw-text-xs tw-font-semibold tw-text-slate-800 tw-mb-1.5 tw-uppercase tw-tracking-wider"
					id="status-filter-label"
				>
					Status
				</span>
				<div className="tw-flex tw-items-center tw-gap-2">
					<button
						id="status-btn-open"
						type="button"
						onClick={() => {
							GetTicketFilter({
								quantity: null,
								statusTicket: "open",
								search: "",
							});
							setTicketList([]);
						}}
						className={`tw-px-3 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-gap-1 tw-transition-all tw-border tw-cursor-pointer ${
							activeStatus === "open"
								? "tw-bg-emerald-50 tw-text-emerald-700 tw-border-emerald-200 tw-font-semibold"
								: "tw-bg-white tw-text-slate-500 tw-border-slate-200 hover:tw-bg-slate-50"
						}`}
					>
						Aberto
						{activeStatus === "open" && (
							<Check className="tw-w-3.5 tw-h-3.5 tw-stroke-[3]" />
						)}
					</button>

					<button
						id="status-btn-closed"
						type="button"
						onClick={() => {
							GetTicketFilter({
								quantity: null,
								statusTicket: "close",
								search: "",
							});
							setTicketList([]);
						}}
						className={`tw-px-3 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-gap-1 tw-transition-all tw-border tw-cursor-pointer ${
							activeStatus === "close"
								? "tw-bg-slate-100 tw-text-slate-700 tw-border-slate-300 tw-font-semibold"
								: "tw-bg-white tw-text-slate-500 tw-border-slate-200 hover:tw-bg-slate-50"
						}`}
					>
						Fechado
						{activeStatus === "close" && (
							<Check className="tw-w-3.5 tw-h-3.5 tw-stroke-[3]" />
						)}
					</button>

					<button
						id="status-btn-pending"
						type="button"
						onClick={() => {
							GetTicketFilter({
								quantity: null,
								statusTicket: "stop",
								search: "",
							});
							setTicketList([]);
						}}
						className={`tw-px-3 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-medium tw-flex tw-items-center tw-gap-1 tw-transition-all tw-border tw-cursor-pointer ${
							activeStatus === "stop"
								? "tw-bg-amber-50 tw-text-amber-700 tw-border-amber-200 tw-font-semibold"
								: "tw-bg-white tw-text-slate-500 tw-border-slate-200 hover:tw-bg-slate-50"
						}`}
					>
						Pendente
						{activeStatus === "stop" && (
							<Check className="tw-w-3.5 tw-h-3.5 tw-stroke-[3]" />
						)}
					</button>

					<button
						id="status-btn-all"
						type="button"
						onClick={() => {
							GetTicketFilter({
								quantity: null,
								statusTicket: "all",
								search: "",
							});
							setTicketList([]);
						}}
						className={`tw-px-3 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-medium tw-transition-all tw-border tw-cursor-pointer ${
							activeStatus === "all"
								? "tw-bg-blue-50 tw-text-blue-700 tw-border-blue-200 tw-font-semibold"
								: "tw-bg-white tw-text-slate-500 tw-border-slate-200 hover:tw-bg-slate-50"
						}`}
					>
						Todos
						{activeStatus === "all" && (
							<Check className="tw-w-3.5 tw-h-3.5 tw-stroke-[3]" />
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
