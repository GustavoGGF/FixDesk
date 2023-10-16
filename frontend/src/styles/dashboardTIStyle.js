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

export const DivUpload = styled.div`
  position: relative;
  width: 400px;
  min-height: 445px;
  box-sizing: border-box;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(black, 0.2);
  padding-bottom: 20px;
  background: #fff;
  animation: fadeup 0.5s 0.5s ease both;
  transform: translateY(20px);
  opacity: 0;
  margin: 0 auto;
`;

export const HeaderFiles = styled.header`
  background: #4db6ac;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  text-align: center;
`;

export const PFiles = styled.p`
  color: #fff;
  font-size: 40px;
  margin: 0;
  padding: 50px 0;
`;

export const BodyFiles = styled.div`
  text-align: center;
  padding: 50px 0;
  padding-bottom: 30px;
`;

export const FooterFiles = styled.footer`
  width: 100%;
  margin: 0 auto;
  height: 0;
  text-align: center;
`;

export const PFiles2 = styled.p`
  font-size: 14px;
  padding-top: 15px;
  line-height: 1.4;
`;

export const B1 = styled.b`
  color: #4db6ac;
`;

export const A1 = styled.a`
  color: #4db6ac;
  cursor: pointer;
`;

export const IMGFile = styled.img`
  width: 100px;
`;

export const IMGFile2 = styled.img`
  width: 100px;
  margin-right: 50px;
`;

export const InputFiles = styled.input`
  visibility: hidden;
`;

export const Span1 = styled.span`
  font-weight: bold;
  transform: translateX(-20px);
  display: inline-block;
  margin-right: 10px;
`;

export const Span2 = styled.span`
  display: inline-block;
  font-weight: 100;
  margin-left: -8px;
  transform: translateX(-20px);
`;

export const Divider = styled.div`
  margin: 0 auto;
  width: 0;
  border-top: solid 4px darken(black, 3.5%);
  text-align: center;
  transition: width 0.5s ease;
`;

export const Span3 = styled.span`
  display: inline-block;
  transform: translateY(-25px);
  font-size: 12px;
  padding-top: 8px;
  margin-bottom: 5px;
`;

export const ListFiles = styled.div`
  width: 320px;
  margin: 0 auto;
  margin-top: 15px;
  text-align: center;
  overflow-x: hidden;
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
