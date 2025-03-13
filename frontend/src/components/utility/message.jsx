/**
 * Importação interna necessária para este componente.
 * - React: permite a criação e manipulação de componentes React.
 */
import React, { useContext } from "react";

/**
 * Importações de elementos DOM e imagem necessárias para este componente.
 * - Div, IMG, Button: importações de elementos DOM do módulo "../styles/messageStyle".
 * - CloseBTN: importação da imagem "close.png" localizada em "../images/components".
 */
import { Div, IMG, Button } from "../../styles/messageStyle";
import CloseBTN from "../../images/components/close.png";
import { MessageContext } from "../../context/MessageContext";

/**
 * Componente responsável por exibir mensagens na aplicação.
 * @param {string} TypeError - Tipo de erro ocorrido.
 * @param {string} MessageError - Mensagem de erro a ser exibida.
 * @param {function} CloseMessage - Função de callback para fechar a mensagem.
 */
export default function Message({ CloseMessage }) {
  const { typeError, messageError } = useContext(MessageContext);
  return (
    <Div className="card border-danger mb-3 position-relative">
      <Button className="position-absolute top-0 end-0 mt-1" onClick={CloseMessage}>
        <IMG src={CloseBTN} alt="" />
      </Button>
      <div className="fw-bolder text-uppercase text-center card-header">error</div>
      <div className="card-body text-danger">
        <h5 className="card-title text-center">{typeError}</h5>
        <p className="card-text text-center">{messageError}</p>
      </div>
    </Div>
  );
}
