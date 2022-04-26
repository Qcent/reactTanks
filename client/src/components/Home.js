import React, { useCallback, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SocketContext } from "../context/socket";

import { GameView, GameInputs, GameLogic } from "./Game";

import useEventListener from "@use-it/event-listener";

const RADS = Math.PI / 180;

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

  const [readyState, setReadyState] = useState(true);
  const [inputState, setInputState] = useState({});

  const [gameState, setGameState] = useState({
    fps: 60,
    tankSpeed: 3,
    mapWidth: 6000,
    mapHeight: 4000,
    mapXpos: 100,
    mapYpos: 100,
    cruiseMode: true, // keep Tank centered
    viewPortWidth: 800,
    viewPortHeight: 600,
  });
  const [tankState, setTankState] = useState({
    me: {
      health: 100,
      angle: 0,
      xPos: 100,
      yPos: 300,
      theta: 0,
      username: "Tankie",
      width: 30,
      height: 22,
      id: 0,
    },
  });

  const screenLogic = {
    moveY: (amt) => {
      return { mapYpos: gameState.mapYpos + amt };
    },
    moveX: (amt) => {
      return { mapXpos: gameState.mapXpos + amt };
    },
    moveAtAngle: (theta, pos = 1) => {
      return screenLogic.coordLimitCheck({
        mapXpos:
          gameState.mapXpos +
          Math.cos(theta * RADS) * gameState.tankSpeed * pos,
        mapYpos:
          gameState.mapYpos +
          Math.sin(theta * RADS) * gameState.tankSpeed * pos,
      });
    },
    coordLimitCheck: ({ mapXpos, mapYpos }) => {
      let [xDrift, yDrift] = [0, 0];
      const newMe = { ...tankState.me };

      if (mapXpos > gameState.mapWidth - gameState.viewPortWidth) {
        xDrift = mapXpos - (gameState.mapWidth - gameState.viewPortWidth);
        mapXpos = gameState.mapWidth - gameState.viewPortWidth;
      }
      if (mapXpos < 0) {
        xDrift = mapXpos;
        mapXpos = 0;
      }
      if (mapYpos > gameState.mapHeight - gameState.viewPortHeight) {
        yDrift = mapYpos - (gameState.mapHeight - gameState.viewPortHeight);
        mapYpos = gameState.mapHeight - gameState.viewPortHeight;
      }
      if (mapYpos < 0) {
        yDrift = mapYpos;
        mapYpos = 0;
      }

      if (xDrift !== 0) {
        newMe.xPos = tankLogic.moveX(newMe, xDrift).xPos;
      }
      if (yDrift !== 0) {
        newMe.yPos = tankLogic.moveY(newMe, yDrift).yPos;
      }
      if (xDrift !== 0 || yDrift !== 0) {
        setTankState((prev) => {
          return {
            ...prev,
            me: { ...newMe },
          };
        });
      }

      return { mapXpos, mapYpos };
    },
  };

  const tankLogic = {
    moveY: (tank, amt) =>
      tankLogic.coordLimitCheck(tank, { yPos: tank.yPos + amt }),
    moveX: (tank, amt) =>
      tankLogic.coordLimitCheck(tank, { xPos: tank.xPos + amt }),
    rotate: (tank, pos = 1) =>
      tankLogic.rotateLimiter(tank.theta + gameState.tankSpeed * 1.5 * pos),
    rotateLimiter: (theta) => (theta > 0 ? theta % 360 : (theta + 360) % 360),
    moveAtAngle: (tank, pos = 1) => {
      return tankLogic.coordLimitCheck(tank, {
        xPos:
          tank.xPos + Math.cos(tank.theta * RADS) * gameState.tankSpeed * pos,
        yPos:
          tank.yPos + Math.sin(tank.theta * RADS) * gameState.tankSpeed * pos,
      });
    },
    coordLimitCheck: (tank, { xPos, yPos }) => {
      if (gameState.cruiseMode) {
      } else {
      }

      if (xPos) {
        if (xPos > gameState.viewPortWidth - tank.width) {
          xPos = gameState.viewPortWidth - tank.width;
        }
        if (xPos < 0) {
          xPos = 0;
        }
      }
      if (yPos) {
        if (yPos > gameState.viewPortHeight - tank.height) {
          yPos = gameState.viewPortHeight - tank.height;
        }
        if (yPos < 0) {
          yPos = 0;
        }
      }

      return { xPos, yPos };
    },
    printDetails: (tank) => {
      console.log(tank, gameState);
    },
  };

  const inputDownHandler = ({ key }) => {
    setInputState((prev) => {
      prev[key] = true;
      return { ...prev };
    });
  };

  const inputUpHandler = ({ key }) => {
    setInputState((prev) => {
      prev[key] = false;
      return { ...prev };
    });
  };

  const pressedInputHandler = useCallback((key) => {
    //console.log("Key pressed: ", key);

    const newState = { ...tankState };
    const { me } = tankState;
    let update = false;

    switch (key) {
      case "ArrowLeft":
        newState.me.theta = tankLogic.rotate(me, -1);
        update = true;
        break;
      case "ArrowRight":
        newState.me.theta = tankLogic.rotate(me);
        update = true;
        break;
      case "ArrowUp":
        if (gameState.cruiseMode) {
          setGameState((prev) => {
            return { ...prev, ...screenLogic.moveAtAngle(me.theta) };
          });
        } else {
          newState.me = { ...me, ...tankLogic.moveAtAngle(me) };
          update = true;
        }
        break;
      case "ArrowDown":
        if (gameState.cruiseMode) {
          setGameState((prev) => {
            return { ...prev, ...screenLogic.moveAtAngle(me.theta, -1) };
          });
        } else {
          newState.me = { ...me, ...tankLogic.moveAtAngle(me, -1) };
          update = true;
        }
        break;
      case "q":
        setGameState((prev) => {
          return { ...prev, cruiseMode: !prev.cruiseMode };
        });
        break;

      default:
        break;
    }
    // tankLogic.printDetails(newState.me);
    if (update) setTankState(newState);
  });

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

  // Lifecycle

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

  // console.log(tankState);

  //<Button onClick={handleLogout}>Logout</Button>
  return (
    <>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <GameInputs
          inputState={inputState}
          pressedInputHandler={pressedInputHandler}
          readyState={readyState}
          setReadyState={setReadyState}
        />
        <GameLogic
          gameState={gameState}
          setGameState={setGameState}
          tankState={tankState}
          setTankState={setTankState}
          readyState={readyState}
          setReadyState={setReadyState}
          tankLogic={tankLogic}
          screenLogic={screenLogic}
        />
        <GameView gameState={gameState} tankState={tankState} />
      </Grid>
    </>
  );
};

export default Home;
