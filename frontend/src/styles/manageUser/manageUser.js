import styled from "styled-components";

export const DivConfigUsers = styled.div`
  width: 60%;
  height: 80%;
  border-radius: 1em;
`;

export const DivTable = styled.div`
  overflow-y: auto;
  max-height: 34em;
`;

export const TDButtonOptions = styled.td`
  width: 12em;
  height: 6em;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  border-radius: 0.5em;
  cursor: auto;
  padding: 1em;
`;

export const TD = styled.td`
  width: calc(
    100% / 2
  ); /* Dividir a largura total igualmente entre 6 colunas */
  text-align: center;
  padding: 10px; /* Ajuste conforme necessário */
`;

export const TH = styled.th`
  width: calc(
    100% / 2
  ); /* Dividir a largura total igualmente entre 6 colunas */
  border: 1px solid black;
  text-align: center;
  padding: 10px; /* Ajuste conforme necessário */
`;
