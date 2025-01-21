import DebugHelper from '../debug-helper';

describe('DebugHelper', () => {
  beforeEach(() => {
    // Mock console methods before each test
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackStateChange', () => {
    test('tracks changes between states correctly', () => {
      const prevState = {
        field1: 'old',
        field2: 123,
        field3: 'unchanged'
      };

      const newState = {
        field1: 'new',
        field2: 456,
        field3: 'unchanged'
      };

      DebugHelper.trackStateChange(prevState, newState);

      expect(console.log).toHaveBeenCalledWith('State Changes:', {
        field1: { from: 'old', to: 'new' },
        field2: { from: 123, to: 456 }
      });
    });

    test('handles empty changes', () => {
      const state = {
        field1: 'same',
        field2: 123
      };

      DebugHelper.trackStateChange(state, { ...state });

      expect(console.log).toHaveBeenCalledWith('State Changes:', {});
    });

    test('handles complex object changes', () => {
      const prevState = {
        user: { name: 'John', age: 30 },
        settings: { theme: 'dark' }
      };

      const newState = {
        user: { name: 'John', age: 31 },
        settings: { theme: 'light' }
      };

      DebugHelper.trackStateChange(prevState, newState);

      expect(console.log).toHaveBeenCalledWith('State Changes:', {
        user: { 
          from: { name: 'John', age: 30 }, 
          to: { name: 'John', age: 31 } 
        },
        settings: { 
          from: { theme: 'dark' }, 
          to: { theme: 'light' } 
        }
      });
    });
  });

  describe('trackAPICall', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('tracks successful API calls with timing', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'success' });
      const result = await DebugHelper.trackAPICall(
        () => mockApiCall(),
        'Test API'
      );

      expect(result).toEqual({ data: 'success' });
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Test API completed in')
      );
    });

    test('tracks failed API calls with timing', async () => {
      const error = new Error('API Failed');
      const mockApiCall = jest.fn().mockRejectedValue(error);

      await expect(
        DebugHelper.trackAPICall(() => mockApiCall(), 'Failed API')
      ).rejects.toThrow('API Failed');

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed API failed in'),
        error
      );
    });
  });

  describe('trackCalculation', () => {
    test('tracks calculation inputs and outputs', () => {
      const mockCalculation = (inputs: { a: number, b: number }) => inputs.a + inputs.b;
      const inputs = { a: 5, b: 3 };

      const result = DebugHelper.trackCalculation(mockCalculation, inputs);

      expect(result).toBe(8);
      expect(console.log).toHaveBeenCalledWith('Calculation Inputs:', inputs);
      expect(console.log).toHaveBeenCalledWith('Calculation Result:', 8);
    });

    test('handles complex calculations', () => {
      const mockComplexCalculation = (inputs: { numbers: number[] }) => ({
        sum: inputs.numbers.reduce((a, b) => a + b, 0),
        avg: inputs.numbers.reduce((a, b) => a + b, 0) / inputs.numbers.length
      });

      const inputs = { numbers: [1, 2, 3, 4, 5] };
      const result = DebugHelper.trackCalculation(mockComplexCalculation, inputs);

      expect(result).toEqual({ sum: 15, avg: 3 });
      expect(console.log).toHaveBeenCalledWith('Calculation Inputs:', inputs);
      expect(console.log).toHaveBeenCalledWith('Calculation Result:', { sum: 15, avg: 3 });
    });
  });
});