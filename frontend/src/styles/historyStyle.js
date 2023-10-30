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
  z-index: 10 !important;
`;

export const CloseBTN = styled.button`
  width: 30px;
  height: 30px;
  cursor: pointer;
  border: none;
  position: absolute;
  background: #f9f9f9;
  margin-right: 15px;
  margin-top: 10px;
`;

export const Close = styled.img`
  width: 30px;
  height: 30px;
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

export const IMGFiles = styled.img`
  width: 60px;
  height: 60px;
  border: 5px;
  cursor: pointer;
  transition: 0.7s;
  &:hover {
    transform: scale(1.5);
  }
`;

export const DivImageOpen = styled.div`
  width: 100vh;
  z-index: 10000 !important;
`;

export const ImageOpen = styled.img`
  width: 100%;
`;

export const BtnOpen = styled.button`
  background: transparent;
  border: none;
`;

export const ImgSelectView = styled.img`
  width: 30px;
`;

export const DivSelectView = styled.div`
  position: relative;
  border: 1px dashed #adb5bd;
  height: 100%;
  padding: 5px;
  border-radius: 2px;
`;

export const PSelectView = styled.p`
  font-size: 0.6em;
`;

export const DivCard = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  cursor: pointer;
  transition: 1s;
  justify-content: space-around;
  width: 250px;
  height: 300px;
  border: 5px solid #ffc300;
  margin-bottom: 30px;
  border-radius: 10px;
  padding: 5px;
  background-color: transparent;
  margin: 10px;
  transition: 0.7s;
  &:hover {
    transform: scale(1.1);
  }
`;

export const H5Card = styled.h5`
  text-align: center;
  text-transform: uppercase;
  color: #caf0f8;
`;

export const SpanCard = styled.span`
  margin-top: 15px;
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  color: #caf0f8;
`;

export const DivList = styled.div`
  display: flex;
  cursor: pointer;
  transition: 1s;
  justify-content: space-between;
  width: 100%;
  border-top: 5px solid #ffc300;
  border-bottom: 5px solid #ffc300;
  border-left: 3px solid #ffc300;
  border-right: 3px solid #ffc300;
  padding: 20px;
  background-color: transparent;
  transition: 0.7s;
  margin-bottom: 10px;
  &:hover {
    transform: scale(1.03);
  }
`;

export const SpanList = styled.span`
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  color: #caf0f8;
`;

export const PQuantity = styled.p`
  font-size: 0.8em;
  margin: 0 auto;
`;

export const DivAlocate = styled.div`
  margin: 10px;
`;

export const IMGFiles2 = styled.img`
  width: 80px;
  height: 80px;
  border: 5px;
  cursor: pointer;
  transition: 0.7s;
  &:hover {
    transform: scale(1.5);
  }
`;

export const Calendar = styled.div`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;
