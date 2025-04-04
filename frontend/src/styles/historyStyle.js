import styled from "styled-components";

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

export const DivCard = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  cursor: pointer;
  transition: 0.7s;
  justify-content: space-around;
  width: 250px;
  height: 300px;
  margin-bottom: 30px;
  border-radius: 10px;
  padding: 5px;
  margin: 10px;
  -webkit-display: flex; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-flex-wrap: nowrap; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-flex-direction: column; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-cursor: pointer; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-transition: 0.7s; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-justify-content: space-around; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 250px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 300px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-bottom: 30px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border-radius: 10px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-padding: 5px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin: 10px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const H5Card = styled.h5`
  text-align: center;
  text-transform: uppercase;
  color: var(--pure-black);
  -webkit-text-align: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-text-transform: uppercase; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-color: var(
    --pure-black
  ); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const SpanCard = styled.span`
  margin-top: 15px;
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  color: var(--pure-black);
  -webkit-margin-top: 15px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-text-align: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-text-transform: uppercase; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-font-weight: bold; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-color: var(
    --pure-black
  ); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivList = styled.div`
  display: flex;
  cursor: pointer;
  transition: 0.7s;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
  margin-bottom: 10px;
  -webkit-display: flex; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-cursor: pointer; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-transition: 0.7s; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-justify-content: space-between; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 100%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-padding: 20px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-bottom: 10px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  &:hover {
    transform: scale(1.03);
    -webkit-transform: scale(
      1.03
    ); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  }
`;

export const SpanList = styled.span`
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  color: var(--pure-black);
  -webkit-text-align: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-text-transform: uppercase; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-font-weight: bold; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-color: var(
    --pure-black
  ); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const TR = styled.tr`
  cursor: pointer;
  transition: 0.7s;
  -webkit-transition: 0.7s; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const TRSPACE = styled.tr`
  width: 100%;
  height: 0.8em;
  background-color: transparent;
  -webkit-background-color: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  -webkit-border-collapse: collapse; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const TH = styled.th`
  width: calc(
    100% / 6
  ); /* Dividir a largura total igualmente entre 6 colunas */
  border: 1px solid black;
  text-align: center;
  padding: 10px; /* Ajuste conforme necessário */
`;

export const TD = styled.td`
  width: calc(
    100% / 6
  ); /* Dividir a largura total igualmente entre 6 colunas */
  text-align: center;
  padding: 10px; /* Ajuste conforme necessário */
`;

export const DivZ = styled.div`
  z-index: 12 !important;
`;
