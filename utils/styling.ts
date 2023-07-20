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
    case "paused":
      return "orange";
  }
};
export const mobileNumberFormatter = (value: string | undefined) =>
  !Number.isNaN(parseFloat(value ? value : "0"))
    ? `${value}`.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
    : "";

export const getStatusToColorForCharts = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "#228BE6";
    case "approved":
      return "#40C057";
    case "rejected":
      return "#FA5252";
    case "canceled":
      return "#868E96";
  }
};
