const toSnakeCase = (key: string): string =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const toSnakeCaseKeys = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(toSnakeCaseKeys);
  }

  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return Object.entries(value).reduce((acc, [key, val]) => {
      acc[toSnakeCase(key)] = toSnakeCaseKeys(val);
      return acc;
    }, {} as Record<string, any>);
  }

  return value;
};