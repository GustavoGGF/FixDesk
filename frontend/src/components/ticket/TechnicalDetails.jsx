import { useState } from "react";
import {
	AlertCircle,
	Building2,
	ChevronDown,
	ChevronUp,
	Clock3,
	Download,
	FileText,
	History,
	Layers3,
	LoaderCircle,
	Mail,
	MapPin,
	Paperclip,
	Eye,
	Send,
	UserCog,
	UserRound,
	X,
} from "lucide-react";

const SUMMARY_FIELDS = [
	["requester", "Usuário", UserRound],
	["department", "Departamento", Building2],
	["email", "Email", Mail],
	["unit", "Unidade", MapPin],
	["sector", "Setor", Layers3],
	["occurrence", "Ocorrência", AlertCircle],
	["description", "Detalhes", FileText],
	["openDuration", "Tempo em aberto", Clock3],
	["responsibleTechnician", "Técnico responsável", UserCog],
];

function formatRecordDate(value) {
	if (!value) return "Data não informada";

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;

	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(date);
}

function SummaryField({ label, value, Icon }) {
	return (
		<div className="tw-flex tw-items-start tw-gap-[11px] tw-min-w-0">
			<span
				className="tw-grid tw-flex-none tw-place-items-center tw-w-[32px] tw-h-[32px] tw-rounded-[9px] tw-bg-[#e8f6f4] tw-text-[#277f79]"
				aria-hidden="true"
			>
				<Icon size={17} strokeWidth={1.8} />
			</span>
			<div className="tw-grid tw-gap-[3px] tw-min-w-0">
				<span className="tw-text-[#64748b] tw-text-[0.72rem] tw-font-bold tw-uppercase tw-tracking-[0.04em]">
					{label}
				</span>
				<span className="[overflow-wrap:anywhere] tw-text-[#0c203c] tw-text-[0.9rem] tw-leading-[1.4]">
					{value || "Não informado"}
				</span>
			</div>
		</div>
	);
}

function SummaryPanel({ ticket }) {
	return (
		<section
			className="tw-p-[26px_28px] max-[760px]:tw-p-5 tw-border-r tw-border-solid tw-border-[#dbe4ea] max-[760px]:tw-border-r-0 max-[760px]:tw-border-b tw-bg-white"
			aria-labelledby="ticket-summary-title"
		>
			<h2
				id="ticket-summary-title"
				className="tw-m-0 tw-font-semibold tw-text-[1rem]"
			>
				Resumo do chamado
			</h2>
			<div className="tw-grid tw-gap-[18px] tw-mt-6 max-[760px]:tw-grid-cols-2 max-[760px]:tw-gap-x-[12px] max-[760px]:tw-gap-y-[16px] max-[440px]:tw-grid-cols-1">
				{SUMMARY_FIELDS.map(([field, label, Icon]) => (
					<SummaryField
						key={field}
						label={label}
						value={ticket[field]}
						Icon={Icon}
					/>
				))}
			</div>
		</section>
	);
}

function LoadingTimeline() {
	return (
		<div
			className="tw-grid tw-gap-[14px]"
			aria-label="Carregando histórico"
			role="status"
		>
			{["one", "two", "three"].map((item) => (
				<div
					className="tw-grid tw-grid-cols-[16px_1fr] tw-gap-[12px]"
					key={item}
				>
					<span className="tw-block tw-rounded-[5px] tw-bg-[linear-gradient(90deg,#e4ecef_25%,#f4f7f8_50%,#e4ecef_75%)] tw-bg-[length:200%_100%] tw-animate-technical-pulse motion-reduce:tw-animate-none tw-w-[15px] tw-h-[15px] tw-mt-[3px] tw-rounded-full" />
					<div>
						<span className="tw-block tw-rounded-[5px] tw-bg-[linear-gradient(90deg,#e4ecef_25%,#f4f7f8_50%,#e4ecef_75%)] tw-bg-[length:200%_100%] tw-animate-technical-pulse motion-reduce:tw-animate-none tw-w-[42%] tw-h-[11px]" />
						<span className="tw-block tw-rounded-[5px] tw-bg-[linear-gradient(90deg,#e4ecef_25%,#f4f7f8_50%,#e4ecef_75%)] tw-bg-[length:200%_100%] tw-animate-technical-pulse motion-reduce:tw-animate-none tw-w-full tw-h-[44px] tw-mt-[9px]" />
					</div>
				</div>
			))}
		</div>
	);
}

