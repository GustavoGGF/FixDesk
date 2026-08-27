import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import OpenTicketWindow from "../components/ticket/openTicketWindow";
import { TicketContext } from "../context/TicketContext";
import { MessageContext } from "../context/MessageContext";

global.fetch = jest.fn();

describe("OpenTicketWindow Component", () => {
	const defaultTicketContext = {
		setReloadFilter: jest.fn(),
		setForcedLoad: jest.fn(),
		setChangeStatus: jest.fn(),
		setChangeTech: jest.fn(),
	};

	const defaultMessageContext = {
		setMessageError: jest.fn(),
		setTypeError: jest.fn(),
		setMessage: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		global.fetch.mockImplementation(() =>
			Promise.resolve({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ total: 1 }),
			}),
		);
	});

	const renderComponent = (props = {}) => {
		return render(
			<MessageContext.Provider value={defaultMessageContext}>
				<TicketContext.Provider value={defaultTicketContext}>
					<OpenTicketWindow
						ticketID="388"
						token="token123"
						userName="João Silva"
						userMail="joao@example.com"
						ticketMAIL="solicitante@example.com"
						ticketAREA="TI"
						techsNames={["João Silva", "Maria Souza"]}
						ticketResponsible_Technician="João Silva"
						CloseTicket={jest.fn()}
						{...props}
					/>
				</TicketContext.Provider>
			</MessageContext.Provider>,
		);
	};

	it("deve enviar o cabeçalho Content-Type application/json ao trocar o técnico responsável", async () => {
		renderComponent();

		const selects = screen.getAllByRole("combobox");
		const techSelect = selects.find((select) =>
			Array.from(select.options).some((opt) => opt.value === "Maria Souza"),
		);

		expect(techSelect).toBeInTheDocument();

		fireEvent.change(techSelect, { target: { value: "Maria Souza" } });

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				"/helpdesk/ticket/388",
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						"Content-Type": "application/json",
					}),
				}),
			);
		});
	});
});
