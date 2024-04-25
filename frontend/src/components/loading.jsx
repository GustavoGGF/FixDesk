import React from "react";
import { Loader, Cube } from "../styles/loading/loadingStyle";
import "../styles/loading/loading.css";

export default function Loading() {
  return (
    <Loader>
      <Cube>
        <div class="face"></div>
        <div class="face"></div>
        <div class="face"></div>
        <div class="face"></div>
        <div class="face"></div>
        <div class="face"></div>
      </Cube>
    </Loader>
  );
}
