import React from "react";
//import { Box } from "@material-ui/core";

import overlay from "../../map/map2-2.png";

const Overlay = ({ styling, gameState }) => {
  const { mapXpos, mapYpos } = gameState;

  styling = {
    ...styling,
    left: -mapXpos,
    top: -mapYpos,
  };
  return <img src={overlay} style={styling} alt="map" />;
};

export default Overlay;
