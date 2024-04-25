import styled from "styled-components";

export const Loader = styled.div`
  perspective: 600px;
  width: 100px;
  height: 100px;
`;

export const Cube = styled.div`
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: rotate 4s linear infinite;
`;
