import styled from "styled-components";
import SubmitIMG from "../images/components/enviar.png";
import SubmitFile from "../images/components/clipe-de-papel.png";

export const Div = styled.div`
  height: 100vh !important;
  width: 100vw;
  position: absolute;
  overflow-x: hidden !important;
`;

export const TicketOpen = styled.div`
  background: rgb(249, 249, 249);
  width: 80%;
  border-radius: 1.2em;
  overflow-y: auto;
  z-index: 10 !important;
  max-height: 95%;
  position: relative;
`;

export const CloseBTN = styled.button`
  width: 2em;
  border: none;
  position: absolute;
  background-color: var(--light-white3);
  margin-right: 1.5em;
  margin-top: 0.5em;
`;

export const Close = styled.img`
  width: 2.3em;
`;

export const DivChat = styled.div`
  background-color: var(--light-white2);
  height: 16em;
  border: 2px solid var(--light-blue);
  margin: 0 auto;
  overflow-y: scroll;
  overflow-x: hidden;
`;

export const BtnChat = styled.button`
  width: 2.5em;
  height: 2.5em;
  background-image: url(${SubmitIMG});
  background-position: center;
  background-size: cover;
`;

export const BtnChat2 = styled.button`
  width: 2.5em;
  height: 2.5em;
  background-image: url(${SubmitFile});
  background-position: center;
  background-size: cover;
  position: relative;
`;

export const IMGFiles = styled.img`
  width: 4em;
  height: 4em;
  border: 5px;
  transition: 0.7s;
  &:hover {
    transform: scale(1.2);
  }
`;

export const InputFile = styled.input`
  opacity: 0;
  z-index: 10 !important;
`;

export const DivImageOpen = styled.div`
  z-index: 10000 !important;
  background-color: var(--light-white3);
`;

export const ImageOpen = styled.img`
  width: 100%;
`;

export const BtnOpen = styled.button`
  background: transparent;
  border: none;
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

export const DivINp = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

export const DivFilter = styled.div`
  margin: 0 auto;
  width: 90% !important;
  display: flex;
  background: #fff;
  justify-content: space-around;
  flex-wrap: wrap;
  border-radius: 20px;
  padding: 20px;
  margin-top: 50px;
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

export const PSelectView = styled.p`
  font-size: 0.6em;
`;

export const PQuantity = styled.p`
  font-size: 0.8em;
  margin: 0 auto;
`;

export const DivSelectView = styled.div`
  position: relative;
  border: 1px dashed #adb5bd;
  height: 100%;
  padding: 5px;
  border-radius: 2px;
`;

export const DivCard = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: column;
  cursor: pointer;
  transition: 1.5s;
  justify-content: space-around;
  width: 250px;
  height: 300px;
  margin-bottom: 30px;
  border-radius: 10px;
  padding: 5px;
  margin: 10px;
  transition: 0.7s;
  &:hover {
    transform: scale(1.1);
  }
`;

export const H5Card = styled.h5`
  text-align: center;
  text-transform: uppercase;
  color: black;
`;

export const SpanCard = styled.span`
  margin-top: 15px;
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  color: black;
`;

export const DivList = styled.div`
  display: flex;
  cursor: pointer;
  transition: 1s;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
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
  color: black;
`;

export const ImgSelectView = styled.img`
  width: 30px;
`;

export const Button1 = styled.button`
  margin-right: 10px;
`;

export const Button2 = styled.button`
  margin-left: 10px;
`;

export const DivFile = styled.div`
  padding-left: 15px;
  padding-right: 15px;
  padding-top: 7px;
  padding-bottom: 7px;
  display: flex;
`;

export const ImageFile = styled.img`
  width: 25px;
  cursor: pointer;
`;

export const DivOnBoardFile = styled.div`
  margin-left: 10px;
  margin-right: 10px;
`;

export const DivNewFiles = styled.div`
  z-index: 10;
  height: 300px;
  width: 300px;
  background: rgba(52, 58, 64, 0.7);
  padding: 10px;
  border-radius: 20px;
`;

export const DivHR = styled.div`
  height: 3px;
  width: 90%;
  background-color: #495057;
`;

export const PNWFile = styled.p`
  font-size: 1.4em;
  color: #f8f9fa;
`;

export const AdjustListFiles = styled.div`
  justify-content: start;
  min-height: 70%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
`;

export const ImgBTNCls = styled.img`
  width: 30px;
  height: 30px;
`;

export const BtnNF = styled.button`
  background-color: transparent;
  cursor: pointer;
  border: none;
`;

export const PBloq = styled.p`
  margin: 10px;
`;

export const DivCal = styled.div`
  display: flex;
  justify-content: center;
`;
