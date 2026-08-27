import axios from "axios";
import { logErrorFrontend } from "./errorLogger";

/**
 * Instância customizada do Axios para realizar chamadas HTTP.
 * Inclui interceptadores para tratamento de erros automática.
 */
const api = axios.create({
	xsrfCookieName: "csrftoken",
	xsrfHeaderName: "X-CSRFToken",
	headers: {
		"Content-Type": "application/json",
	},
});

// Interceptor de resposta para capturar e registrar erros do backend
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const errorMessage =
			error.response?.data?.detail ||
			error.response?.data?.message ||
			error.message ||
			"Erro desconhecido na chamada à API";

		const url = error.config?.url || window.location.href;

		// Constrói uma representação do stack trace ou detalhes da resposta
		const errorStack =
			error.stack || JSON.stringify(error.response?.data || error);

		// Registra o erro no serviço de logs frontend
		await logErrorFrontend(errorMessage, errorStack, url);

		return Promise.reject(error);
	},
);

export default api;
