import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useContext } from "react";
import { AreaContext, AreaProvider } from "../context/AreaContext";
import api from "../services/api";

jest.mock("../services/api");

const TestConsumer = () => {
	const { activeAreas, loadingAreas, getAreaCodeById } =
		useContext(AreaContext);

	return (
		<div>
			<span data-testid="loading">{String(loadingAreas)}</span>
			<span data-testid="count">{activeAreas.length}</span>
			<span data-testid="code-1">{getAreaCodeById(1)}</span>
			<span data-testid="code-2">{getAreaCodeById(2)}</span>
			<span data-testid="code-unknown">{getAreaCodeById(99)}</span>
		</div>
	);
};

describe("AreaContext", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("fetches active areas on mount and provides getAreaCodeById utility", async () => {
		api.get.mockResolvedValueOnce({
			data: {
				areas: [
					{ respective_area: 1, respective_area_code: "TI" },
					{ respective_area: 2, respective_area_code: "Fiscal" },
				],
			},
		});

		render(
			<AreaProvider>
				<TestConsumer />
			</AreaProvider>,
		);

		expect(screen.getByTestId("loading")).toHaveTextContent("true");

		await waitFor(() => {
			expect(screen.getByTestId("loading")).toHaveTextContent("false");
		});

		expect(screen.getByTestId("count")).toHaveTextContent("2");
		expect(screen.getByTestId("code-1")).toHaveTextContent("TI");
		expect(screen.getByTestId("code-2")).toHaveTextContent("Fiscal");
		expect(screen.getByTestId("code-unknown")).toHaveTextContent("99");
		expect(api.get).toHaveBeenCalledWith("/helpdesk/active-areas/");
	});

	it("handles API error gracefully without breaking consumers", async () => {
		const consoleSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});
		api.get.mockRejectedValueOnce(new Error("Network Error"));

		render(
			<AreaProvider>
				<TestConsumer />
			</AreaProvider>,
		);

		await waitFor(() => {
			expect(screen.getByTestId("loading")).toHaveTextContent("false");
		});

		expect(screen.getByTestId("count")).toHaveTextContent("0");
		expect(screen.getByTestId("code-1")).toHaveTextContent("1");
		expect(consoleSpy).toHaveBeenCalledWith(
			"Erro ao carregar áreas ativas:",
			expect.any(Error),
		);

		consoleSpy.mockRestore();
	});
});
