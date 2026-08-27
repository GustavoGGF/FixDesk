import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import History from "../pages/history";
import { TicketContext } from "../context/TicketContext";
import { MessageContext } from "../context/MessageContext";
import { AreaContext } from "../context/AreaContext";
import { MemoryRouter } from "react-router-dom";
import api from "../services/api";

jest.mock("../services/api");

jest.mock("../components/general/navbar", () => () => (
	<div data-testid="navbar" />
));
jest.mock("../components/table/ListTable", () => ({ ticket }) => (
	<div data-testid="list-table">
		{ticket?.map((t) => (
			<div key={t.id} data-testid="ticket-item">
				{t.title}
			</div>
		))}
	</div>
));
jest.mock("../components/ticket/filter", () => () => (
	<div data-testid="filter-tickets" />
));
jest.mock("../components/ticket/openTicketWindow", () => (props) => (
	<div data-testid="open-ticket-window">
		<span data-testid="ticket-area">{props.ticketAREA}</span>
		<button type="button" onClick={props.CloseTicket}>
			Fechar Ticket
		</button>
	</div>
));

describe("History Component", () => {
	const setTicketDataMock = jest.fn();
	const setTicketWindowAttMock = jest.fn();
	const setTicketIDOpenMock = jest.fn();
	const setTicketListMock = jest.fn();

	const defaultTicketContext = {
		ticketData: [],
		setTicketData: setTicketDataMock,
		ticketWindowAtt: false,
		setTicketWindowAtt: setTicketWindowAttMock,
		changeStatus: "",
		setChangeStatus: jest.fn(),
		ticketIDOpen: "",
		setTicketIDOpen: setTicketIDOpenMock,
		setTicketList: setTicketListMock,
		sectionTicket: { current: { style: { filter: "" } } },
		themeCard: { current: "" },
		startSearch: false,
		setStartSearch: jest.fn(),
	};

	const defaultMessageContext = {
		typeError: { current: "" },
		messageError: { current: "" },
		setMessage: jest.fn(),
		message: false,
	};

	const getAreaCodeByIdMock = jest.fn((id) =>
		String(id) === "1" ? "TI" : String(id) === "2" ? "Fiscal" : String(id),
	);

	const defaultAreaContext = {
		activeAreas: [
			{ respective_area: 1, respective_area_code: "TI" },
			{ respective_area: 2, respective_area_code: "Fiscal" },
		],
		loadingAreas: false,
		getAreaCodeById: getAreaCodeByIdMock,
	};

	beforeEach(() => {
		jest.clearAllMocks();
		localStorage.setItem(
			"dataInfo",
			JSON.stringify({
				data: {
					name: "Usuario Teste",
					mail: "user@test.com",
					groups: ["Helpdesk_Technician_TI"],
				},
			}),
		);
		localStorage.setItem("quantity", "10");
		localStorage.setItem("status", "open");
		localStorage.setItem("order", "-id");
	});

	const renderHistory = (ticketContextOverlays = {}) => {
		return render(
			<MemoryRouter>
				<AreaContext.Provider value={defaultAreaContext}>
					<MessageContext.Provider value={defaultMessageContext}>
						<TicketContext.Provider
							value={{ ...defaultTicketContext, ...ticketContextOverlays }}
						>
							<History />
						</TicketContext.Provider>
					</MessageContext.Provider>
				</AreaContext.Provider>
			</MemoryRouter>,
		);
	};

	it("deve carregar a lista de chamados ao montar o componente", async () => {
		api.get.mockImplementation((url) => {
			if (url.includes("/helpdesk/get-ticket/")) {
				return Promise.resolve({
					data: {
						tickets: [{ id: 10, title: "Chamado Teste 1" }],
						token: "token123",
					},
				});
			}
			return Promise.resolve({ data: {} });
		});

		renderHistory();

		await waitFor(() => {
			expect(setTicketDataMock).toHaveBeenCalledWith([
				{ id: 10, title: "Chamado Teste 1" },
			]);
		});
	});

	it("deve chamar getAreaCodeById ao processar dados do ticket", async () => {
		api.get.mockImplementation((url) => {
			if (url.includes("/helpdesk/ticket/42")) {
				return Promise.resolve({
					data: {
						data: {
							id: 42,
							ticketRequester: "Usuario Teste",
							department: "TI",
							mail: "user@test.com",
							company: "Empresa X",
							sector: "Infraestrutura",
							respective_area: 2,
							occurrence: "Nota Fiscal",
							problemn: "Impostos",
							start_date: "2026-08-10T10:00:00Z",
							responsible_technician: null,
							open: true,
							file: null,
							chat: null,
						},
					},
				});
			}
			return Promise.resolve({
				data: {
					tickets: [],
					token: "token123",
				},
			});
		});

		renderHistory({ ticketIDOpen: "42" });

		await waitFor(() => {
			expect(getAreaCodeByIdMock).toHaveBeenCalledWith(2);
		});
	});
});
