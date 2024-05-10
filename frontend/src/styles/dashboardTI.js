import styled from "styled-components";
import Seeting from "../images/components/definicoes.png";

export const Div = styled.div`
  height: 100vh !important;
  width: 100vw;
  position: absolute;
  overflow-x: hidden !important;
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
  margin: 0 auto;
  width: 90% !important;
  display: flex;
  background: #fff;
  justify-content: space-around;
  flex-wrap: wrap;
  border-radius: 20px;
  padding: 20px;
  margin-top: 150px;
`;

export const DropBTN = styled.button`
  background-color: transparent;
  padding: 16px;
  font-size: 16px;
  border: none;
  justify-content: center;
  align-items: baseline;
  display: flex;
  color: black;
`;

export const IMGConfig = styled.img`
  width: 32px;
`;

export const DropContent2 = styled.div`
  position: absolute;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 2;
  padding: 12px 16px;
  width: 100%;
  justify-content: center;
  display: flex;
  flex-direction: column;
  background: transparent;
  border-radius: 10px;
  align-items: center;
  background-color: rgb(249, 249, 249);
`;

export const DivModify = styled.div`
  height: 70%;
  width: 70%;
  z-index: 10 !important;
  background: #f9f9f9;
  border-radius: 20px;
  border: 4px solid #ef3c3c;
`;

export const InputTicket = styled.input`
  width: 50%;
`;

export const ZIndex = styled.div`
  z-index: 100000 !important;
`;

export const DivDetaisl = styled.div`
  z-index: 1000 !important;
  width: 30%;
  height: 70%;
  background-color: var(--white);
  border-radius: 3%;
  padding: 0.3em;
  display: flex;
  flex-direction: column;
`;

export const DivChatDetails = styled.div`
  display: flex;
  width: 100%;
  padding: 0.3em;
`;

export const ImgSend = styled.img`
  width: 2em;
  cursor: pointer;
`;

export const TextObersavation = styled.textarea`
  height: auto;
  min-height: 0;
  overflow-y: hidden;
  resize: none;
  background-color: #e9ecef;
  color: #212529;
  padding: 0.375rem 0.75rem;
`;
