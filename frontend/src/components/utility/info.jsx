import CloseBTN from "../../images/components/close.png";

/**
 * Info component to display a notification message indicating a ticket was opened successfully.
 *
 * @param {object} props
 * @param {string|number} props.id - The ID of the opened ticket.
 * @param {string} props.cls - Additional CSS classes for the main container (e.g., animation classes).
 * @param {string} props.cls2 - Additional CSS classes for the indicator dot.
 * @param {function} props.funct - Callback function triggered when the close button is clicked.
 */
export default function Info({ id, cls, cls2, funct }) {
	return (
		<div
			className={`tw-w-full tw-h-[3em] tw-bg-[var(--sgbus-green)] tw-z-[200000] tw-flex position-fixed top-0 start-50 translate-middle-x animate__animated ${cls}`}
		>
			<button
				type="button"
				className="tw-border-none tw-bg-transparent tw-absolute tw-top-1/2 tw-right-4 tw--translate-y-1/2 tw-flex tw-items-center tw-justify-center tw-w-9 tw-h-9 tw-rounded-full hover:tw-bg-white/10 active:tw-bg-white/20 tw-transition-all tw-duration-200 tw-cursor-pointer"
				onClick={funct}
			>
				<img
					src={CloseBTN}
					alt="botão de fechar"
					className="tw-w-5 tw-h-5 tw-opacity-80 hover:tw-opacity-100 tw-transition-all tw-duration-200"
				/>
			</button>
			<span className="tw-m-[0.6em_auto] tw-font-bold">
				Chamado {id} Aberto com Sucesso!!!
			</span>
			<div
				className={`tw-w-[0.7em] tw-h-[0.7em] tw-bg-[var(--pure-white)] tw-absolute tw-bottom-0 ${cls2}`}
			></div>
		</div>
	);
}
