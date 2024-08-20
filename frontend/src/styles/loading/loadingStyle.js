import styled from "styled-components";

export const Loader = styled.div`
  perspective: 600px;
  width: 100px;
  height: 100px;
  -webkit-perspective: 600px; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;

export const Cube = styled.div`
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: rotate 4s linear infinite;
  -webkit-animation: rotate 4s linear infinite; /* Adicionado para compatibilidade com navegadores baseados em WebKit */
`;
