import styled from "styled-components";

export const Select = styled.select`
  width: 20em;
  ${(props) => props.required}
  -webkit-width: 20em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivEquip = styled.div`
  margin: 1em;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  padding: 1em;
  text-align: center;
  &:hover {
    border: dashed 0.1em black;
    -webkit-border: dashed 0.1em black; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  }
`;

export const ImageEquip = styled.img`
  width: 12em;
  -webkit-width: 12em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Contract = styled.div`
  height: 80%;
  width: 80%;
  z-index: 1000;
  margin: 0 auto; /* Adicionado para centralizar o contêiner */
  position: relative; /* Adicionado para permitir o posicionamento absoluto dos elementos filhos */
`;
