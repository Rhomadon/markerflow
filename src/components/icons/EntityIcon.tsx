"use client"

import { divIcon } from "leaflet"

type Status = "true" | "idle" | "false"

export function createEntityIcon(
  angle: number = 0,
  _label?: string,
  ignition?: string
) {
  const colors: Record<Status, string> = {
    true: "#28a745",
    idle: "#ffc107",
    false: "#dc3545",
  }

  const statusKey = (ignition?.toLowerCase() ?? "") as Status
  const triangleColor = colors[statusKey] ?? "#dc3545"

  const isDriving = ignition === "true"

  return divIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 54px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      ">
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          transform: rotate(${angle}deg);
          transform-origin: center center;
        ">
          <div style="
            width: 21px;
            height: 21px;
            background: linear-gradient(135deg, #2979FF, #00E5FF);
            border: 2px solid #fff;
            border-radius: 50%;
            position: absolute;
            top: 10px;
            left: 7.5px;
            animation: pulse 2s infinite;
          "></div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-bottom: 10px solid ${triangleColor};
            position: absolute;
            top: 0px;
            left: 12px;
            ${isDriving ? "animation: moveArrow 0.5s infinite alternate;" : ""}
          "></div>
        </div>
      </div>

      <style>
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(30, 144, 255, 0.4);
          }
          70% {
            box-shadow: 0 0 0 9px rgba(30, 144, 255, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(30, 144, 255, 0);
          }
        }

        @keyframes moveArrow {
          0% { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }
      </style>
    `,
    iconSize: [36, 54],
    iconAnchor: [18, 27],
    popupAnchor: [0, -27],
  })
}
