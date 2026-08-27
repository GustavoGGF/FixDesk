import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
	Search,
	Trash2,
	UserPlus,
	Users,
	Layers3,
	X,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import Navbar from "../components/general/navbar.jsx";
import LoadingChat from "../components/loading/loadingChat.jsx";
import ExcludeUser from "../components/utility/excludeUser.jsx";
import Message from "../components/utility/message.jsx";
import { MessageContext } from "../context/MessageContext.js";
import { UserManagementContext } from "../context/UserManagement.js";
import api from "../services/api.js";

const GROUP_LABELS = {
	Helpdesk_User: "Usuário",
	Helpdesk_Technician_TI: "Technician_TI",
	Helpdesk_Technician_Fiscal: "Technician_Fiscal",
	Helpdesk_Leader_TI: "Líder TI",
};

const GROUP_DETAILS = {
	Helpdesk_User: {
		label: "Usuário",
		badgeStyle: "tw-bg-[#edf0f2] tw-text-[#52606d]",
		description:
			"Permite a abertura de chamados de suporte para as áreas de TI e Fiscal, além do acompanhamento e visualização dos próprios chamados.",
	},
	Helpdesk_Technician_TI: {
		label: "Technician_TI",
		badgeStyle: "tw-bg-[#eaf0ff] tw-text-[#4057a6]",
		description:
			"Permite o atendimento, transferência, gerenciamento de chamados técnicos e acesso completo ao Dashboard da área de TI.",
	},
	Helpdesk_Technician_Fiscal: {
		label: "Technician_Fiscal",
		badgeStyle: "tw-bg-[#fff1e8] tw-text-[#bd5c20]",
		description:
			"Permite o atendimento, transferência, gerenciamento de chamados fiscais e acesso ao Dashboard do Setor Fiscal.",
	},
	Helpdesk_Leader_TI: {
		label: "Líder TI",
		badgeStyle: "tw-bg-[#eaf0ff] tw-text-[#4057a6]",
		description:
			"Permite a gestão avançada da equipe técnica, atendimento de chamados da área de TI e acesso total ao Dashboard TI.",
	},
};

function getFullName(user) {
	return (
		`${user.first_name || ""} ${user.last_name || ""}`.trim() ||
		"Usuário sem nome"
	);
}

function getInitials(user) {
	return getFullName(user)
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0].toUpperCase())
		.join("");
}

function getGroupStyle(group) {
	if (group.includes("Fiscal")) {
		return "tw-bg-[#fff1e8] tw-text-[#bd5c20]";
	}
	if (group.includes("TI") || group.includes("Leader")) {
		return "tw-bg-[#eaf0ff] tw-text-[#4057a6]";
	}
	return "tw-bg-[#edf0f2] tw-text-[#52606d]";
}

function ProfileMark({ groups }) {
	const isTechnician = groups.some(
		(group) => group.includes("Technician") || group.includes("Leader"),
	);
	return (
		<span
			className={`tw-flex tw-h-9 tw-w-9 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full ${isTechnician ? "tw-bg-[#ec8437]" : "tw-bg-[#f29447]"}`}
			aria-hidden="true"
		>
			{isTechnician ? (
				<UserPlus size={18} strokeWidth={2.2} color="white" />
			) : (
				<Users size={18} strokeWidth={2.2} color="white" />
			)}
		</span>
	);
}

