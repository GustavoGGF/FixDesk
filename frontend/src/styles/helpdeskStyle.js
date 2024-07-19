/* eslint-disable no-unused-vars */
import styled from "styled-components";
import lugrasimo from "../styles/fonts/Lugrasimo-Regular.ttf";

export const Div = styled.div`
  height: 100vh !important;
  width: 100vw;
  position: absolute;
  overflow-x: hidden !important;
`;

export const Div2 = styled.div`
  height: 100px;
`;

export const Form = styled.form`
  width: 80%;
  min-height: 80%;
  background: var(--light-white2);
  border-radius: 1em;
  margin-top: 2em;
  margin-bottom: 2em;
  padding: 1em;
`;

export const Input = styled.input`
  width: 20em;
`;

export const Select = styled.select`
  width: 20em;
  ${(props) => props.required}
`;

export const Input2 = styled.input`
  height: 2em;
  margin-left: 10em;
`;

export const Calendar = styled.div`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

export const Textarea = styled.textarea`
  height: 8em !important;
  width: 20em;
  resize: none;
`;

export const ImageEquip = styled.img`
  width: 12em;
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
  }
`;

export const InputRadio = styled.input`
  margin-right: 3em;
`;

export const DivNameFile = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const PNameFile = styled.div`
  margin-right: 1em;
`;

export const BtnFile = styled.button`
  border: none;
  background: transparent;
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
`;

export const TitlePage = styled.h2`
  font-size: 2.3em;
  font-weight: bold;
  font-family: "Lugrasimo", cursive;
`;

export const Contract = styled.div`
  height: 80%;
  width: 80%;
  z-index: 1000;
`;
