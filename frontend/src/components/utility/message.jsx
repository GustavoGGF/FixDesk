import { useContext } from "react";
import { MessageContext } from "../../context/MessageContext";
import CloseBTN from "../../images/components/close.png";

/**
 * Componente responsável por exibir mensagens na aplicação.
 * @param {object} props - Propriedades do componente.
 * @param {function} props.CloseMessage - Função de callback para fechar a mensagem.
 */
export default function Message({ CloseMessage }) {
	const { typeError, messageError } = useContext(MessageContext);
	return (
		<div className="tw-w-[300px] tw-mx-auto tw-select-none !tw-z-[100000] tw-relative tw-flex tw-flex-col tw-bg-white tw-border tw-border-red-600 tw-rounded tw-mb-3 tw-mt-5">
			<button
				type="button"
				className="tw-border-none tw-bg-transparent tw-absolute tw-top-0 tw-right-0 tw-mt-1"
				onClick={CloseMessage}
			>
				<img
					className="tw-w-[30px] tw-h-[30px] tw-m-[2px]"
					src={CloseBTN}
					alt=""
				/>
			</button>
			<div className="tw-font-extrabold tw-uppercase tw-text-center tw-py-2 tw-px-4 tw-bg-gray-50 tw-border-b tw-border-solid tw-border-red-600/20">
				error
			</div>
			<div className="tw-flex-auto tw-p-4 tw-text-red-600">
				<h5 className="tw-mb-2 tw-text-lg tw-font-medium tw-text-center">
					{typeError.current}
				</h5>
				<p className="tw-mb-0 tw-text-center">{messageError.current}</p>
			</div>
		</div>
	);
}
