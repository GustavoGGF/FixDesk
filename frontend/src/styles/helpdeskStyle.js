import styled from "styled-components";

export const Div = styled.div`
  height: 100vh !important;
  width: 100vw;
  background: #201b2c;
  position: absolute;
  overflow-x: hidden !important;
`;

export const Div2 = styled.div`
  height: 100px;
`;

export const Form = styled.form`
  width: 80%;
  min-height: 80%;
  background: #f1faee;
  border-radius: 10px;
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 10px;
`;

export const Input = styled.input`
  width: 300px;
`;

export const Select = styled.select`
  width: 300px;
  ${(props) => props.required}
`;

export const Input2 = styled.input`
  height: 25px;
  margin-left: 10px;
`;

export const Calendar = styled.div`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

export const Textarea = styled.textarea`
  height: 100px !important;
  width: 300px;
  resize: none;
`;

export const Notification = styled.div`
  width: 350px;
  height: 150px;
  margin-top: 20px;
  background: #fee440;
  border-radius: 10px;
`;

export const ImageEquip = styled.img`
  width: 250px;
`;

export const DivEquip = styled.div`
  margin: 10px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  padding: 10px;
  text-align: center;
  &:hover {
    border: dashed 1px black;
  }
`;
