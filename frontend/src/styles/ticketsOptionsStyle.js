import styled from "styled-components";

export const Select = styled.select`
  width: 20em;
  ${(props) => props.required}
  -webkit-width: 20em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Contract = styled.div`
  height: 80%;
  width: 80%;
  z-index: 1000;
  margin: 0 auto; /* Adicionado para centralizar o contêiner */
  position: relative; /* Adicionado para permitir o posicionamento absoluto dos elementos filhos */
`;

export const DivMachine = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 1em;
  background-color: lightsalmon;
  cursor: pointer;
  border-radius: 1em;
  transition: ease-in 0.4s;
  margin: 1em;
  &:hover {
    transform: scale(1.13);
  }
`;

export const ImgMachines = styled.img`
  width: 14em;
  margin: 0 auto;
`;
