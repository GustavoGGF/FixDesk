import React from "react";
import { Div, Div2, Span, Button, IMG } from "../../styles/info";
import CloseBTN from "../../images/components/close.png";

export default function Info({ id, cls, cls2, funct }) {
  return (
    <Div className={`position-fixed top-0 start-50 translate-middle-x animate__animated ${cls}`}>
      <Button className="position-absolute top-50 end-0 translate-middle-y" onClick={funct}>
        <IMG src={CloseBTN} alt="botão de fechar" />
      </Button>
      <Span>Chamado {id} Aberto com Sucesso!!!</Span>
      <Div2 className={`${cls2}`}></Div2>
    </Div>
  );
}
