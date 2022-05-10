import React, { useCallback, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SocketContext } from "../context/socket";

import { GameView, GameLogic } from "./Game";
import PixelMap from "./Game/PixelMap";
import useEventListener from "@use-it/event-listener";

import mapImg from "../map/map2-0.png";
import mapObj from "../map/map2-1.png";
import mapOverlay from "../map/map2-2.png";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();
  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const socket = useContext(SocketContext);

  const [isLoading, setIsLoading] = useState(true);
  const [mapObjects, setMapObjects] = useState({});

  const [readyState, setReadyState] = useState(true);
  const [inputState, setInputState] = useState({});

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
  });
  const [tankState, setTankState] = useState({
    me: {
      health: 100,
      xPos: 100,
      yPos: 230,
      screenX: 100,
      screenY: 230,
      theta: 0,
      username: "Tankie",
      speed: 3,
      width: 30,
      height: 22,
      id: 0,
      v: [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ],
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

  const markMessagesRead = async (lastReadData) => {
    try {
      if (!lastReadData) return;
      const data = await saveReadStatus(lastReadData);
      if (data) {
        // updateReadStatus(lastReadData);
        broadcastMessagesRead(lastReadData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const broadcastMessagesRead = (lastReadData) => {
    socket.emit("read-message", {
      ...lastReadData,
    });
  };

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
    // Socket init
    /*
    socket.on('add-online-user', addOnlineUser);
    socket.on('remove-offline-user', removeOfflineUser);
    socket.on('new-message', addMessageToConversation);
*/

    // Game Clock / logic and frame limiter
    const interval = setInterval(() => {
      setReadyState(true);
    }, 1000 / gameState.fps);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      /*
      socket.off('add-online-user', addOnlineUser);
      socket.off('remove-offline-user', removeOfflineUser);
      socket.off('new-message', addMessageToConversation);
      */
      clearInterval(interval);
    };
  }, [
    //addMessageToConversation,
    //addOnlineUser,
    //removeOfflineUser,
    //updateReadStatus,
    //addMemberToLocalConvo,
    socket,
    gameState.fps,
    setReadyState,
  ]);

  useEffect(() => {
    // when fetching, prevent redirect
    if (user?.isFetching) return;

    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      // If we were previously logged in, redirect to login instead of register
      if (isLoggedIn) history.push("/login");
      else history.push("/register");
    }
  }, [user, history, isLoggedIn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const { data } = await axios.get("/api/data");
        /* setStateData(
          data.map((convo) => {
            convo.myUnreadMessageCount = convo.messages.filter(
              (message) =>
                message.id > convo.members[`${user.id}`].lastReadMessage &&
                message.senderId !== user.id
            ).length;

            return convo;
          })
        );
        */
      } catch (error) {
        console.error(error);
      }
    };
    if (!user.isFetching) {
      fetchData();
    }
  }, [user]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  //<Button onClick={handleLogout}>Logout</Button>
  return (
    <>
      {isLoading ? (
        <div>Loading Map</div>
      ) : (
        <Grid container component="main" className={classes.root}>
          <CssBaseline />
          <GameLogic
            inputState={inputState}
            gameState={gameState}
            setGameState={setGameState}
            tankState={tankState}
            setTankState={setTankState}
            readyState={readyState}
            setReadyState={setReadyState}
            mapObjects={mapObjects}
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
