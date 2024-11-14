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

export const Textarea = styled.textarea`
  height: 8em !important;
  width: 20em;
  resize: none;
  -webkit-height: 8em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 20em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
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

export const TicketOpen = styled.div`
  background-color: var(--light-white3);
  width: 80%;
  overflow: auto;
  position: relative;
  border-radius: 2em;
  padding-bottom: 2em;
  height: 90%;
  &::-webkit-scrollbar {
    width: 1em; /* largura da barra de rolagem */
  }
  &::-webkit-scrollbar-track {
    background: var(--light-white3); /* cor de fundo da track (fundo da barra de rolagem) */
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--dark-gray); /* cor do thumb (alça da barra de rolagem) */
    border-radius: 6px; /* borda do thumb */
    border: 3px solid var(--light-white3); /* borda do thumb */
  }
`;

export const DivUpload = styled.div`
  position: relative;
  box-sizing: border-box;
  border-radius: 0.5em;
  box-shadow: 0 2px 5px rgba(var(--pure-black), 0.2);
  background: var(--pure-white);
  -webkit-animation: fadeup 0.5s 0.5s ease both;
  animation: fadeup 0.5s 0.5s ease both;
  transform: translateY(2em);
  opacity: 0;
`;

export const HeaderFiles = styled.header`
  background-color: var(--ocean-green);
  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
  text-align: center;
  height: 10em;
  display: flex;
  padding: 1.2em;
  -webkit-border-top-left-radius: 0.5em;
  -webkit-border-top-right-radius: 0.5em;
`;

export const PFiles = styled.p`
  color: var(--pure-white);
  font-size: 4em;
  -webkit-font-smoothing: antialiased; /* Melhora a suavização da fonte em navegadores WebKit */
`;

export const IMGFile = styled.img`
  width: 10em;
`;

export const Span1 = styled.span`
  font-weight: bold;
  transform: translateX(-2em);
  display: inline-block;
  margin-right: 1em;
  -webkit-transform: translateX(-2em); /* Garantia de compatibilidade com WebKit */
`;

export const Span2 = styled.span`
  display: inline-block;
  font-weight: 100;
  margin-left: -0.7em;
  transform: translateX(-2em);
  -webkit-transform: translateX(-2em); /* Garantia de compatibilidade com WebKit */
`;

export const BodyFiles = styled.div`
  text-align: center;
  padding: 5em 0;
  padding-bottom: 3em;
  position: relative;
`;

export const InputFiles = styled.input`
  visibility: hidden;
`;

export const PFiles2 = styled.p`
  font-size: 1em;
  padding-top: 1em;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased; /* Melhora a suavização da fonte em navegadores WebKit */
`;

export const B1 = styled.b`
  color: var(--ocean-green);
  -webkit-text-fill-color: var(--ocean-green); /* Garante a cor do texto em navegadores WebKit */
`;

export const IMGFile2 = styled.img`
  width: 1.5em;
  margin-right: 1em;
`;

export const FooterFiles = styled.footer`
  margin-bottom: 1em;
  text-align: center;
`;

export const Divider = styled.div`
  margin: 0 auto;
  width: 0;
  border-top: solid 4px darken(var(--pure-black), 3.5%);
  text-align: center;
  transition: width 0.5s ease;
  -webkit-transition: width 0.5s ease; /* Garante transição suave em navegadores WebKit */
`;

export const Span3 = styled.span`
  display: inline-block;
  transform: translateY(-25px);
  -webkit-transform: translateY(-25px); /* Garantia de compatibilidade com WebKit */
  font-size: 12px;
  padding-top: 8px;
  margin-bottom: 5px;
`;

export const ListFiles = styled.div`
  width: 320px;
  margin: 0 auto;
  margin-top: 15px;
  text-align: center;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch; /* Melhora a rolagem em dispositivos móveis WebKit */
`;

export const IMGClose = styled.img`
  margin: 1em;
  width: 2em;
  height: 2em;
  cursor: pointer;
  -webkit-transition: transform 0.3s ease; /* Transição suave para efeitos de transformação */
  transition: transform 0.3s ease;
`;
