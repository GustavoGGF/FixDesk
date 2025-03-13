import React from "react";
import "../../styles/loadingChat.css";

export default function LoadingChat() {
  return (
    <div className="typewriter position-absolute top-50 start-50 translate-middle">
      <div className="slide">
        <i></i>
      </div>
      <div className="paper"></div>
      <div className="keyboard"></div>
    </div>
  );
}
