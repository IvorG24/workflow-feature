export type MockUser = {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
};

export const userA: MockUser = {
  email: "johndoe@gmail.com",
  password: "pass",
  username: "johndoe",
  firstName: "John",
  lastName: "Doe",
};

export const userB: MockUser = {
  email: "janedoe@gmail.com",
  password: "pass",
  username: "janedoe",
  firstName: "Jane",
  lastName: "Doe",
};

export const userC: MockUser = {
  email: "loremipsum@gmail.com",
  password: "pass",
  username: "loremipsum",
  firstName: "Lorem",
  lastName: "Ipsum",
};

export const userD: MockUser = {
  email: "dolorsit@gmail.com",
  password: "pass",
  username: "dolorsit",
  firstName: "Dolor",
  lastName: "Sit",
};
