export const defaultMantineColorList = [
  "dark",
  "gray",
  "red",
  "pink",
  "grape",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "green",
  "lime",
  "yellow",
  "orange",
  "teal",
];
export const getRandomMantineColor = () => {
  // gte random mantine color from defaultMantineColorList
  const randomColor =
    defaultMantineColorList[
      Math.floor(Math.random() * defaultMantineColorList.length)
    ];
  return randomColor;
};
