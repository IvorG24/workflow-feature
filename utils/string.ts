// 6-30 characters only
// period is allowed
// apostrophe is allowed
// hyphen is allowed
// space is allowed
// in any order
export const isValidTeamName = (teamName: string) => {
  const regex = /^[a-zA-Z0-9_. '-]{6,30}$/;
  return regex.test(teamName);
};

// 1-30 characters only
// no special characters except for period, hyphen, and space
// no underscore
// no apostrophe
export const isValidFirstOrLastName = (name: string) => {
  const regex = /^[a-zA-Z0-9. -]{1,30}$/;
  return regex.test(name);
};

// allow alphanumeric characters
// no spaces
// no special characters
// allow dash
// Like GitHub username rules.
export const isValidUsername = (username: string) => {
  const regex = /^[a-zA-Z0-9-]{6,30}$/;
  return regex.test(username);
};