function formatFileSize(bytes) {
	if (!bytes || Number.isNaN(bytes)) return "Tamanho não informado";

	const sizeInBytes = Number(bytes);
	if (sizeInBytes < 1024) return `${sizeInBytes} B`;
	if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(1)} KB`;
	return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file) {
	return (
		file.type?.startsWith("image/") ||
		/\.(gif|jpe?g|png|webp|bmp|svg)$/i.test(file.name || "")
	);
}

function TechnicalFiles({ files }) {
	const [isOpen, setIsOpen] = useState(false);

	if (files.length === 0) {
		return (
			<section
				className="tw-flex-none tw-min-h-[84px]"
				aria-labelledby="technical-files-title"
			>
				<div className="tw-flex tw-items-start tw-justify-between tw-mb-[18px] tw-text-[#277f79]">
					<div>
						<span className="tw-block tw-mb-1.5 tw-text-[#73d6ca] tw-text-[0.72rem] tw-font-bold tw-tracking-[0.08em] tw-uppercase">
							Anexos restritos
						</span>
						<h2
							id="technical-files-title"
							className="tw-m-0 tw-font-semibold tw-text-[1rem] tw-text-[#0c203c]"
						>
							Arquivos técnicos (0)
						</h2>
					</div>
					<Paperclip size={20} aria-hidden="true" />
				</div>
			</section>
		);
	}

	return (
		<section className="tw-flex-none" aria-labelledby="technical-files-title">
			<button
				type="button"
				className="tw-flex tw-w-full tw-items-center tw-justify-between tw-p-[8px_12px] tw-border tw-border-solid tw-border-[#dbe4ea] tw-rounded-[10px] tw-bg-white tw-cursor-pointer tw-text-left tw-transition-colors tw-duration-200 hover:tw-bg-[#f0f7f7] hover:tw-border-[#b2dfdb]"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
			>
				<div className="tw-flex tw-items-start tw-justify-between tw-text-[#277f79] tw-mb-0">
					<div>
						<span className="tw-block tw-mb-1.5 tw-text-[#73d6ca] tw-text-[0.72rem] tw-font-bold tw-tracking-[0.08em] tw-uppercase">
							Anexos restritos
						</span>
						<h2
							id="technical-files-title"
							className="tw-m-0 tw-font-semibold tw-text-[1rem] tw-text-[#0c203c]"
						>
							Arquivos técnicos ({files.length})
						</h2>
					</div>
				</div>
				<div className="tw-flex tw-items-center tw-gap-[6px] tw-text-[#277f79] tw-text-[0.82rem] tw-font-semibold">
					<Paperclip size={18} aria-hidden="true" />
					<span>{isOpen ? "Recolher" : "Ver arquivos"}</span>
					{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
				</div>
			</button>

			{isOpen && (
				<div className="tw-grid tw-grid-cols-[repeat(auto-fit,minmax(190px,1fr))] tw-gap-[10px] tw-mt-3 tw-max-h-[220px] max-[760px]:tw-max-h-none tw-overflow-y-auto tw-p-[2px_6px_2px_1px]">
					{files.map((file) => (
						<article
							className="tw-flex tw-min-w-0 tw-min-h-[92px] tw-flex-col tw-overflow-hidden tw-border tw-border-solid tw-border-[#dbe4ea] tw-rounded-[10px] tw-bg-white"
							key={file.id}
						>
							{isImageFile(file) ? (
								<a href={file.url} target="_blank" rel="noopener noreferrer">
									<img
										className="tw-block tw-w-full tw-h-[74px] tw-object-cover tw-bg-[#edf4f5]"
										src={file.url}
										alt={`Visualização de ${file.name}`}
									/>
								</a>
							) : (
								<div
									className="tw-grid tw-place-items-center tw-h-[74px] tw-bg-[#edf4f5] tw-text-[#277f79]"
									aria-hidden="true"
								>
									<FileText size={30} />
								</div>
							)}
							<div className="tw-grid tw-gap-1 tw-p-[9px_10px]">
								<strong
									className="tw-overflow-hidden tw-text-[#0c203c] tw-text-[0.8rem] tw-truncate"
									title={file.name}
								>
									{file.name}
								</strong>
								<span className="tw-overflow-hidden tw-text-[#64748b] tw-text-[0.7rem] tw-truncate">
									{file.type || "Tipo não informado"} ·{" "}
									{formatFileSize(file.size)}
								</span>
								<div className="tw-flex tw-gap-[10px] tw-mt-1">
									<a
										className="tw-inline-flex tw-items-center tw-gap-[4px] tw-text-[#3498db] tw-text-[0.73rem] tw-font-semibold tw-no-underline hover:tw-underline"
										href={file.url}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Eye size={15} />
										Visualizar
									</a>
									<a
										className="tw-inline-flex tw-items-center tw-gap-[4px] tw-text-[#3498db] tw-text-[0.73rem] tw-font-semibold tw-no-underline hover:tw-underline"
										href={file.url}
										download={file.name}
									>
										<Download size={15} />
										Baixar
									</a>
								</div>
							</div>
						</article>
					))}
				</div>
			)}
		</section>
	);
}

function TechnicalTimeline({ records, isLoading }) {
	const orderedRecords = [...records].sort(
		(first, second) => new Date(first.timestamp) - new Date(second.timestamp),
	);

	return (
		<section
			className="tw-flex tw-min-h-0 tw-flex-1 tw-flex-col"
			aria-labelledby="technical-history-title"
		>
			<div className="tw-flex tw-items-start tw-justify-between tw-mb-[18px] tw-text-[#277f79]">
				<div>
					<span className="tw-block tw-mb-1.5 tw-text-[#73d6ca] tw-text-[0.72rem] tw-font-bold tw-tracking-[0.08em] tw-uppercase">
						Acompanhamento
					</span>
					<h2
						id="technical-history-title"
						className="tw-m-0 tw-font-semibold tw-text-[1rem] tw-text-[#0c203c]"
					>
						Histórico técnico
					</h2>
				</div>
				<History size={20} aria-hidden="true" />
			</div>

			{isLoading ? (
				<LoadingTimeline />
			) : orderedRecords.length === 0 ? (
				<div
					className="tw-grid tw-flex-1 tw-place-items-center tw-content-center tw-gap-[10px] tw-min-h-[150px] tw-p-6 tw-border tw-border-dashed tw-border-[#bdd1d6] tw-rounded-[10px] tw-text-[#64748b] tw-text-center"
					role="status"
				>
					<History size={22} aria-hidden="true" />
					<p className="tw-max-w-[28ch] tw-m-0 tw-text-[0.88rem]">
						Nenhum registro técnico foi adicionado ainda.
					</p>
				</div>
			) : (
				<div className="tw-min-h-0 tw-flex-1 tw-overflow-y-auto tw-p-[4px_8px_4px_3px]">
					{orderedRecords.map((record, index) => (
						<article
							className="tw-relative tw-grid tw-grid-cols-[16px_minmax(0,1fr)] tw-gap-[12px] tw-pb-[18px] [&:not(:last-child)]:before:tw-absolute [&:not(:last-child)]:before:tw-top-[17px] [&:not(:last-child)]:before:tw-bottom-0 [&:not(:last-child)]:before:tw-left-[7px] [&:not(:last-child)]:before:tw-w-[1px] [&:not(:last-child)]:before:tw-bg-[#c7dfdc] [&:not(:last-child)]:before:tw-content-['']"
							key={record.id ?? `${record.timestamp}-${index}`}
						>
							<div
								className="tw-z-[1] tw-w-[15px] tw-h-[15px] tw-mt-[3px] tw-border-[3px] tw-border-solid tw-border-white tw-rounded-full tw-bg-[#4db6ac] tw-shadow-[0_0_0_1px_#9bd8d2]"
								aria-hidden="true"
							/>
							<div className="tw-p-[13px_15px] tw-border tw-border-solid tw-border-[#dbe4ea] tw-rounded-[10px] tw-bg-white">
								<div className="tw-flex max-[440px]:tw-grid tw-flex-wrap tw-items-baseline tw-justify-between tw-gap-x-[12px] tw-gap-y-[6px] tw-text-[#64748b] tw-text-[0.75rem]">
									<span>{formatRecordDate(record.timestamp)}</span>
									<strong className="tw-text-[#0c203c] tw-text-[0.8rem]">
										{record.author || "Autor não informado"}
									</strong>
								</div>
								<p className="tw-mt-[9px] tw-mb-0 tw-text-[#25364d] tw-text-[0.9rem] tw-leading-[1.55] tw-whitespace-pre-wrap [overflow-wrap:anywhere]">
									{record.content || "Registro sem conteúdo."}
								</p>
								{record.fileUrl && (
									<div className="tw-flex tw-items-center tw-gap-[6px] tw-mt-[10px] tw-p-[6px_10px] tw-rounded-[6px] tw-bg-[#f0f4f8] tw-text-[#277f79] tw-text-[0.82rem]">
										<Paperclip size={14} />
										<a
											href={record.fileUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="tw-text-[#3498db] tw-no-underline tw-font-medium tw-break-all hover:tw-underline"
										>
											{record.fileName || "Ver arquivo anexado"}
										</a>
									</div>
								)}
							</div>
						</article>
					))}
				</div>
			)}
		</section>
	);
}

function NoteComposer({
	canAddNote,
	note,
	isSavingNote,
	onAddNote,
	onNoteChange,
	selectedFile,
	onFileSelect,
	onFileRemove,
}) {
	if (!canAddNote) return null;

	const isDisabled = isSavingNote || (!note.trim() && !selectedFile);

	return (
		<section
			className="tw-pt-[18px] tw-border-t tw-border-solid tw-border-[#dbe4ea]"
			aria-labelledby="new-note-title"
		>
			<h2
				id="new-note-title"
				className="tw-m-0 tw-font-semibold tw-text-[1rem]"
			>
				Nova nota técnica / Mensagem
			</h2>
			<textarea
				aria-label="Texto da nova nota técnica"
				className="tw-block tw-w-full tw-min-h-[90px] tw-mt-3 tw-p-[11px_12px] tw-resize-y tw-border tw-border-solid tw-border-[#b8cbd1] tw-rounded-[10px] tw-bg-white tw-text-[#0c203c] tw-font-inherit tw-text-[0.88rem] placeholder:tw-text-[#5e7182] focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-[#3498db]/35 focus-visible:tw-ring-offset-2"
				disabled={isSavingNote}
				maxLength={2000}
				onChange={(event) => onNoteChange(event.target.value)}
				placeholder="Escreva uma mensagem ou nota técnica..."
				rows={3}
				value={note}
			/>
			{selectedFile && (
				<div className="tw-flex tw-items-center tw-justify-between tw-mt-2 tw-p-[6px_12px] tw-border tw-border-solid tw-border-[#cce3de] tw-rounded-[6px] tw-bg-[#f4fbf9] tw-text-[0.8rem]">
					<span className="tw-truncate tw-text-[#0c203c] tw-font-medium">
						{selectedFile.name}
					</span>
					<button
						type="button"
						className="tw-flex tw-items-center tw-justify-center tw-p-[3px] tw-border-0 tw-rounded-[4px] tw-bg-transparent tw-text-[#64748b] tw-cursor-pointer hover:tw-bg-[#e2ece9] hover:tw-text-[#d9534f]"
						onClick={onFileRemove}
						aria-label="Remover anexo"
						disabled={isSavingNote}
					>
						<X size={14} />
					</button>
				</div>
			)}
			<div className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-mt-3 tw-text-[#64748b] tw-text-[0.72rem]">
				<div className="tw-flex tw-items-center tw-gap-3">
					<label
						className={`tw-inline-flex tw-items-center tw-gap-[6px] tw-px-[11px] tw-py-[6px] tw-border tw-border-solid tw-border-[#dbe4ea] tw-rounded-[8px] tw-bg-white tw-text-[#0c203c] tw-cursor-pointer tw-text-[0.8rem] tw-font-medium tw-transition-all tw-duration-150 hover:tw-border-[#4db6ac] hover:tw-text-[#277f79] hover:tw-bg-[#f0fdfa] ${selectedFile ? "tw-border-[#4db6ac] tw-bg-[#e8f6f4] tw-text-[#277f79]" : ""}`}
						title="Anexar arquivo"
					>
						<Paperclip size={17} />
						<span>{selectedFile ? "Alterar anexo" : "Anexar"}</span>
						<input
							type="file"
							className="tw-hidden"
							onChange={(e) => {
								if (e.target.files?.[0]) {
									onFileSelect(e.target.files[0]);
								}
							}}
							disabled={isSavingNote}
						/>
					</label>
					<span>{note.length}/2000</span>
				</div>
				<button
					aria-label={isSavingNote ? "Enviando mensagem" : "Enviar mensagem"}
					className="tw-inline-flex tw-items-center tw-gap-[7px] tw-p-[9px_13px] tw-border-0 tw-rounded-[10px] tw-bg-[#4db6ac] tw-text-white tw-cursor-pointer tw-font-inherit tw-text-[0.82rem] tw-font-bold tw-transition-colors tw-duration-180 hover:enabled:tw-bg-[#277f79] disabled:tw-cursor-not-allowed disabled:tw-opacity-55 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-[#3498db]/35 focus-visible:tw-ring-offset-2"
					disabled={isDisabled}
					onClick={onAddNote}
					type="button"
				>
					{isSavingNote ? (
						<LoaderCircle
							className="tw-animate-spin motion-reduce:tw-animate-none"
							size={17}
						/>
					) : (
						<Send size={17} />
					)}
					{isSavingNote ? "Enviando" : "Enviar"}
				</button>
			</div>
		</section>
	);
}

