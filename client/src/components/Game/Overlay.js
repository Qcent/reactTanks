import React from "react";

const Overlay = ({ styling, tankState, gameState, mapOverlay, mapObjects }) => {
  const { mapXpos, mapYpos } = gameState;
  const { me } = tankState;
  const { colLine } = me;

  styling = {
    ...styling,
    left: -mapXpos,
    top: -mapYpos,
  };

  const tankDotStyling = {
    ...styling,
    border: "1px solid #29d3e9",
    borderRadius: "50%",
    backgroundColor: "#29d3e9",
    width: 1,
    height: 1,
    left: me.screenX + me.width / 2,
    top: me.screenY + me.height / 2,
  };

  const v1 = {
    ...styling,
    border: "1px solid #f5f242",
    borderRadius: "50%",
    backgroundColor: "#f5f242",
    width: 1,
    height: 1,
    left: me.v[0][0],
    top: me.v[0][1],
  };

  const v2 = {
    ...styling,
    border: "1px solid #f542e3",
    borderRadius: "50%",
    backgroundColor: "#f542e3",
    width: 1,
    height: 1,
    left: me.v[1][0],
    top: me.v[1][1],
  };

  const v3 = {
    ...styling,
    border: "1px solid #6042f5",
    borderRadius: "50%",
    backgroundColor: "#6042f5",
    width: 1,
    height: 1,
    left: me.v[2][0],
    top: me.v[2][1],
  };

  const v4 = {
    ...styling,
    border: "1px solid #f57e42",
    borderRadius: "50%",
    backgroundColor: "#f57e42",
    width: 1,
    height: 1,
    left: me.v[3][0],
    top: me.v[3][1],
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
          style={{ ...pointStyle, left: x - mapXpos, top: y - mapYpos }}
        ></div>
      );
    }
  }

  return (
    <>
      <img src={mapOverlay} style={styling} alt="map" />
      <div style={tankDotStyling}></div>
      <div style={v1}></div>
      <div style={v2}></div>
      <div style={v3}></div>
      <div style={v4}></div>
      {points}
    </>
  );
};

export default Overlay;
