import styled from "styled-components";
import SubmitIMG from "../../images/components/enviar.png";
import SubmitFile from "../../images/components/clipe-de-papel.png";

export const TicketOpen = styled.div`
  background: var(--pure-white);
  width: 80%;
  border-radius: 1.2em;
  overflow-y: auto;
  z-index: 10 !important;
  max-height: 95%;
  -webkit-background: var(
    --pure-white
  ); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 80%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border-radius: 1.2em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-overflow-y: auto; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-z-index: 10 !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-max-height: 95%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const BtnNF = styled.button`
  background-color: transparent;
  cursor: pointer;
  border: none;
  -webkit-background-color: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-cursor: pointer; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const IMGConfig = styled.img`
  width: 32px;
`;

export const DropContent2 = styled.div`
  position: absolute;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 2;
  padding: 12px 16px;
  width: 100%;
  justify-content: center;
  display: flex;
  flex-direction: column;
  background: transparent;
  border-radius: 10px;
  align-items: center;
  background-color: rgb(249, 249, 249);
`;

export const CloseBTN = styled.button`
  width: 2em;
  border: none;
  background-color: transparent;
  margin-right: 2em;
  -webkit-width: 2em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-color: transparent;
  -webkit-margin-right: 1.5em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const TextObersavation = styled.textarea`
  overflow-y: auto;
  resize: none;
  background-color: #e9ecef;
  color: #212529;
  padding: 0.375rem 0.75rem;
  height: 7em !important;
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
  -webkit-grid-template-columns: repeat(
    auto-fill,
    minmax(200px, 1fr)
  ); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-gap: 20px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
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

export const InputFile = styled.input`
  opacity: 0;
  z-index: 10 !important;
  -webkit-opacity: 0; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-z-index: 10 !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
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
  -webkit-background: rgba(
    52,
    58,
    64,
    0.7
  ); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-padding: 10px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border-radius: 20px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const ImgBTNCls = styled.img`
  width: 30px;
  height: 30px;
  -webkit-width: 30px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 30px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
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

export const DivHR = styled.div`
  height: 3px;
  width: 90%;
  background-color: #495057;
  -webkit-height: 3px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 90%; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-color: #495057; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivDetaisl = styled.div`
  z-index: 1000 !important;
  width: 30%;
  height: 70%;
  background-color: var(--white);
  border-radius: 3%;
  padding: 0.3em;
  display: flex;
  flex-direction: column;
`;

export const ButtonDet = styled.button`
  border: none;
  background-color: transparent;
`;

export const DivChatDetails = styled.div`
  display: flex;
  width: 100%;
  padding: 0.3em;
`;

export const ImgSend = styled.img`
  width: 2em;
  cursor: pointer;
`;

export const DivImageOpen = styled.div`
  z-index: 10000 !important;
  background-color: transparent;
  -webkit-z-index: 10000 !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background-color: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const BtnOpen = styled.button`
  background: transparent;
  border: none;
  margin: 0.2em;
  -webkit-background: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin: 0.2em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const ImageOpen = styled.img`
  max-width: 70% !important;
`;

export const DivChat = styled.div`
  background-color: var(--light-white2);
  height: 16em;
  border: 2px solid var(--light-blue);
  margin: 0 auto;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-background-color: var(
    --light-white2
  ); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 16em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border: 2px solid var(--light-blue); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin: 0 auto; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-overflow-y: scroll; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-overflow-x: hidden; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  position: relative;
`;

export const Close = styled.img`
  width: 1.8em;
  -webkit-width: 1.8em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const PNWFile = styled.p`
  font-size: 1.4em;
  color: var(--cultured);
  -webkit-font-size: 1.4em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-color: var(
    --cultured
  ); /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivOnBoardFile = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  -webkit-display: flex; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-justify-content: center; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-flex-direction: column; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const IMGFiles = styled.img`
  width: 4em;
  height: 4em;
  border-radius: 0.4em;
  transition: 0.7s;
  &:hover {
    transform: scale(1.2);
  }
  margin: 0 auto;
  cursor: pointer !important;
  -webkit-width: 4em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 4em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-border-radius: 0.4em;
  -webkit-transition: 0.7s; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin: 0 auto; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-cursor: pointer !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const ImageFile = styled.img`
  width: 25px;
  cursor: pointer;
  -webkit-width: 25px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-cursor: pointer; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const PChatHourL = styled.div`
  font-size: 0.7em;
  margin-left: 1em;
  -webkit-font-size: 0.7em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-left: 1em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const PChatHourR = styled.div`
  font-size: 0.7em;
  margin-right: 1em;
  -webkit-font-size: 0.7em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin-right: 1em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const DivColorGray = styled.div`
  background-color: #e9ecef;
`;
