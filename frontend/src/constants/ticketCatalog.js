/**
 * Catálogo de ocorrências e problemas por área técnica.
 *
 * Fonte única para filtros de chamados e formulário de abertura.
 * Técnico Fiscal nunca recebe opções de TI; técnico TI nunca recebe opções Fiscais.
 *
 * @type {Record<string, { occurrences: string[], problems: Record<string, string[]> }>}
 */
export const TICKET_CATALOG = {
	TI: {
		occurrences: ["Infraestrutura", "Sistema"],
		problems: {
			Infraestrutura: [
				"Backup",
				"E-mail",
				"Equipamento",
				"Gerenciamento de Usuario",
				"Internet",
				"Permissão",
				"Novo SoftWare",
				"Integridade de Dados",
				"Alocação de Máquina",
			],
			Sistema: ["SAP", "MBI", "Synchro", "Office", "Softwares de Eng"],
		},
	},
	Fiscal: {
		occurrences: ["Lançamentos Fiscais", "Tributário", "Dúvidas Fiscais"],
		problems: {
			"Lançamentos Fiscais": [
				"Nota Fiscal (Emissão/Correção)",
				"Impostos / Retenções",
				"Manifestação / XML",
				"Outros",
			],
			Tributário: [
				"Nota Fiscal (Emissão/Correção)",
				"Impostos / Retenções",
				"Manifestação / XML",
				"Outros",
			],
			"Dúvidas Fiscais": [
				"Nota Fiscal (Emissão/Correção)",
				"Impostos / Retenções",
				"Manifestação / XML",
				"Outros",
			],
		},
	},
};

/**
 * Retorna as ocorrências disponíveis para uma área.
 * @param {string} area - "TI" ou "Fiscal"
 * @returns {string[]}
 */
export function getOccurrencesForArea(area) {
	return TICKET_CATALOG[area]?.occurrences ?? [];
}

/**
 * Retorna os problemas disponíveis para uma ocorrência dentro de uma área.
 * @param {string} area - "TI" ou "Fiscal"
 * @param {string} occurrence - Nome da ocorrência
 * @returns {string[]}
 */
export function getProblemsForOccurrence(area, occurrence) {
	return TICKET_CATALOG[area]?.problems[occurrence] ?? [];
}
