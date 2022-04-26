import React from "react";
//import { Box } from "@material-ui/core";

import map from "../../map/map2-0.png";

const Map = ({ styling, gameState }) => {
  const { mapXpos, mapYpos } = gameState;

  styling = {
    ...styling,
    left: -mapXpos,
    top: -mapYpos,
  };

  return <img src={map} style={styling} alt="tankie" />;
};

export default Map;