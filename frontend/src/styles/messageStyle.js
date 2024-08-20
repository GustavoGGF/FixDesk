import styled from "styled-components";

export const Div = styled.div`
  width: 300px;
  margin: 0 auto;
  user-select: none;
  z-index: 100000 !important;
  -webkit-width: 300px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin: 0 auto; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-user-select: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-z-index: 100000 !important; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Button = styled.button`
  border: none;
  background: transparent;
  -webkit-border: none; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-background: transparent; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const IMG = styled.img`
  width: 30px;
  height: 30px;
  margin: 2px;
  -webkit-width: 30px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-height: 30px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
  -webkit-margin: 2px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;
