import React, { useCallback, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SocketContext } from "../context/socket";

import { GameView } from "./Game";

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

  const [gameState, setGameState] = useState({
    tankSpeed: 8,
    mapWidth: 6000,
    mapHeight: 4000,
    mapXpos: 100,
    mapYpos: 100,
    mapLock: true,
  });
  const [tankState, setTankState] = useState({
    me: {
      health: 100,
      angle: 0,
      xPos: 100,
      yPos: 300,
      theta: 0,
      username: "Tankie",
      id: 0,
    },
  });

  const screenLogic = {
    moveAtAngle: (theta, pos = 1) => {
      return {
        mapXpos:
          gameState.mapXpos +
          Math.cos(theta * RADS) * gameState.tankSpeed * pos,
        mapYpos:
          gameState.mapYpos +
          Math.sin(theta * RADS) * gameState.tankSpeed * pos,
      };
    },
  };

  const tankLogic = {
    moveUp: (tank) => tank.yPos - gameState.tankSpeed,
    moveDown: (tank) => tank.yPos + gameState.tankSpeed,
    moveLeft: (tank) => tank.xPos - gameState.tankSpeed,
    moveRight: (tank) => tank.xPos + gameState.tankSpeed,
    rotateRight: (tank) => tank.theta + gameState.tankSpeed,
    rotateLeft: (tank) => tank.theta - gameState.tankSpeed,
    moveAtAngle: (tank, pos = 1) => [
      tank.xPos + Math.cos(tank.theta * RADS) * gameState.tankSpeed * pos,
      tank.yPos + Math.sin(tank.theta * RADS) * gameState.tankSpeed * pos,
    ],
    printDetails: (tank) => {
      console.log(tank, gameState);
    },
  };

  const handler = ({ key }) => {
    console.log("Key pressed: ", key);

    const newState = { ...tankState };
    const { me } = tankState;

    tankLogic.printDetails(me);

    switch (key) {
      case "ArrowLeft":
        newState.me.theta = tankLogic.rotateLeft(me);
        break;
      case "ArrowRight":
        newState.me.theta = tankLogic.rotateRight(me);
        break;
      case "ArrowUp":
        gameState.mapLock
          ? setGameState((prev) => {
              return { ...prev, ...screenLogic.moveAtAngle(me.theta) };
            })
          : ([newState.me.xPos, newState.me.yPos] = tankLogic.moveAtAngle(me));
        break;
      case "ArrowDown":
        [newState.me.xPos, newState.me.yPos] = tankLogic.moveAtAngle(me, -1);
        break;
      case "Tab":
        gameState.mapLock = !gameState.mapLock;
        break;

      default:
        break;
    }
    setTankState(newState);
  };

  useEventListener("keydown", handler);

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
    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      /*
      socket.off('add-online-user', addOnlineUser);
      socket.off('remove-offline-user', removeOfflineUser);
      socket.off('new-message', addMessageToConversation);
      */
    };
  }, [
    //addMessageToConversation,
    //addOnlineUser,
    //removeOfflineUser,
    //updateReadStatus,
    //addMemberToLocalConvo,
    socket,
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
        <GameView gameState={gameState} tankState={tankState} />
      </Grid>
    </>
  );
};

export default Home;
