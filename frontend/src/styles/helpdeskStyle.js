/* eslint-disable no-unused-vars */
import styled from "styled-components";
import lugrasimo from "../styles/fonts/Lugrasimo-Regular.ttf";

export const Div = styled.div`
  height: 100vh !important;
  width: 100vw;
  position: absolute;
  overflow-x: hidden !important;
  -webkit-height: 100vh !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 100vw; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-position: absolute; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-overflow-x: hidden !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Div2 = styled.div`
  height: 100px;
  -webkit-height: 100px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Form = styled.form`
  width: 80%;
  min-height: 80%;
  background: var(--light-white2);
  border-radius: 1em;
  margin-top: 2em;
  margin-bottom: 2em;
  padding: 1em;
  -webkit-width: 80%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-min-height: 80%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background: var(--light-white2); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border-radius: 1em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-top: 2em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-bottom: 2em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-padding: 1em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Input = styled.input`
  width: 20em;
  -webkit-width: 20em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Select = styled.select`
  width: 20em;
  ${(props) => props.required}
  -webkit-width: 20em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Input2 = styled.input`
  height: 2em;
  margin-left: 10em;
  -webkit-height: 2em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-left: 10em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Calendar = styled.div`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  -webkit-width: 100%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 100%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-align-items: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-justify-content: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Textarea = styled.textarea`
  height: 8em !important;
  width: 20em;
  resize: none;
  -webkit-height: 8em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 20em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const ImageEquip = styled.img`
  width: 12em;
  -webkit-width: 12em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
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

export const InputRadio = styled.input`
  margin-right: 3em;
  -webkit-margin-right: 3em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivNameFile = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  -webkit-justify-content: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-align-items: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const PNameFile = styled.div`
  margin-right: 1em;
  -webkit-margin-right: 1em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const BtnFile = styled.button`
  border: none;
  background: transparent;
  -webkit-border: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const ImgFile = styled.img`
  width: 2.2em;
`;

export const InputFile = styled.input`
  opacity: 0;
  z-index: 10 !important;
  top: 0;
  left: 0;
  cursor: pointer;
  position: absolute; /* Adicionado para garantir o posicionamento */
  width: 100%; /* Adicionado para ocupar toda a largura do contêiner pai */
  height: 100%; /* Adicionado para ocupar toda a altura do contêiner pai */
`;

export const TitlePage = styled.h2`
  font-size: 2.3em;
  font-weight: bold;
  font-family: "Lugrasimo", cursive;
  text-align: center; /* Adicionado para centralizar o texto */
  color: var(--pure-black); /* Adicionado para garantir a cor do texto */
`;

export const Contract = styled.div`
  height: 80%;
  width: 80%;
  z-index: 1000;
  margin: 0 auto; /* Adicionado para centralizar o contêiner */
  position: relative; /* Adicionado para permitir o posicionamento absoluto dos elementos filhos */
`;