function SummaryCard({ label, value, icon: Icon, tone, onClick }) {
	const isClickable = Boolean(onClick);
	const Component = isClickable ? "button" : "article";
	return (
		<Component
			type={isClickable ? "button" : undefined}
			onClick={onClick}
			className={`tw-flex tw-min-h-[104px] tw-w-full tw-items-center tw-justify-between tw-rounded-[12px] tw-border tw-border-[#e5e8eb] tw-bg-white tw-px-6 tw-py-5 tw-shadow-[0_2px_8px_rgba(12,32,60,0.06)] tw-text-left ${
				isClickable
					? "tw-cursor-pointer hover:tw-border-[#5366b0] hover:tw-shadow-[0_4px_12px_rgba(83,102,176,0.15)] focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-[#5366b0] tw-transition-all"
					: ""
			}`}
		>
			<div>
				<p className="tw-m-0 tw-text-sm tw-font-medium tw-text-[#25313c]">
					{label}
				</p>
				<div className="tw-flex tw-items-baseline tw-gap-2">
					<p className="tw-mt-1 tw-mb-0 tw-text-3xl tw-font-bold tw-leading-none tw-text-[#121b24]">
						{value}
					</p>
					{isClickable && (
						<span className="tw-text-xs tw-font-semibold tw-text-[#5366b0]">
							(Clique para ver)
						</span>
					)}
				</div>
			</div>
			<span
				className={`tw-flex tw-h-11 tw-w-11 tw-items-center tw-justify-center tw-rounded-full ${tone}`}
				aria-hidden="true"
			>
				<Icon size={21} strokeWidth={2} />
			</span>
		</Component>
	);
}

