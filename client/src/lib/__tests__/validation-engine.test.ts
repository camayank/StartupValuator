import ValidationEngine from '../validation-engine';

describe('ValidationEngine', () => {
  describe('validateNumber', () => {
    test('validates numbers within range correctly', () => {
      expect(ValidationEngine.validateNumber(500, { min: 0, max: 1000 })).toBe(true);
      expect(ValidationEngine.validateNumber(1500, { min: 0, max: 1000 })).toBe(false);
      expect(ValidationEngine.validateNumber(0, { min: 0, max: 1000 })).toBe(true);
      expect(ValidationEngine.validateNumber(1000, { min: 0, max: 1000 })).toBe(true);
      expect(ValidationEngine.validateNumber(-1, { min: 0, max: 1000 })).toBe(false);
    });

    test('handles non-number values', () => {
      expect(ValidationEngine.validateNumber('500' as any, { min: 0, max: 1000 })).toBe(false);
      expect(ValidationEngine.validateNumber(null as any, { min: 0, max: 1000 })).toBe(false);
      expect(ValidationEngine.validateNumber(undefined as any, { min: 0, max: 1000 })).toBe(false);
    });

    test('handles missing bounds', () => {
      expect(ValidationEngine.validateNumber(500, {})).toBe(true);
      expect(ValidationEngine.validateNumber(500, { min: 0 })).toBe(true);
      expect(ValidationEngine.validateNumber(500, { max: 1000 })).toBe(true);
    });
  });

  describe('validateString', () => {
    test('validates strings within length range correctly', () => {
      expect(ValidationEngine.validateString('test', { minLength: 2, maxLength: 10 })).toBe(true);
      expect(ValidationEngine.validateString('t', { minLength: 2, maxLength: 10 })).toBe(false);
      expect(ValidationEngine.validateString('toolongstring', { minLength: 2, maxLength: 10 })).toBe(false);
      expect(ValidationEngine.validateString('', { minLength: 0, maxLength: 10 })).toBe(true);
    });

    test('handles non-string values', () => {
      expect(ValidationEngine.validateString(123 as any, { minLength: 2, maxLength: 10 })).toBe(false);
      expect(ValidationEngine.validateString(null as any, { minLength: 2, maxLength: 10 })).toBe(false);
      expect(ValidationEngine.validateString(undefined as any, { minLength: 2, maxLength: 10 })).toBe(false);
    });

    test('handles missing length bounds', () => {
      expect(ValidationEngine.validateString('test', {})).toBe(true);
      expect(ValidationEngine.validateString('test', { minLength: 2 })).toBe(true);
      expect(ValidationEngine.validateString('test', { maxLength: 10 })).toBe(true);
    });
  });

  describe('validateDependencies', () => {
    const mockFields = {
      field1: { value: 'test1', isValid: true },
      field2: { value: 'test2', isValid: true },
      field3: { value: 'test3', isValid: false }
    };

    test('validates dependencies correctly', () => {
      const dependencies = {
        field1: ['field2'],
        field2: ['field3']
      };
      expect(ValidationEngine.validateDependencies(mockFields, dependencies)).toBe(false);
    });

    test('handles missing dependencies', () => {
      const dependencies = {
        field1: ['nonexistent']
      };
      // If a field has a dependency that doesn't exist, validation should fail
      expect(ValidationEngine.validateDependencies(mockFields, dependencies)).toBe(false);
    });

    test('handles empty dependencies', () => {
      expect(ValidationEngine.validateDependencies(mockFields, {})).toBe(true);
    });
  });
});