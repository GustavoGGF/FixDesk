import axios from "axios";

// Instância do Axios configurada com os cabeçalhos do Django CSRF.
// Isso garante que requisições POST para a API Django funcionem corretamente.
const errorClient = axios.create({
	xsrfCookieName: "csrftoken",
	xsrfHeaderName: "X-CSRFToken",
	headers: {
		"Content-Type": "application/json",
	},
});

/**
 * Envia um relatório de erro ocorrido no frontend para o backend.
 *
 * @param {string} message - Mensagem descritiva do erro.
 * @param {string} stack - Pilha de execução (stack trace) do erro.
 * @param {string} [url] - URL onde o erro aconteceu. Por padrão, usa o valor de window.location.href.
 * @returns {Promise<void>} Promessa resolvida após envio bem-sucedido ou tratada em caso de erro.
 */
export const logErrorFrontend = async (
	message,
	stack,
	url = window.location.href,
) => {
	try {
		await errorClient.post("/helpdesk/log-error-frontend/", {
			message,
			stack,
			url,
		});
	} catch (error) {
		// Impede recursão infinita se o serviço de log falhar.
		console.error("Falha ao registrar log de erro no servidor:", error);
	}
};
