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

export const getStatusToColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "blue";
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "canceled":
      return "gray";
  }
};
