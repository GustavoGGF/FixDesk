import React from "react";
import "../../styles/robotGlimpse.css";

export default function RoboGlimpse() {
  return (
    <div class="loader">
      <div class="modelViewPort">
        <div class="eva">
          <div class="head">
            <div class="eyeChamber">
              <div class="eye"></div>
              <div class="eye"></div>
            </div>
          </div>
          <div class="body">
            <div class="hand"></div>
            <div class="hand"></div>
            <div class="scannerThing"></div>
            <div class="scannerOrigin"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
