import styled from "styled-components";

export const Div1 = styled.div`
  margin-right: 1em;
`;

export const Logout = styled.a`
  cursor: pointer;
  background-color: #bb2d3b;
`;

export const Img = styled.img`
  width: 3em;
  height: 3em;
`;

export const ALink = styled.a`
  font-weight: bold;
  color: var(--light-white3);
  font-size: 1.4em;
`;

export const SpanUser = styled.span`
  font-weight: bold;
  color: var(--light-white3);
`;

export const BtnClose = styled.button`
  border: none;
  background: transparent;
`;

export const CLose = styled.img`
  width: 2em;
`;

export const H5 = styled.h5`
  font-weight: bold;
  color: var(--light-white3);
`;

export const DropDown = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
  text-align: center;
`;

export const DropBTN = styled.button`
  background-color: transparent;
  color: var(--bs-nav-link-color);
  padding: 16px;
  font-size: 16px;
  border: none;
  width: 100%;
  justify-content: center;
  align-items: baseline;
  display: flex;
`;

export const DropContent = styled.div`
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  padding: 12px 16px;
  width: 100%;
  justify-content: center;
  display: flex;
  flex-direction: column;
  background: transparent;
  border-radius: 10px;
  align-items: center;
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
`;

export const Arrow = styled.img`
  margin-left: 10px;
`;