function ActiveGroupsModal({ isOpen, onClose, activeGroupsList }) {
	if (!isOpen) return null;

	return (
		<div
			className="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black/40 tw-p-4 tw-backdrop-blur-sm"
			role="presentation"
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="active-groups-modal-title"
				className="tw-w-full tw-max-w-2xl tw-rounded-2xl tw-bg-white tw-shadow-2xl tw-border tw-border-[#e2e7ea] tw-overflow-hidden"
			>
				<div className="tw-flex tw-items-center tw-justify-between tw-border-b tw-border-[#edf0f2] tw-px-6 tw-py-4 tw-bg-[#f8fafb]">
					<div className="tw-flex tw-items-center tw-gap-3">
						<span className="tw-flex tw-h-10 tw-w-10 tw-items-center tw-justify-center tw-rounded-full tw-bg-[#edf0ff] tw-text-[#5366b0]">
							<Layers3 size={20} />
						</span>
						<div>
							<h3
								id="active-groups-modal-title"
								className="tw-m-0 tw-text-lg tw-font-bold tw-text-[#0c203c]"
							>
								Grupos Ativos ({activeGroupsList.length})
							</h3>
							<p className="tw-m-0 tw-text-xs tw-text-[#687581]">
								Detalhamento dos grupos de acesso e suas descrições no FixDesk
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="tw-rounded-lg tw-p-2 tw-text-[#7d8a94] hover:tw-bg-[#eaeef1] hover:tw-text-[#1f2c38] focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-[#5366b0] tw-transition-colors"
						aria-label="Fechar modal"
					>
						<X size={20} />
					</button>
				</div>

				<div className="tw-max-h-[65vh] tw-overflow-y-auto tw-p-6 tw-space-y-4">
					{activeGroupsList.length === 0 ? (
						<p className="tw-text-center tw-py-8 tw-text-sm tw-text-[#71808b]">
							Nenhum grupo ativo encontrado no momento.
						</p>
					) : (
						activeGroupsList.map((group) => (
							<div
								key={group.name}
								className="tw-rounded-xl tw-border tw-border-[#e5e8eb] tw-bg-[#fbfcfc] tw-p-4 tw-transition-all hover:tw-border-[#d0d7de] hover:tw-bg-white hover:tw-shadow-sm"
							>
								<div className="tw-flex tw-items-center tw-justify-between tw-mb-2">
									<div className="tw-flex tw-items-center tw-gap-2">
										<span
											className={`tw-rounded-full tw-px-3 tw-py-1 tw-text-xs tw-font-semibold ${group.badgeStyle}`}
										>
											{group.label}
										</span>
										<code className="tw-text-xs tw-font-mono tw-text-[#71808b] tw-bg-[#eef2f5] tw-px-2 tw-py-0.5 tw-rounded">
											{group.name}
										</code>
									</div>
									<span className="tw-inline-flex tw-items-center tw-gap-1.5 tw-text-xs tw-font-medium tw-text-[#52606d] tw-bg-white tw-px-2.5 tw-py-1 tw-rounded-full tw-border tw-border-[#e2e7ea]">
										<Users size={13} className="tw-text-[#687581]" />
										{group.userCount}{" "}
										{group.userCount === 1 ? "usuário" : "usuários"}
									</span>
								</div>
								<p className="tw-m-0 tw-text-sm tw-text-[#374151] tw-leading-relaxed">
									{group.description}
								</p>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

function getPageNumbers(current, total) {
	if (total <= 7) {
		return Array.from({ length: total }, (_, i) => i + 1);
	}
	if (current <= 4) {
		return [1, 2, 3, 4, 5, "...", total];
	}
	if (current >= total - 3) {
		return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
	}
	return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function ManageUser() {
	const [dataUsers, setDataUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		const handler = setTimeout(() => {
			setSearchTerm(searchInput);
			setCurrentPage(1);
		}, 500);

		return () => clearTimeout(handler);
	}, [searchInput]);
	const [totalPages, setTotalPages] = useState(1);
	const [totalUsers, setTotalUsers] = useState(0);
	const [csrfToken, setCsrfToken] = useState("");
	const [showActiveGroupsModal, setShowActiveGroupsModal] = useState(false);
	const { message, setMessage } = useContext(MessageContext);
	const {
		configUsers,
		setConfigUsers,
		showExcludeUser,
		setCurrentUserAlteration,
		setShowExcludeUser,
	} = useContext(UserManagementContext);

	const loadUsers = useCallback((page = 1, search = "") => {
		setLoading(true);
		const params = new URLSearchParams({
			page: String(page),
			page_size: "10",
		});
		if (search.trim()) {
			params.append("search", search.trim());
		}

		fetch(`/dashboard-ti/get-users-fixdesk/?${params.toString()}`, {
			method: "GET",
			headers: { Accept: "application/json" },
		})
			.then((response) => response.json())
			.then((data) => {
				if (data && Array.isArray(data.users)) {
					setDataUsers(data.users);
					setTotalUsers(data.total_users || 0);
					setTotalPages(data.total_pages || 1);
					setCurrentPage(data.current_page || 1);
				} else if (Array.isArray(data)) {
					setDataUsers(data);
					setTotalUsers(data.length);
					setTotalPages(Math.ceil(data.length / 10) || 1);
					setCurrentPage(1);
				} else {
					setDataUsers([]);
					setTotalUsers(0);
					setTotalPages(1);
				}
			})
			.catch((error) => {
				console.error("Erro ao carregar lista de usuários:", error);
				setDataUsers([]);
				setTotalUsers(0);
				setTotalPages(1);
			})
			.finally(() => setLoading(false));
	}, []);

	const [theme, setTheme] = useState("");

	useEffect(() => {
		document.title = "Gerenciamento de Usuários - FixDesk";
		const storedTheme = localStorage.getItem("Theme");
		if (storedTheme === null || storedTheme === "black") {
			localStorage.setItem("Theme", "black");
			setTheme("themeBlack");
		} else {
			setTheme("theme-light");
		}
		api.get("/helpdesk/get-token/").then((response) => {
			if (response.data?.token) setCsrfToken(response.data.token);
		});
	}, []);

	useEffect(() => {
		loadUsers(currentPage, searchTerm);
	}, [currentPage, searchTerm, loadUsers]);

	useEffect(() => {
		if (configUsers) {
			loadUsers(currentPage, searchTerm);
			setConfigUsers(false);
		}
	}, [configUsers, currentPage, searchTerm, loadUsers, setConfigUsers]);

	const groups = useMemo(() => new Set(Object.keys(GROUP_DETAILS)), []);

	const activeGroupsList = useMemo(() => {
		const groupUserCounts = {};
		for (const user of dataUsers) {
			for (const group of user.groups || []) {
				groupUserCounts[group] = (groupUserCounts[group] || 0) + 1;
			}
		}
		return Object.keys(GROUP_DETAILS).map((groupName) => {
			const detail = GROUP_DETAILS[groupName];
			return {
				name: groupName,
				label: detail.label,
				badgeStyle: detail.badgeStyle,
				description: detail.description,
				userCount: groupUserCounts[groupName] || 0,
			};
		});
	}, [dataUsers]);

	function excludeUser(user) {
		setCurrentUserAlteration(user);
		setShowExcludeUser(true);
		setConfigUsers(false);
	}

	const startItem = totalUsers > 0 ? (currentPage - 1) * 10 + 1 : 0;
	const endItem = Math.min(currentPage * 10, totalUsers);

	return (
		<div className={`tw-min-h-screen ${theme || "tw-bg-[#f3f6f8]"}`}>
			<Navbar />
			<main className="tw-w-full tw-px-4 tw-py-6 sm:tw-px-6 lg:tw-px-8 lg:tw-py-8">
				{message && <Message CloseMessage={() => setMessage(false)} />}

				<header className="tw-mb-6 tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row sm:tw-items-end sm:tw-justify-between">
					<div>
						<h1 className="tw-m-0 tw-text-2xl tw-font-bold tw-leading-tight tw-text-[#0c203c]">
							Gerenciamento de usuários
						</h1>
						<p className="tw-m-1 tw-text-sm tw-text-[#687581]">
							Consulte os acessos e grupos ativos do FixDesk.
						</p>
					</div>
					<span className="tw-text-xs tw-font-semibold tw-uppercase tw-tracking-[0.12em] tw-text-[#82909b]">
						Administração
					</span>
				</header>

				<section
					className="tw-mb-7 tw-grid tw-grid-cols-1 tw-gap-4 md:tw-grid-cols-3"
					aria-label="Resumo de usuários"
				>
					<SummaryCard
						label="Total de Usuários"
						value={totalUsers}
						icon={Users}
						tone="tw-bg-[#e7f5f2] tw-text-[#338d83]"
					/>
					<SummaryCard
						label="Grupos Ativos"
						value={groups.size}
						icon={Layers3}
						tone="tw-bg-[#edf0ff] tw-text-[#5366b0]"
						onClick={() => setShowActiveGroupsModal(true)}
					/>
				</section>

				<section
					className="tw-overflow-hidden tw-rounded-[12px] tw-border tw-border-[#e2e7ea] tw-bg-white tw-shadow-[0_2px_10px_rgba(12,32,60,0.05)]"
					aria-labelledby="users-list-title"
				>
					<div className="tw-flex tw-flex-col tw-gap-4 tw-border-b tw-border-[#edf0f2] tw-p-5 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between sm:tw-px-6">
						<div>
							<h2
								id="users-list-title"
								className="tw-m-0 tw-text-lg tw-font-bold tw-text-[#1f2c38]"
							>
								Lista de usuários
							</h2>
							<p className="tw-m-1 tw-text-xs tw-text-[#7d8a94]">
								{totalUsers} usuário(s) registrado(s)
							</p>
						</div>
						<div className="tw-relative tw-group tw-flex tw-w-full sm:tw-max-w-[320px] tw-items-center">
							<Search
								size={18}
								className="tw-pointer-events-none tw-absolute tw-left-3.5 tw-text-[#7d8a94] tw-transition-colors group-focus-within:tw-text-[#4057a6]"
								aria-hidden="true"
							/>
							<input
								type="text"
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="tw-w-full tw-rounded-xl tw-border tw-border-[#d9e0e4] tw-bg-[#f8fafb] tw-py-2.5 tw-pl-10 tw-pr-9 tw-text-sm tw-font-medium tw-text-[#1f2c38] tw-shadow-sm tw-transition-all tw-duration-200 focus:tw-border-[#4057a6] focus:tw-bg-white focus:tw-outline-none focus:tw-ring-4 focus:tw-ring-[#4057a6]/10 placeholder:tw-text-[#9ba6ae]"
								placeholder="Buscar usuário ou grupo..."
								aria-label="Buscar usuário ou grupo"
							/>
							{searchInput && (
								<button
									type="button"
									onClick={() => setSearchInput("")}
									className="tw-absolute tw-right-2.5 tw-flex tw-h-6 tw-w-6 tw-items-center tw-justify-center tw-rounded-full tw-text-[#82909b] hover:tw-bg-[#eaf0ff] hover:tw-text-[#4057a6] focus-visible:tw-outline-none tw-transition-colors"
									aria-label="Limpar busca"
								>
									<X size={14} />
								</button>
							)}
						</div>
					</div>

					<div className="tw-overflow-x-auto">
						<table className="tw-w-full tw-min-w-[760px] tw-border-collapse tw-text-left">
							<thead className="tw-bg-[#f8fafb] tw-text-xs tw-uppercase tw-tracking-[0.08em] tw-text-[#63717c]">
								<tr>
									<th scope="col" className="tw-px-6 tw-py-4 tw-font-bold">
										Usuário
									</th>
									<th scope="col" className="tw-px-4 tw-py-4 tw-font-bold">
										Perfil
									</th>
									<th scope="col" className="tw-px-4 tw-py-4 tw-font-bold">
										Grupo
									</th>
									<th scope="col" className="tw-px-4 tw-py-4 tw-font-bold">
										Status
									</th>
									<th
										scope="col"
										className="tw-px-6 tw-py-4 tw-text-right tw-font-bold"
									>
										Ações
									</th>
								</tr>
							</thead>
							<tbody className="tw-divide-y tw-divide-[#edf0f2]">
								{loading && (
									<tr>
										<td colSpan="5" className="tw-py-12 tw-text-center">
											<LoadingChat />
										</td>
									</tr>
								)}
								{!loading &&
									dataUsers.map((user, index) => {
										const userGroups = user.groups || [];
										return (
											<tr
												key={user.id}
												className={`tw-transition-colors hover:tw-bg-[#f5fafa] ${index % 2 === 0 ? "tw-bg-[#f8fafb]" : "tw-bg-white"}`}
											>
												<td className="tw-px-6 tw-py-4">
													<div className="tw-flex tw-items-center tw-gap-3">
														<span className="tw-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-full tw-bg-[#e4e9ee] tw-text-xs tw-font-bold tw-text-[#51616f]">
															{getInitials(user)}
														</span>
														<span className="tw-font-medium tw-text-[#27333d]">
															{getFullName(user)}
														</span>
													</div>
												</td>
												<td className="tw-px-4 tw-py-4">
													<div className="tw-flex tw-items-center tw-gap-2">
														<ProfileMark groups={userGroups} />
														<span className="tw-text-[#313e48]">
															{userGroups.some(
																(group) =>
																	group.includes("Technician") ||
																	group.includes("Leader"),
															)
																? "Técnico"
																: "Usuário"}
														</span>
													</div>
												</td>
												<td className="tw-px-4 tw-py-4">
													<div className="tw-flex tw-flex-wrap tw-gap-1.5">
														{userGroups.length ? (
															userGroups.map((group) => (
																<span
																	key={group}
																	className={`tw-rounded-full tw-px-2.5 tw-py-1 tw-text-xs tw-font-semibold ${getGroupStyle(group)}`}
																>
																	{GROUP_LABELS[group] || group}
																</span>
															))
														) : (
															<span className="tw-text-sm tw-text-[#8b969e]">
																Sem grupo
															</span>
														)}
													</div>
												</td>
												<td className="tw-px-4 tw-py-4">
													<span className="tw-inline-flex tw-items-center tw-gap-2 tw-text-sm tw-font-medium tw-text-[#3f9568]">
														<span
															className="tw-h-2 tw-w-2 tw-rounded-full tw-bg-[#55b87a]"
															aria-hidden="true"
														/>
														Ativo
													</span>
												</td>
												<td className="tw-px-6 tw-py-4">
													<div className="tw-flex tw-justify-end tw-gap-1">
														<button
															type="button"
															onClick={() => excludeUser(user)}
															className="tw-rounded-md tw-p-2 tw-text-[#c37945] hover:tw-bg-[#fff1e8] focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-[#c37945]"
															aria-label={`Excluir ${getFullName(user)}`}
															title="Excluir usuário"
														>
															<Trash2 size={18} />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								{!loading && dataUsers.length === 0 && (
									<tr>
										<td
											colSpan="5"
											className="tw-px-6 tw-py-12 tw-text-center tw-text-sm tw-text-[#71808b]"
										>
											Nenhum usuário encontrado.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>

					{/* Controles de Paginação */}
					<div className="tw-flex tw-flex-col tw-gap-3 tw-border-t tw-border-[#edf0f2] tw-px-6 tw-py-4 sm:tw-flex-row sm:tw-items-center sm:tw-justify-between tw-bg-[#f8fafb]">
						<div className="tw-text-xs tw-text-[#687581]">
							{totalUsers > 0 ? (
								<span>
									Exibindo{" "}
									<strong className="tw-font-semibold tw-text-[#1f2c38]">
										{startItem}
									</strong>{" "}
									a{" "}
									<strong className="tw-font-semibold tw-text-[#1f2c38]">
										{endItem}
									</strong>{" "}
									de{" "}
									<strong className="tw-font-semibold tw-text-[#1f2c38]">
										{totalUsers}
									</strong>{" "}
									usuário(s)
								</span>
							) : (
								<span>Nenhum usuário para exibir</span>
							)}
						</div>

						<div className="tw-flex tw-items-center tw-gap-1.5">
							<button
								type="button"
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage <= 1 || loading}
								className="tw-inline-flex tw-items-center tw-gap-1 tw-rounded-lg tw-border tw-border-[#d9e0e4] tw-bg-white tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-text-[#374151] hover:tw-bg-[#f3f6f8] disabled:tw-opacity-50 disabled:tw-cursor-not-allowed focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-[#5366b0] tw-transition-colors"
							>
								<ChevronLeft size={14} />
								Anterior
							</button>

							<div className="tw-flex tw-items-center tw-gap-1">
								{getPageNumbers(currentPage, totalPages).map((item, idx) => {
									const key =
										item === "..."
											? idx === 1
												? "ellipsis-left"
												: "ellipsis-right"
											: `page-${item}`;
									return item === "..." ? (
										<span
											key={key}
											className="tw-px-1.5 tw-text-xs tw-text-[#8b969e]"
										>
											...
										</span>
									) : (
										<button
											key={key}
											type="button"
											onClick={() => setCurrentPage(item)}
											disabled={loading}
											className={`tw-h-8 tw-w-8 tw-rounded-lg tw-text-xs tw-font-semibold tw-transition-colors ${
												item === currentPage
													? "tw-bg-[#0c203c] tw-text-white"
													: "tw-border tw-border-[#d9e0e4] tw-bg-white tw-text-[#374151] hover:tw-bg-[#f3f6f8]"
											}`}
										>
											{item}
										</button>
									);
								})}
							</div>

							<button
								type="button"
								onClick={() =>
									setCurrentPage((prev) => Math.min(prev + 1, totalPages))
								}
								disabled={currentPage >= totalPages || loading}
								className="tw-inline-flex tw-items-center tw-gap-1 tw-rounded-lg tw-border tw-border-[#d9e0e4] tw-bg-white tw-px-3 tw-py-1.5 tw-text-xs tw-font-medium tw-text-[#374151] hover:tw-bg-[#f3f6f8] disabled:tw-opacity-50 disabled:tw-cursor-not-allowed focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-[#5366b0] tw-transition-colors"
							>
								Próximo
								<ChevronRight size={14} />
							</button>
						</div>
					</div>
				</section>
			</main>
			{showExcludeUser && <ExcludeUser token={csrfToken} />}
			<ActiveGroupsModal
				isOpen={showActiveGroupsModal}
				onClose={() => setShowActiveGroupsModal(false)}
				activeGroupsList={activeGroupsList}
			/>
		</div>
	);
}