/**
 * Apresenta o resumo e o histórico técnico de um chamado sem conhecer a origem dos dados.
 * `technicalRecords` usa objetos no formato `{ id?, timestamp, author, content, fileUrl?, fileName? }`.
 */
export default function TechnicalDetails({
	isOpen = true,
	ticket,
	status,
	technicalRecords = [],
	technicalFiles = [],
	isLoading = false,
	canAddNote = true,
	note = "",
	selectedFile = null,
	isSavingNote = false,
	error = "",
	onClose,
	onAddNote,
	onNoteChange,
	onFileSelect,
	onFileRemove,
}) {
	if (!isOpen) return null;

	const statusToneClass =
		status?.tone === "positive"
			? "tw-bg-[#dff6e2] tw-text-[#236b2a]"
			: status?.tone === "warning"
				? "tw-bg-[#fff3cd] tw-text-[#765b00]"
				: status?.tone === "negative"
					? "tw-bg-[#fde2e1] tw-text-[#8c2924]"
					: "tw-bg-[#e7edf2] tw-text-[#526172]";

	return (
		<div className="tw-fixed tw-inset-0 tw-z-[1050] tw-flex tw-items-center tw-justify-center tw-border-0 tw-p-0 tw-bg-[#0c203c]/50 tw-backdrop-blur-[6px] tw-font-inherit tw-text-inherit tw-text-left tw-animate-technical-overlay-fade motion-reduce:tw-animate-none">
			<div
				className="tw-w-[min(1120px,calc(100vw-32px))] tw-max-h-[min(860px,calc(100vh-32px))] max-[760px]:tw-w-[min(calc(100vw-20px),620px)] max-[760px]:tw-max-h-[calc(100vh-20px)] tw-flex tw-flex-col tw-overflow-hidden tw-border tw-border-solid tw-border-[#dbe4ea] tw-rounded-[16px] tw-bg-white tw-shadow-[0_8px_30px_rgb(12_32_60/0.15)] tw-text-[#0c203c] tw-font-sans tw-animate-technical-enter motion-reduce:tw-animate-none"
				role="dialog"
				aria-modal="true"
				aria-labelledby="technical-details-title"
			>
				<header className="tw-flex tw-items-start tw-justify-between tw-p-[24px_28px_20px] max-[760px]:tw-p-5 tw-bg-[#0c203c] tw-text-white">
					<div>
						<span className="tw-block tw-mb-1.5 tw-text-[#73d6ca] tw-text-[0.72rem] tw-font-bold tw-tracking-[0.08em] tw-uppercase">
							Detalhes do atendimento
						</span>
						<h1
							id="technical-details-title"
							className="tw-m-0 tw-font-semibold tw-text-[1.55rem] max-[440px]:tw-text-[1.3rem] tw-leading-[1.25]"
						>
							Chamado #{ticket.id}
						</h1>
						<span
							className={`tw-inline-flex tw-mt-3 tw-px-[9px] tw-py-[4px] tw-rounded-full tw-text-[0.76rem] tw-font-bold ${statusToneClass}`}
						>
							{status?.label || "Status não informado"}
						</span>
					</div>
					<button
						className="tw-inline-grid tw-place-items-center tw-w-[38px] tw-h-[38px] tw-border tw-border-solid tw-border-white/24 tw-rounded-[10px] tw-bg-transparent tw-text-white tw-cursor-pointer hover:tw-bg-white/12 focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-[#3498db]/35 focus-visible:tw-ring-offset-2"
						onClick={onClose}
						type="button"
						aria-label="Fechar detalhes do chamado"
					>
						<X size={20} />
					</button>
				</header>

				{error && (
					<div
						className="tw-flex tw-items-center tw-gap-[9px] tw-mt-4 tw-mx-[28px] tw-mb-0 tw-p-[11px_13px] tw-border tw-border-solid tw-border-[#f0b9b5] tw-rounded-[10px] tw-bg-[#fff5f4] tw-text-[#8c2924] tw-text-[0.88rem]"
						role="alert"
					>
						<AlertCircle size={18} aria-hidden="true" />
						<span>{error}</span>
					</div>
				)}

				<div className="tw-grid tw-grid-cols-[minmax(260px,0.88fr)_minmax(420px,1.12fr)] max-[760px]:tw-block max-[760px]:tw-overflow-y-auto tw-min-h-[520px] tw-flex-1 tw-bg-[#f6f9fa]">
					<SummaryPanel ticket={ticket} />
					<div className="tw-flex tw-min-w-0 tw-min-h-0 tw-flex-col tw-gap-[22px] tw-p-[26px_28px] max-[760px]:tw-p-5 max-[760px]:tw-min-h-[440px]">
						<TechnicalFiles files={technicalFiles} />
						<TechnicalTimeline
							records={technicalRecords}
							isLoading={isLoading}
						/>
						<NoteComposer
							canAddNote={canAddNote}
							isSavingNote={isSavingNote}
							note={note}
							selectedFile={selectedFile}
							onAddNote={onAddNote}
							onNoteChange={onNoteChange}
							onFileSelect={onFileSelect}
							onFileRemove={onFileRemove}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
