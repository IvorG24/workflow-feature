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

export const getAvatarColor = (number: number) => {
  const randomColor =
    defaultMantineColorList[number % defaultMantineColorList.length];
  return randomColor;
};

export const mobileNumberFormatter = (value: string | undefined) =>
  !Number.isNaN(parseFloat(value ? value : "0"))
    ? `${value}`.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
    : "";
