import styled from "styled-components";
import SubmitIMG from "../images/components/enviar.png";
import SubmitFile from "../images/components/clipe-de-papel.png";

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

export const TicketOpen = styled.div`
  background: var(--pure-white);
  width: 80%;
  border-radius: 1.2em;
  overflow-y: auto;
  z-index: 10 !important;
  max-height: 95%;
  position: relative;
  -webkit-background: var(--pure-white); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 80%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border-radius: 1.2em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-overflow-y: auto; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-z-index: 10 !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-max-height: 95%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-position: relative; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const CloseBTN = styled.button`
  width: 2em;
  border: none;
  position: absolute;
  background-color: transparent;
  margin-right: 1.5em;
  margin-top: 0.5em;
  -webkit-width: 2em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-position: absolute; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-color: transparent;
  -webkit-margin-right: 1.5em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-top: 0.5em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Close = styled.img`
  width: 2.3em;
  -webkit-width: 2.3em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivChat = styled.div`
  background-color: var(--light-white2);
  height: 16em;
  border: 2px solid var(--light-blue);
  margin: 0 auto;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-background-color: var(--light-white2); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 16em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: 2px solid var(--light-blue); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin: 0 auto; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-overflow-y: scroll; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-overflow-x: hidden; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  position: relative;
`;

export const BtnChat = styled.button`
  width: 2.5em;
  height: 2.5em;
  background-image: url(${SubmitIMG});
  background-position: center;
  background-size: cover;
  -webkit-width: 2.5em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 2.5em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-image: url(${SubmitIMG}); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-position: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-size: cover; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const BtnChat2 = styled.button`
  width: 2.5em;
  height: 2.5em;
  background-image: url(${SubmitFile});
  background-position: center;
  background-size: cover;
  position: relative;
  background-color: transparent;
  border: none;
  -webkit-width: 2.5em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 2.5em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-image: url(${SubmitFile}); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-position: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-size: cover; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-position: relative; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-color: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const IMGFiles = styled.img`
  width: 4em;
  height: 4em;
  border: 5px solid; /* Adicionado o estilo de borda completo */
  transition: 0.7s;
  &:hover {
    transform: scale(1.2);
  }
  margin: 0 auto;
  cursor: pointer !important;
  -webkit-width: 4em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 4em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: 5px solid; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-transition: 0.7s; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin: 0 auto; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-cursor: pointer !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const InputFile = styled.input`
  opacity: 0;
  z-index: 10 !important;
  -webkit-opacity: 0; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-z-index: 10 !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivImageOpen = styled.div`
  z-index: 10000 !important;
  background-color: transparent;
  height: 90% !important;
  -webkit-z-index: 10000 !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-color: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 90% !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const ImageOpen = styled.img`
  height: 100%;
  -webkit-height: 100%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const BtnOpen = styled.button`
  background: transparent;
  border: none;
  margin: 1em;
  -webkit-background: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin: 1em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
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
  &:hover {
    transform: scale(1.1);
    -webkit-transform: scale(1.1); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  }
`;

export const H5Card = styled.h5`
  text-align: center;
  text-transform: uppercase;
  color: var(--pure-black);
  -webkit-text-align: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-text-transform: uppercase; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-color: var(--pure-black); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
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
  -webkit-color: var(--pure-black); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
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
    -webkit-transform: scale(1.03); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
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
  -webkit-color: var(--pure-black); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivFile = styled.div`
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 7px;
  padding-bottom: 7px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  -webkit-padding-left: 15px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-padding-right: 15px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-padding-top: 7px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-padding-bottom: 7px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-display: grid; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-gap: 20px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const ImageFile = styled.img`
  width: 25px;
  cursor: pointer;
  -webkit-width: 25px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-cursor: pointer; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivOnBoardFile = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  -webkit-display: flex; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-justify-content: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-flex-direction: column; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivNewFiles = styled.div`
  z-index: 10;
  max-height: 300px;
  width: 300px;
  background: rgba(52, 58, 64, 0.7);
  padding: 10px;
  border-radius: 20px;
  -webkit-z-index: 10; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-max-height: 300px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 300px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background: rgba(52, 58, 64, 0.7); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-padding: 10px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border-radius: 20px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivHR = styled.div`
  height: 3px;
  width: 90%;
  background-color: #495057;
  -webkit-height: 3px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 90%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-color: #495057; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const PNWFile = styled.p`
  font-size: 1.4em;
  color: var(--cultured);
  -webkit-font-size: 1.4em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-color: var(--cultured); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const AdjustListFiles = styled.div`
  justify-content: start;
  min-height: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  -webkit-justify-content: start; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-min-height: 70%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-display: flex; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-flex-direction: column; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-align-items: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-overflow-y: auto; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const ImgBTNCls = styled.img`
  width: 30px;
  height: 30px;
  -webkit-width: 30px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 30px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const BtnNF = styled.button`
  background-color: transparent;
  cursor: pointer;
  border: none;
  -webkit-background-color: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-cursor: pointer; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const PChatHourR = styled.div`
  font-size: 0.7em;
  margin-right: 1em;
  -webkit-font-size: 0.7em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-right: 1em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const PChatHourL = styled.div`
  font-size: 0.7em;
  margin-left: 1em;
  -webkit-font-size: 0.7em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-left: 1em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivFlex1 = styled.div`
  display: flex;
  justify-content: end !important;
  -webkit-display: flex; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-justify-content: end; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivFlex2 = styled.div`
  display: flex;
  justify-content: start !important;
  -webkit-display: flex; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-justify-content: start; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const TR = styled.tr`
  cursor: pointer;
  transition: 0.7s;
  -webkit-transition: 0.7s; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  &:hover {
    transform: scale(1.1);
    -webkit-transform: scale(1.1); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  }
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
  width: calc(100% / 6); /* Dividir a largura total igualmente entre 6 colunas */
  border: 1px solid black;
  text-align: center;
  padding: 10px; /* Ajuste conforme necessário */
`;

export const TD = styled.td`
  width: calc(100% / 6); /* Dividir a largura total igualmente entre 6 colunas */
  text-align: center;
  padding: 10px; /* Ajuste conforme necessário */
`;
