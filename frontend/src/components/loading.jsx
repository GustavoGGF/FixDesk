import React from "react";
import { Div } from "../styles/loadingStyle";

export default function Loading() {
  return (
    <Div className="spinner-border text-success" role="status">
      <span className="visually-hidden">Loading....</span>
    </Div>
  );
}
