import React from "react";
import { Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { Map, Overlay, Tank } from "./index";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    width: "100%",
    justifyContent: "center",
  },
  container: {
    marginTop: "3em",
    border: "2px solid black",
    overflow: "hidden",
    position: "relative",
    left: 0,
    top: 0,
  },
}));

const GameView = ({ gameState, tankState, mapImg, mapOverlay, mapObjects }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box
        className={classes.container}
        style={{
          width: gameState.viewPortWidth,
          height: gameState.viewPortHeight,
        }}
      >
        <Map
          styling={{
            position: "absolute",
            zIndex: 1,
          }}
          gameState={gameState}
          mapImg={mapImg}
        />
        <Tank
          styling={{
            position: "absolute",
            zIndex: 2,
          }}
          tankState={tankState}
        />
        <Overlay
          styling={{
            position: "absolute",
            zIndex: 3,
          }}
          gameState={gameState}
          tankState={tankState}
          mapOverlay={mapOverlay}
          mapObjects={mapObjects}
        />
      </Box>
    </Box>
  );
};

export default GameView;
