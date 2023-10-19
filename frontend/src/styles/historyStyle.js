import styled from "styled-components";
import SubmitIMG from "../images/components/enviar.png";

export const Div = styled.div`
  height: 100vh !important;
  width: 100vw;
  background: #201b2c;
  position: absolute;
  overflow-x: hidden !important;
`;

export const TicketOpen = styled.div`
  background: #f9f9f9;
  width: 80%;
  position: relative;
  border-radius: 20px;
`;

export const CloseBTN = styled.button`
  width: 30px;
  height: 30px;
  cursor: pointer;
  border: none;
  margin: 10px;
  position: absolute;
  background: #f9f9f9;
`;

export const Close = styled.img`
  width: 30px;
  height: 30px;
  background: #f9f9f9;
`;

export const DivChat = styled.div`
  background: #f1faee;
  height: 250px;
  border: 2px solid #03c9f5;
  margin: 0 auto;
  overflow-y: scroll;
  overflow-x: hidden;
`;

export const BtnChat = styled.button`
  height: 60px;
  width: 60px;
  background-image: url(${SubmitIMG});
  background-position: center;
  background-size: cover;
`;
