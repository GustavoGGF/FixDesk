import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../pages/login";
import { MessageContext } from "../context/MessageContext";
import api from "../services/api";

jest.mock("../services/api");

const messageContext = {
	typeError: { current: "" },
	messageError: { current: "" },
	setMessage: jest.fn(),
	message: false,
};

const renderLogin = () =>
	render(
		<MessageContext.Provider value={messageContext}>
			<Login />
		</MessageContext.Provider>,
	);

const submitLogin = () => {
	const userInput = screen.getByRole("textbox");
	const passwordInput = document.querySelector('input[name="pass"]');
	fireEvent.change(userInput, {
		target: { value: "admin" },
	});
	fireEvent.change(passwordInput, {
		target: { value: "password" },
	});
	fireEvent.click(screen.getByRole("button", { name: "Logar" }));
};

describe("Login", () => {
	let originalLocation;

	beforeEach(() => {
		jest.clearAllMocks();
		localStorage.clear();
		originalLocation = window.location;
		delete window.location;
		window.location = { ...originalLocation, href: "http://localhost/login" };
	});

	afterEach(() => {
		window.location = originalLocation;
	});

	it("redireciona para /helpdesk e mantém o contrato sem campos LDAP obrigatórios", async () => {
		api.post.mockResolvedValueOnce({
			status: 200,
			data: {
				data: {
					name: "Administrador Local",
					mail: "admin@example.com",
					company: "",
					roles: ["local"],
					groups: ["Django Superuser"],
				},
			},
		});

		renderLogin();
		submitLogin();

		await waitFor(() => expect(window.location.href).toBe("/helpdesk"));
		expect(JSON.parse(localStorage.getItem("roles"))).toEqual(["local"]);
		expect(JSON.parse(localStorage.getItem("groups"))).toEqual([
			"Django Superuser",
		]);
		expect(JSON.parse(localStorage.getItem("dataInfo"))).toEqual({
			data: {
				name: "Administrador Local",
				mail: "admin@example.com",
				company: "",
				roles: ["local"],
				groups: ["Django Superuser"],
			},
		});
	});

	it("encerra o loading quando uma resposta 200 não possui payload", async () => {
		api.post.mockResolvedValueOnce({ status: 200, data: null });

		renderLogin();
		submitLogin();

		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Logar" })).toBeVisible(),
		);
		expect(messageContext.setMessage).toHaveBeenCalledWith(true);
	});

	it("encerra o loading e exibe erro para resposta 401", async () => {
		api.post.mockRejectedValueOnce({ response: { status: 401 } });

		renderLogin();
		submitLogin();

		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Logar" })).toBeVisible(),
		);
		expect(messageContext.setMessage).toHaveBeenCalledWith(true);
		expect(messageContext.messageError.current).toBe(
			"Usuário e/ou Senha Inválido(s)",
		);
	});

	it("encerra o loading e exibe erro para respostas inesperadas", async () => {
		api.post.mockRejectedValueOnce({ response: { status: 400 } });

		renderLogin();
		submitLogin();

		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Logar" })).toBeVisible(),
		);
		expect(messageContext.setMessage).toHaveBeenCalledWith(true);
	});
});
