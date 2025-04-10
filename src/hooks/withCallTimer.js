import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCallDuration } from "../reducers/CallDurationReducer";

const withCallTimer = (WrappedComponent) => {
  const WithCallTimer = () => {
    const [startTime, setStartTime] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const agoraData = useSelector(
      (state) => state?.VoipReducer?.agora_data || {}
    );
    const dispatch = useDispatch();

    const startTimer = () => {
      setStartTime(Date.now());
      setIsRunning(true);
    };

    const stopTimer = () => {
      setStartTime(null);
      setIsRunning(false);
      dispatch(updateCallDuration(0));
    };

    useEffect(() => {
      let interval = null;
      if (isRunning) {
        if (interval) {
          clearInterval(interval);
          dispatch(updateCallDuration("0"));
        }
        interval = setInterval(() => {
          let currDate = Date.now();
          let val = currDate - startTime;
          dispatch(updateCallDuration(val));
        }, 1000);
      } else {
        dispatch(updateCallDuration("0"));
        clearInterval(interval);
      }

      return () => {
        dispatch(updateCallDuration("0"));
        clearInterval(interval);
      };
    }, [isRunning && agoraData.uid]);

    return (
      <WrappedComponent
        isRunning={isRunning}
        startTimer={startTimer}
        stopTimer={stopTimer}
      />
    );
  };

  return React.memo(WithCallTimer);
};

export default withCallTimer;
