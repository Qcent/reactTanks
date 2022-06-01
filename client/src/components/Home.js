import React, { useCallback, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SocketContext } from "../context/socket";

import { GameView, GameLogic } from "./Game";
import PixelMap from "./Game/PixelMap";
import useEventListener from "@use-it/event-listener";

import mapImg from "../assets/map/map-0.png";
import mapObj from "../assets/map/map-1.png";
import mapOverlay from "../assets/map/map-2.png";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
}));

const Home = ({ user, logout, emitTankData, fetchPlayers }) => {
  const history = useHistory();
  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const socket = useContext(SocketContext);

  const [isLoading, setIsLoading] = useState(true);
  const [mapObjects, setMapObjects] = useState({});

  const [readyState, setReadyState] = useState(true);
  const [inputState, setInputState] = useState({});

  const [tankUpdates, setTankUpdates] = useState({});

  const [gameState, setGameState] = useState({
    fps: 60,
    tankSpeed: 3,
    mapWidth: 6000,
    mapHeight: 4000,
    mapXpos: 0,
    mapYpos: 0,
    cruiseMode: true, // keep Tank centered
    viewPortWidth: 800,
    viewPortHeight: 600,
    bulletArray: [],
    explosionArray: [],
  });
  const [tankState, setTankState] = useState({
    me: {
      id: user.id,
      username: user.username,
      tankType: user.tankType,
      ammoType: user.ammoType || "0",
      health: user.health || 100,
      speed: 3,
      width: 30,
      height: 22,
      xPos: user.xPos || 100,
      yPos: user.yPos || 230,
      screenX: 100,
      screenY: 230,
      theta: user.theta || 0,
    },
  });

  const inputDownHandler = ({ key }) => {
    setInputState((prev) => {
      prev[key] = true;
      return { ...prev };
    });
  };

  const inputUpHandler = ({ key }) => {
    setInputState((prev) => {
      delete prev[key];
      return { ...prev };
    });
  };

  useEventListener("keydown", inputDownHandler);
  useEventListener("keyup", inputUpHandler);

  const addOnlineUser = useCallback(
    (data) => {
      console.log(`${data.username} came online`);
      // const { id } = user;
      // setTankUpdates((prev) => {
      //   return { ...prev, id: { ...user } };
      // });
    },
    [setTankUpdates]
  );

  const removeOfflineUser = useCallback(
    (id) => {
      console.log(`${id} has logged off`);
      setTankState((prev) => {
        delete prev[id];
        return { ...prev };
      });
    },
    [setTankUpdates]
  );

  const updateTankPosition = useCallback(
    (data) => {
      setTankUpdates((prev) => {
        prev[data.id] = data;
        return { ...prev };
      });
    },
    [setTankUpdates]
  );

  const saveReadStatus = async (body) => {
    const data = await axios.put("/api/conversations/read", body);
    return data;
  };

  const cacheImages = useCallback(
    async (srcArray) => {
      const promises = await srcArray.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve(img);
          img.onerror = reject(src);
          img.src = src;
        });
      });

      const imgEls = await Promise.all(promises);
      const objectMap = new PixelMap(imgEls[1], 6000, 4000);

      console.log("Building Map Data");
      await objectMap.aquireData();
      await objectMap.buildMap({ 2550255: 0, 25500: 1, "000": 2 }, true);

      setMapObjects(objectMap);
      setIsLoading(false);
    },
    [setMapObjects, setIsLoading]
  );
  // Lifecycle

  useEffect(() => {
    const imgs = [mapImg, mapObj, mapOverlay];
    cacheImages(imgs);
  }, [cacheImages]);

  useEffect(() => {
    (async () => {
      const data = await fetchPlayers();
      setTankUpdates(data);
    })();
  }, [setTankUpdates, fetchPlayers]);

  useEffect(() => {
    // Socket init
    socket.on("add-online-user", addOnlineUser);
    socket.on("remove-offline-user", removeOfflineUser);
    socket.on("new-tank-position", updateTankPosition);

    // Game Clock / logic and frame limiter
    const interval = setInterval(() => {
      setReadyState(true);
    }, 1000 / gameState.fps);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off("add-online-user", addOnlineUser);
      socket.off("remove-offline-user", removeOfflineUser);
      socket.off("new-tank-position", updateTankPosition);

      clearInterval(interval);
    };
  }, [
    addOnlineUser,
    removeOfflineUser,
    updateTankPosition,
    socket,
    gameState.fps,
    setReadyState,
  ]);

  useEffect(() => {
    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      history.push("/login");
    }
  }, [user, history, isLoggedIn]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <>
      {isLoading ? (
        <div>Loading Map</div>
      ) : (
        <Grid container component="main" className={classes.root}>
          <CssBaseline />
          <Button onClick={handleLogout}>Logout</Button>
          <GameLogic
            inputState={inputState}
            gameState={gameState}
            setGameState={setGameState}
            tankState={tankState}
            setTankState={setTankState}
            readyState={readyState}
            setReadyState={setReadyState}
            mapObjects={mapObjects}
            emitTankData={emitTankData}
            tankUpdates={tankUpdates}
            setTankUpdates={setTankUpdates}
          />
          <GameView
            gameState={gameState}
            tankState={tankState}
            mapImg={mapImg}
            mapOverlay={mapOverlay}
            mapObjects={mapObjects}
          />
        </Grid>
      )}
    </>
  );
};

export default Home;
