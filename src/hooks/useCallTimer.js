import {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import { updateCallDuration } from '../reducers/CallDurationReducer';

const useCallTimer = () => {
  const [startTime, setStartTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const dispatch = useDispatch();

  const startTimer = () => {
    setStartTime(Date.now());
    setIsRunning(true);
  };

  const stopTimer = () => {
    setStartTime(null);
    setIsRunning(false);
  };

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        let val = Date.now() - startTime;
        dispatch(updateCallDuration(val));
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  return {
    isRunning,
    startTimer,
    stopTimer,
  };
};

export default useCallTimer;
