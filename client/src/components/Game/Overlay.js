import React from "react";

const Overlay = ({ styling, tankState, gameState, mapOverlay, mapObjects }) => {
  const { mapXpos, mapYpos } = gameState;
  const { me } = tankState;
  const { colLine, bulletTest } = me;

  styling = {
    ...styling,
    left: -mapXpos,
    top: -mapYpos,
  };

  const pointStyle = {
    ...styling,
    border: "1px solid #363636",
    borderRadius: "50%",
    backgroundColor: "#363636",
    width: 1,
    height: 1,
  };

  const points = [];
  if (colLine?.length) {
    for (let i = 0; i < colLine.length; i++) {
      const [x, y] = colLine[i];

      points.push(
        <div
          key={i}
          style={{ ...pointStyle, left: x - mapXpos, top: y - mapYpos }}
        ></div>
      );
    }
  }

  if (bulletTest?.length) {
    for (let i = 0; i < bulletTest.length; i++) {
      const [x, y] = bulletTest[i];

      points.push(
        <div
          key={`bullet${i}`}
          style={{ ...pointStyle, left: x - mapXpos, top: y - mapYpos }}
        ></div>
      );
    }
  }

  return (
    <>
      <img src={mapOverlay} style={styling} alt="map" />
      {points}
    </>
  );
};

export default Overlay;
