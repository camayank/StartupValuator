interface StateChange<T> {
  from: T;
  to: T;
}

interface Changes {
  [key: string]: StateChange<any>;
}

export interface CalculationInputs {
  [key: string]: any;
}

const DebugHelper = {
  trackStateChange: <T extends Record<string, any>>(prevState: T, newState: T): void => {
    const changes: Changes = {};
    Object.keys(newState).forEach(key => {
      if (prevState[key] !== newState[key]) {
        changes[key] = { 
          from: prevState[key], 
          to: newState[key] 
        };
      }
    });
    console.log('State Changes:', changes);
  },

  trackAPICall: async <T>(apiFunction: () => Promise<T>, label: string): Promise<T> => {
    const startTime = Date.now();
    try {
      const result = await apiFunction();
      console.log(`${label} completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      console.error(`${label} failed in ${Date.now() - startTime}ms`, error);
      throw error;
    }
  },

  trackCalculation: <T, R>(calculation: (inputs: T) => R, inputs: T): R => {
    console.log('Calculation Inputs:', inputs);
    const result = calculation(inputs);
    console.log('Calculation Result:', result);
    return result;
  }
};

export default DebugHelper;
