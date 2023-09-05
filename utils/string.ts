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

export const parseToTwoDigitNumber = (input: string): string => {
  const parsedNumber = parseInt(input, 10);
  if (!isNaN(parsedNumber)) return parsedNumber.toString().padStart(2, "0");
  else return "00";
};

export const formatTime = (time: string) => {
  const timeParts = time.split(":");
  const hours = parseToTwoDigitNumber(timeParts[0]);
  const minutes = parseToTwoDigitNumber(timeParts[1]);
  return `${hours}:${minutes}`;
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
  const date = input ? new Date(input.split("T")[0]) : undefined;
  return date;
};
