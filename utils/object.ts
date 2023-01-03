// // Make array of objects distinct by key.

export function distinctByKey<T extends { [key: string]: any }>(
  array: T[],
  key: string
): T[] {
  // throw error if key is not a property of the object.
  if (!array.every((e) => e.hasOwnProperty(key))) {
    throw new Error(
      `Key ${key} is not a property of the objects in the array.`
    );
  }

  return array.filter(
    (element, index, self) =>
      index === self.findIndex((e) => e[key] === element[key])
  );
}
