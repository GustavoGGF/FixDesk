import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "../pages/dashboard";
import { TicketContext } from "../context/TicketContext";
import { MessageContext } from "../context/MessageContext";
import { UserManagementContext } from "../context/UserManagement";
import { MemoryRouter } from "react-router-dom";

// Mock global fetch
global.fetch = jest.fn();

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
				{t.title}
			</div>
		))}
	</div>
));
jest.mock("../components/ticket/openTicketWindow.jsx", () => () => (
	<div data-testid="ticket-window" />
));

describe("Dashboard Component - Tech Details Parsing", () => {
	const defaultTicketContext = {
		ticketData: [],
		setTicketData: jest.fn(),
		ticketWindowAtt: false,
		setTicketWindowAtt: jest.fn(),
		changeTech: "",
		setChangeTech: jest.fn(),
		changeStatus: "",
		setChangeStatus: jest.fn(),
		ticketIDOpen: "1", // Open ticket 1
		setTicketIDOpen: jest.fn(),
		sectionTicket: { current: null },
		startSearch: false,
		setStartSearch: jest.fn(),
		themeCard: { current: "" },
		techDetails: true, // Details open
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
				data: { name: "Test User", groups: ["Helpdesk_Technician_TI"] },
			}),
		);
		localStorage.setItem("groups", JSON.stringify(["Helpdesk_Technician_TI"]));

		global.fetch.mockImplementation((url) => {
			if (url.includes("/dashboard/get-info/")) {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							// Backend returns techs as an object now!
							techs: { TI: ["Tech TI 1"], Fiscal: ["Tech Fiscal 1"] },
							token: "token123",
						}),
				});
			}
			if (url.includes("/helpdesk/tickets/")) {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							tickets: [
								{
									id: 1,
									title: "Ticket 1",
									area: "TI",
									responsible_technician: "Tech TI 1",
								},
							],
						}),
				});
			}
			if (url.includes("/helpdesk/ticket/1")) {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							data: {
								id: 1,
								responsible_technician: "Tech TI 1",
								details:
									"[[Date: 11/08/2026],[System: Tech TI 1 solved the issue],[Hours: 12:00]]",
							},
							details:
								"[[Date: 11/08/2026],[System: Tech TI 1 solved the issue],[Hours: 12:00]]",
						}),
				});
			}
			if (url.includes("/helpdesk/ticket/1/technical-details/files/")) {
				return Promise.resolve({
					ok: true,
					json: () =>
						Promise.resolve({
							files: [],
						}),
				});
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});
	});

	const renderDashboard = () => {
		return render(
			<MemoryRouter>
				<MessageContext.Provider value={defaultMessageContext}>
					<TicketContext.Provider value={defaultTicketContext}>
						<UserManagementContext.Provider value={defaultUserContext}>
							<Dashboard />
						</UserManagementContext.Provider>
					</TicketContext.Provider>
				</MessageContext.Provider>
			</MemoryRouter>,
		);
	};

	it("should parse tech details without crashing when techsNames is an object", async () => {
		renderDashboard();

		// The test will fail with TypeError: o.find is not a function if the bug is present
		await waitFor(() => {
			expect(screen.getByText(/Tech TI 1/)).toBeInTheDocument();
		});
	});
});
