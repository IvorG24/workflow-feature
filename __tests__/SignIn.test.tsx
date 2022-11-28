import SignIn from "@/components/SignIn/SignIn";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// mock mantine
jest.mock("@mantine/core", () => ({
  ...jest.requireActual("@mantine/core"),
  useMantineColorScheme: () => ({
    colorScheme: "dark",
    toggleColorScheme: jest.fn(),
  }),
}));

const setup = () => {
  render(<SignIn />);
};

const mockLogin = jest.fn((email, password) => {
  return Promise.resolve({ email, password });
});

describe("Sign In Page", () => {
  it("renders heading", () => {
    setup();
    const heading = screen.getByRole("heading", { name: "Sign in" });
    expect(heading).toBeInTheDocument();
  });

  it("renders email and password input", () => {
    setup();
    const email = screen.getByRole("textbox", { name: /email/i });
    const password = screen.getByLabelText("Password");

    expect(email).toBeInTheDocument();
    expect(password).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    setup();
    const button = screen.getByRole("button", {
      name: "sign in with email and password",
    });
    expect(button).toBeInTheDocument();
  });

  it("renders a sign in with google button", () => {
    setup();
    const button = screen.getByRole("button", { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
  });
  it("renders a sign in with facebook button", () => {
    setup();
    const button = screen.getByRole("button", {
      name: /sign in with facebook/i,
    });
    expect(button).toBeInTheDocument();
  });
  it("renders a sign in with github button", () => {
    setup();
    const button = screen.getByRole("button", { name: /sign in with github/i });
    expect(button).toBeInTheDocument();
  });

  it("renders link to sign up page", () => {
    setup();
    const link = screen.getByRole("link", { name: /register/i });
    expect(link).toBeInTheDocument();
  });

  it("should display matching error when email is invalid", async () => {
    setup();
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    await userEvent.type(emailInput, "johndoe@gmail");
    expect(emailInput).toHaveValue("johndoe@gmail");

    const passwordInput = screen.getByLabelText("Password");
    await userEvent.type(passwordInput, "mypassword");
    expect(passwordInput).toHaveValue("mypassword");

    const signInButton = screen.getByRole("button", {
      name: "sign in with email and password",
    });
    await userEvent.click(signInButton);

    expect(await screen.findAllByRole("alert")).toHaveLength(1);
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("should display matching error when password length is less than 8", async () => {
    setup();
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    await userEvent.type(emailInput, "johndoe@gmail.com");
    expect(emailInput).toHaveValue("johndoe@gmail.com");

    const passwordInput = screen.getByLabelText("Password");
    await userEvent.type(passwordInput, "pass");
    expect(passwordInput).toHaveValue("pass");

    const signInButton = screen.getByRole("button", {
      name: "sign in with email and password",
    });
    await userEvent.click(signInButton);

    expect(await screen.findAllByRole("alert")).toHaveLength(1);
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
