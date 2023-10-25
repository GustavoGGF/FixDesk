import styled from "styled-components";
import Seeting from "../images/components/definicoes.png";

export const Div = styled.div`
  height: 100vh !important;
  width: 100vw;
  background: #201b2c;
  position: absolute;
  overflow-x: hidden !important;
`;

export const DivDashPie = styled.div`
  height: 350px !important;
  width: 100% !important;
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

export const TicketOpen = styled.div`
  background: #f9f9f9;
  width: 80%;
  height: 90%;
  position: relative;
  border-radius: 20px;
`;

export const DropdownConten = styled.div`
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-top-right-radius: 10px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  text-align: center;
  background-color: rgb(52, 152, 219);
  color: #f9f9f9;
  padding: 5px;
`;

export const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownButton = styled.div`
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
  cursor: pointer;
  background-image: url(${Seeting});
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  width: 50px !important;
  height: 50px !important;
`;

export const DivDrop = styled.div`
  margin: 10px;
  margin-top: 100px;
`;

export const P1 = styled.p`
  margin-top: 10px;
  cursor: pointer;
  user-select: none;
`;

export const A1 = styled.a`
  color: #4db6ac;
  cursor: pointer;
`;

export const ImportBTN = styled.button`
  width: 125px;
  outline: none;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  margin: auto;
  border: solid 1px black;
  color: black;
  background: transparent;
  padding: 8px 15px;
  font-size: 12px;
  border-radius: 4px;
  font-family: Roboto;
  line-height: 1;
  cursor: pointer;
  transform: translateY(15px);
  opacity: 0;
  visibility: hidden;
  margin-left: calc(50% - 40px);
`;

export const DivFilter = styled.div`
  margin: 50px auto;
  width: 90% !important;
  display: flex;
  background: #fff;
  justify-content: space-around;
  flex-wrap: wrap;
  border-radius: 20px;
  padding: 20px;
`;

export const Input1 = styled.input`
  min-width: 200px;
  margin: 10px;
`;

export const Select1 = styled.select`
  max-width: 200px;
  margin: 10px;
`;

export const DivContainerImages = styled.div`
  height: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px dashed #adb5bd;
  position: relative;
`;

export const DivImages = styled.div`
  min-height: 100%;
  width: 100%;
  margin: 10px;
`;

export const IMGS1 = styled.img`
  height: 30px;
  width: 30px;
  cursor: pointer;
`;
