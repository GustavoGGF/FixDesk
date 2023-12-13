import styled from "styled-components";

export const TicketOpen = styled.div`
  background: #f9f9f9;
  width: 80%;
  height: 90%;
  position: relative;
  border-radius: 20px;
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
  -webkit-animation: fadeup 0.5s 0.5s ease both;
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

export const IMGFile = styled.img`
  width: 100px;
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

export const BodyFiles = styled.div`
  text-align: center;
  padding: 50px 0;
  padding-bottom: 30px;
`;

export const PFiles2 = styled.p`
  font-size: 14px;
  padding-top: 15px;
  line-height: 1.4;
`;

export const B1 = styled.b`
  color: #4db6ac;
`;

export const InputFiles = styled.input`
  visibility: hidden;
`;

export const IMGFile2 = styled.img`
  width: 100px;
  margin-right: 50px;
`;

export const FooterFiles = styled.footer`
  width: 100%;
  margin: 0 auto;
  height: 0;
  text-align: center;
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

export const IMGClose = styled.img`
  margin: 10px;
  width: 30px;
  height: 30px;
  cursor: pointer;
`;
