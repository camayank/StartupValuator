import { useState, useEffect } from 'react';

const useForceUpdate = (interval = 5000) => {
  const [_, setTick] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => !t);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return null;
};

export default useForceUpdate;
