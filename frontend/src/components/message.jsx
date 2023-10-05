import React from "react";
import { Div, IMG, Button } from "../styles/messageStyle";
import CloseBTN from "../images/components/close.png";

export default function Message({ TypeError, MessageError, CloseMessage }) {
  return (
    <Div className="card border-danger mb-3 position-relative">
      <Button
        className="position-absolute top-0 end-0 mt-1"
        onClick={CloseMessage}
      >
        <IMG src={CloseBTN} alt="" />
      </Button>
      <div className="fw-bolder text-uppercase text-center card-header">
        error
      </div>
      <div className="card-body text-danger">
        <h5 className="card-title text-center">{TypeError}</h5>
        <p className="card-text text-center">{MessageError}</p>
      </div>
    </Div>
  );
}
