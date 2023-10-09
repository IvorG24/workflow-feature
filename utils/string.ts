export const isValidTeamName = (name: string): boolean => {
  const allowedCharsRegex = /^[a-zA-Z0-9 ,;\/?:@&=+$\-_.!]*$/;

  if (name.length < 1 || name.length > 50) {
    return false;
  }

  if (!allowedCharsRegex.test(name)) {
    return false;
  }

  return true;
};

export const requestPath = (requestId: string) => {
  return `http://${window.location.host}/team-requests/requests/${requestId}`;
};

export const regExp = /\(([^)]+)\)/;

export const addCommaToNumber = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const startCase = (inputString: string) => {
  return inputString
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const formatTime = (time: string) => {
  const parsedTime = parseJSONIfValid(time);
  if (!parsedTime) return parsedTime;
  const timeParts = parsedTime.split(":");
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const parseJSONIfValid = (jsonString: string) => {
  try {
    const jsonObject = JSON.parse(jsonString);
    return jsonObject;
  } catch (error) {
    return jsonString;
  }
};

export const convertTimestampToDate = (input: string | Date) => {
  if (input instanceof Date) return input;
  const parsedInput = parseJSONIfValid(input);
  if (!parsedInput) return undefined;
  return new Date(parsedInput);
};
