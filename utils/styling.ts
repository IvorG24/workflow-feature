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

export const shortenFileName = (fileName: string, maxLength: number) => {
  if (fileName.length <= maxLength) {
    return fileName;
  }

  const extension = fileName.split(".").pop();
  const fileNameWithoutExtension = fileName.substring(
    0,
    fileName.length - Number(extension?.length || 0) - 1
  );

  const maxCharsForFileName = maxLength - Number(extension?.length || 0) - 2; // Account for the ".." and extension
  const shortenedFileName = fileNameWithoutExtension.substring(
    0,
    maxCharsForFileName
  );

  return shortenedFileName + ".." + extension;
};
