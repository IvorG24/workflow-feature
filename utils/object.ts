// Remove duplicate objects by key.
export function distinctByKey<T extends { [key: string]: any }>(
  array: T[],
  key: string
): T[] {
  // create a new set to store unique values
  const set = new Set(array.map((item) => item[key]));

  // create a new array of objects with unique values for the specified key
  const uniqueArray = Array.from(set).map((name) =>
    array.find((item) => item[key] === name)
  );

  return uniqueArray as T[];
}
