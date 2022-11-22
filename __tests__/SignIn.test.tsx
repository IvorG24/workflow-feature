import SignIn from "@/components/SignIn/SignIn";
import { fireEvent, render, screen } from "@testing-library/react";

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
    const password = screen.getByTestId("password");
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
    const link = screen.getByRole("link", { name: /Sign Up/i });
    expect(link).toBeInTheDocument();
  });

  it("should display matching error when email is invalid", async () => {
    setup();
    fireEvent.input(screen.getByRole("textbox", { name: /email/i }), {
      target: {
        value: "test@emailcom",
      },
    });

    fireEvent.input(screen.getByTestId("password"), {
      target: {
        value: "password",
      },
    });

    fireEvent.submit(
      screen.getByRole("button", {
        name: "sign in with email and password",
      })
    );

    expect(await screen.findAllByRole("alert")).toHaveLength(1);
    expect(mockLogin).not.toBeCalled();
  });

  it("should display matching error when password length is less than 8", async () => {
    setup();
    fireEvent.input(screen.getByRole("textbox", { name: /email/i }), {
      target: {
        value: "test@email.com",
      },
    });

    fireEvent.input(screen.getByTestId("password"), {
      target: {
        value: "pass",
      },
    });

    fireEvent.submit(
      screen.getByRole("button", {
        name: "sign in with email and password",
      })
    );

    expect(await screen.findAllByRole("alert")).toHaveLength(1);
    expect(mockLogin).not.toBeCalled();
  });
});
