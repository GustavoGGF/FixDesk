import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TicketsOptions from "../components/ticket/ticketsOptions";
import { OptionsContext } from "../context/OptionsContext";
import { AreaContext } from "../context/AreaContext";

describe("TicketsOptions Component", () => {
	const defaultContextValue = {
		messagetitle: { current: "" },
		respectiveArea: { current: "" },
		setAlert: jest.fn(),
		messageinfo2: { current: "" },
		messageinfo3: { current: "" },
		machineAlocate: { current: "" },
		alocate_machine_acess: false,
		messageinfo1: { current: "" },
		selectedDay: { current: [] },
		sector: { current: "" },
		occurrence: { current: "" },
		problemn: { current: "" },
		setAlertVerify: jest.fn(),
		reset: false,
		setReset: jest.fn(),
		activeAreas: [
			{ respective_area: 1, respective_area_code: "TI" },
			{ respective_area: 2, respective_area_code: "Fiscal" },
		],
		setActiveAreas: jest.fn(),
		linkAcess: { current: "" },
	};

	const defaultAreaContextValue = {
		activeAreas: [
			{ respective_area: 1, respective_area_code: "TI" },
			{ respective_area: 2, respective_area_code: "Fiscal" },
		],
		loadingAreas: false,
		getAreaCodeById: jest.fn(),
	};

	const renderComponent = (
		props = {},
		contextValue = defaultContextValue,
		areaValue = defaultAreaContextValue,
	) => {
		return render(
			<AreaContext.Provider value={areaValue}>
				<OptionsContext.Provider value={contextValue}>
					<TicketsOptions Name="John Doe" {...props} />
				</OptionsContext.Provider>
			</AreaContext.Provider>,
		);
	};

	it("should render correctly with default select options", () => {
		renderComponent();
		expect(screen.getByRole("combobox")).toBeInTheDocument();
		expect(screen.getByText("Seleciona a Área Respectiva")).toBeInTheDocument();
	});

	it("should reveal TI options when 'TI' option is selected", () => {
		const contextVal = {
			...defaultContextValue,
			setAlert: jest.fn(),
			setAlertVerify: jest.fn(),
		};
		renderComponent({}, contextVal);

		const selectAR = screen.getByRole("combobox");
		fireEvent.change(selectAR, { target: { value: "1" } });

		expect(contextVal.setAlert).toHaveBeenCalledWith(false);
		expect(contextVal.setAlertVerify).toHaveBeenCalledWith(false);
		expect(contextVal.respectiveArea.current).toBe(1);
	});

	it("should reveal Fiscal options when 'Fiscal' option is selected", () => {
		const contextVal = {
			...defaultContextValue,
			setAlert: jest.fn(),
			setAlertVerify: jest.fn(),
		};
		renderComponent({}, contextVal);

		const selectAR = screen.getByRole("combobox");
		fireEvent.change(selectAR, { target: { value: "2" } });

		expect(contextVal.setAlert).toHaveBeenCalledWith(false);
		expect(contextVal.setAlertVerify).toHaveBeenCalledWith(false);
		expect(contextVal.respectiveArea.current).toBe(2);
		expect(screen.getByText("Lançamentos Fiscais")).toBeInTheDocument();
	});
});
