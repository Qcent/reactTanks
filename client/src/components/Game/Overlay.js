import React from "react";

const Overlay = ({ styling, tankState, gameState, mapOverlay, mapObjects }) => {
  const { mapXpos, mapYpos } = gameState;
  const { me } = tankState;

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

  return (
    <>
      <img src={mapOverlay} style={styling} alt="map" />
      <div style={tankDotStyling}></div>
    </>
  );
};

export default Overlay;
