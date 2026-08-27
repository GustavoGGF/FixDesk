import styled from "styled-components";

export const Div = styled.div`
  height: 100vh !important;
  width: 100vw;
  position: absolute;
  overflow-x: hidden !important;
  -webkit-overflow-scrolling: touch; /* Melhora a rolagem em dispositivos móveis WebKit */
`;

export const TicketOpen = styled.div`
  background: #f9f9f9;
  width: 80%;
  height: 90%;
  position: relative;
  border-radius: 20px;
  -webkit-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Adiciona uma sombra suave em navegadores WebKit */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

export const IMGConfig = styled.img`
  width: 32px;
`;

export const DropContent2 = styled.div`
  position: absolute;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 2;
  padding: 12px 16px;
  width: 13em;
  justify-content: center;
  display: flex;
  flex-direction: column;
  background: transparent;
  border-radius: 10px;
  align-items: center;
  background-color: rgb(249, 249, 249);
`;

export const TextObersavation = styled.textarea`
  overflow-y: auto;
  resize: none;
  background-color: #e9ecef;
  color: #212529;
  padding: 0.375rem 0.75rem;
  min-height: 3em;
  border-left: 0;
  border-right: 0;
`;
