import React, { useEffect } from "react";

const GameInputs = ({
  pressedInputHandler,
  inputState,
  readyState,
  setReadyState,
}) => {
  // Lifecycle

  useEffect(() => {
    //console.log(inputState);
    if (readyState) {
      for (const key in inputState) {
        if (inputState[key] === true) {
          pressedInputHandler(key);
        }
      }
      setReadyState(false);
    }
  }, [inputState, pressedInputHandler, readyState, setReadyState]);

  return null;
};

export default GameInputs;
