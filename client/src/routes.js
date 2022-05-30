import React, { useEffect, useState } from "react";
import axios from "axios";
import { Route, Switch, withRouter } from "react-router-dom";

import Login from "./Login.js";
import { SnackbarError, Home } from "./components";
import { SocketContext, socket } from "./context/socket";

const Routes = (props) => {
  const [user, setUser] = useState({});

  const [errorMessage, setErrorMessage] = useState("");
  const [snackBarOpen, setSnackBarOpen] = useState(false);

  const login = async (credentials) => {
    try {
      const { data } = await axios.post("/login", credentials);
      await localStorage.setItem("tanks-token", data.token);
      setUser(data);
      socket.emit("go-online", data);
    } catch (error) {
      console.error(error);
      setUser({ error: error.response.data.error || "Server Error" });
    }
  };

  const logout = async (id) => {
    try {
      await axios.delete("/auth/logout");
      await localStorage.removeItem("tanks-token");
      setUser({});
      socket.emit("logout", id);
    } catch (error) {
      console.error(error);
    }
  };

  // Lifecycle

  useEffect(() => {
    if (user?.error) {
      // check to make sure error is what we expect, in case we get an unexpected server error object
      if (typeof user.error === "string") {
        setErrorMessage(user.error);
      } else {
        setErrorMessage("Internal Server Error. Please try again");
      }
      setSnackBarOpen(true);
    }
  }, [user?.error]);

  return (
    <SocketContext.Provider value={socket}>
      {snackBarOpen && (
        <SnackbarError
          setSnackBarOpen={setSnackBarOpen}
          errorMessage={errorMessage}
          snackBarOpen={snackBarOpen}
        />
      )}
      <Switch>
        <Route
          path="/login"
          render={() => <Login user={user} login={login} />}
        />
        <Route path="/" render={() => <Home user={user} logout={logout} />} />
      </Switch>
    </SocketContext.Provider>
  );
};
/*
 
        <Route
          path="/register"
          render={() => <Signup user={user} register={register} />}
        />
        <Route
          exact
          path="/"
          render={(props) =>
            user?.id ? (
              <Home user={user} logout={logout} />
            ) : (
              <Signup user={user} register={register} />
            )
          }
        />
*/

export default withRouter(Routes);
