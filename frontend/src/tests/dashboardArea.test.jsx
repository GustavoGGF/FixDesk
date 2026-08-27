import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "../pages/dashboard";
import { TicketContext } from "../context/TicketContext";
import { MessageContext } from "../context/MessageContext";
import { UserManagementContext } from "../context/UserManagement";
import { AreaContext } from "../context/AreaContext";
import { MemoryRouter } from "react-router-dom";

// Mock global fetch
global.fetch = jest.fn();

// Mock subcomponentes gráficos e de estrutura
jest.mock("../components/dashboard/dashboardPie.jsx", () => () => (
	<div data-testid="dashboard-pie" />
));
jest.mock("../components/dashboard/dashboardBar.jsx", () => () => (
	<div data-testid="dashboard-bar" />
));
jest.mock("../components/general/navbar.jsx", () => () => (
	<div data-testid="navbar" />
));
jest.mock("../components/table/ListTable.jsx", () => ({ ticket }) => (
	<div data-testid="list-table">
		{ticket?.map((t) => (
			<div key={t.id} data-testid="ticket-item">
				{t.title} - {t.area}
			</div>
		))}
	</div>
));

describe("Dashboard Component - Area Selection", () => {
	const setTicketDataMock = jest.fn();

	const defaultTicketContext = {
		ticketData: [],
		setTicketData: setTicketDataMock,
		ticketWindowAtt: false,
		setTicketWindowAtt: jest.fn(),
		changeTech: "",
		setChangeTech: jest.fn(),
		changeStatus: "",
		setChangeStatus: jest.fn(),
		ticketIDOpen: "",
		setTicketIDOpen: jest.fn(),
		sectionTicket: { current: null },
		startSearch: false,
		setStartSearch: jest.fn(),
		themeCard: { current: "" },
		techDetails: false,
		setTechDetails: jest.fn(),
	};

	const defaultMessageContext = {
		typeError: { current: "" },
		messageError: { current: "" },
		setMessage: jest.fn(),
		message: false,
	};

	const defaultUserContext = {
		setConfigUsers: jest.fn(),
		configUsers: false,
		showExcludeUser: false,
		setShowExcludeUser: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		localStorage.setItem(
			"dataInfo",
			JSON.stringify({
				data: {
					name: "Test User",
					mail: "test@example.com",
					groups: ["Helpdesk_Technician_TI", "Helpdesk_Technician_Fiscal"],
				},
			}),
		);
		localStorage.setItem(
			"groups",
			JSON.stringify(["Helpdesk_Technician_TI", "Helpdesk_Technician_Fiscal"]),
		);

		global.fetch.mockImplementation((url) => {
			if (url.includes("/dashboard/get-info/")) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ techs: ["Tech1"], token: "token123" }),
				});
			}
			if (url.includes("/helpdesk/tickets/")) {
				const decodedUrl = decodeURIComponent(url);
				if (decodedUrl.includes("area=Fiscal")) {
					return Promise.resolve({
						ok: true,
						json: () =>
							Promise.resolve({
								tickets: [{ id: 101, title: "Nota Fiscal", area: "Fiscal" }],
							}),
					});
				}
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							tickets: [{ id: 1, title: "Computador quebrado", area: "TI" }],
						}),
				});
			}
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve({}),
			});
		});
	});

	const defaultAreaContext = {
		activeAreas: [
			{ respective_area: 1, respective_area_code: "TI" },
			{ respective_area: 2, respective_area_code: "Fiscal" },
		],
		loadingAreas: false,
		getAreaCodeById: (id) =>
			id === 1 ? "TI" : id === 2 ? "Fiscal" : String(id),
	};

	const renderDashboard = () => {
		return render(
			<MemoryRouter>
				<AreaContext.Provider value={defaultAreaContext}>
					<MessageContext.Provider value={defaultMessageContext}>
						<TicketContext.Provider value={defaultTicketContext}>
							<UserManagementContext.Provider value={defaultUserContext}>
								<Dashboard />
							</UserManagementContext.Provider>
						</TicketContext.Provider>
					</MessageContext.Provider>
				</AreaContext.Provider>
			</MemoryRouter>,
		);
	};

	it("deve carregar chamados de Fiscal ao clicar no botão Fiscal para usuário com ambos os grupos", async () => {
		renderDashboard();

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining("area=TI"),
				expect.any(Object),
			);
		});

		const fiscalButton = screen.getByRole("button", { name: /^Fiscal$/i });
		expect(fiscalButton).toBeInTheDocument();

		fireEvent.click(fiscalButton);

		await waitFor(() => {
			expect(setTicketDataMock).toHaveBeenCalledWith([
				{ id: 101, title: "Nota Fiscal", area: "Fiscal" },
			]);
		});
	});
});
