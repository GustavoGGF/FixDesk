import styled from "styled-components";

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

export const InputFiles = styled.input`
  visibility: hidden;
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
