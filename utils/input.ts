// function to check if input is lowecased letters, spaces, underscores, and numbers only.
export function isUniqueNameValid(input: string): boolean {
  const regex = /^[a-z0-9_ ]+$/;
  return regex.test(input);
}
