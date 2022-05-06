import React from "react";

const Map = ({ styling, gameState, mapImg }) => {
  const { mapXpos, mapYpos } = gameState;

  styling = {
    ...styling,
    left: -mapXpos,
    top: -mapYpos,
  };

  return <img src={mapImg} style={styling} alt="tankie" />;
};

export default Map;
