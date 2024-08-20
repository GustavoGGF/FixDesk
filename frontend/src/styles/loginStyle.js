import styled from "styled-components";

export const Div = styled.div`
  height: 100vh;
  width: 100vw;
  position: absolute;
  -webkit-height: 100vh; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-width: 100vw; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-position: absolute; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const IMG = styled.img`
  width: 8em;
  padding: 1em;
  -webkit-width: 8em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-padding: 1em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Span = styled.span`
  font-weight: bold;
  font-size: 1.3em;
  -webkit-font-weight: bold; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-font-size: 1.3em; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;
