import styled from "styled-components";

export const Div = styled.div`
  height: 100vh;
  width: 100vw;
  position: absolute;
`;

export const IMG = styled.img`
  width: 8em;
  padding: 1em;
`;

export const Span = styled.span`
  font-weight: bold;
  font-size: 1.3em;
`;

export const H5 = styled.h5`
  color: var(--white);
  cursor: pointer;
`;

export const Notification = styled.div`
  content: "";
  width: 1em;
  height: 1em;
  background: var(--light-green);
  margin-bottom: 1em;
  border-radius: 50%;
  cursor: pointer;
  -webkit-box-shadow: 0px 0px 28px 3px rgba(175, 252, 65, 1);
  -moz-box-shadow: 0px 0px 28px 3px rgba(175, 252, 65, 1);
  box-shadow: 0px 0px 28px 3px rgba(175, 252, 65, 1);
`;

export const Div2 = styled.div`
  margin: 0.5em;
`;

export const PathNotes = styled.div`
  width: 60%;
  height: 60%;
  background-color: var(--light-white);
  padding: 1.5em;
  border-radius: 1em;
`;

export const CloseBTN = styled.button`
  margin: 1em;
`;
