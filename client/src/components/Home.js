import React, { useCallback, useEffect, useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { SocketContext } from "../context/socket";

import { GameView } from "./Game";

import useEventListener from "@use-it/event-listener";

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

  const [gameState, setgameState] = useState({
    tankSpeed: 8,
    mapWidth: 6000,
    mapHeight: 4000,
  });
  const [tankState, setTankState] = useState({
    me: {
      health: 100,
      angle: 0,
      xPos: 100,
      yPos: 300,
      username: "Tankie",
      id: 0,
    },
  });

  const tankLogic = {
    moveUp: (tank) => (tank.yPos -= gameState.tankSpeed),
    moveDown: (tank) => (tank.yPos += gameState.tankSpeed),
    moveLeft: (tank) => (tank.xPos -= gameState.tankSpeed),
    moveRight: (tank) => (tank.xPos += gameState.tankSpeed),
  };

  const handler = ({ key }) => {
    console.log("Key pressed: ", key);

    const newState = { ...tankState };
    const { me } = tankState;
    switch (key) {
      case "ArrowLeft":
        newState.me.xPos = tankLogic.moveLeft(me);
        break;
      case "ArrowRight":
        newState.me.xPos = tankLogic.moveRight(me);
        break;
      case "ArrowUp":
        newState.me.yPos = tankLogic.moveUp(me);
        break;
      case "ArrowDown":
        newState.me.yPos = tankLogic.moveDown(me);
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
