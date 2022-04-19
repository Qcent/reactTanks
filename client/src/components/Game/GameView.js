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
    width: 800,
    height: 600,
    marginTop: "3em",
    border: "2px solid black",
    overflow: "hidden",
    position: "relative",
    left: 0,
    top: 0,
  },
}));

const GameView = (gameState) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.container}>
        <Map
          styling={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 1,
          }}
        />
        <Tank
          styling={{
            position: "absolute",
            left: 100,
            top: 100,
            zIndex: 2,
          }}
        />
        <Overlay
          styling={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 3,
          }}
        />
      </Box>
    </Box>
  );
};

export default GameView;
