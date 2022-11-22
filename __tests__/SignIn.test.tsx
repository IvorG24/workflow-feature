import SignIn from "@/components/SignIn/SignInWrapper";
import { render, screen } from "@testing-library/react";

const setup = () => {
  render(<SignIn />);
};

// // mock mantine
// jest.mock("@mantine/core", () => ({
//   ...jest.requireActual("@mantine/core"),
//   useMantineColorScheme: () => ({
//     colorScheme: "dark",
//     toggleColorScheme: jest.fn(),
//   }),
// }));

describe("Sign In Page", () => {
  it("renders heading", () => {
    setup();
    const logo = screen.getByRole("heading", { name: "Sign in" });
    expect(logo).toBeInTheDocument();
  });

  it("renders form input", () => {
    setup();
    const email = screen.getByRole("textbox", { name: /email/i });
    expect(email).toBeInTheDocument();
  });

  it("renders Sign in button", () => {
    setup();
    const signin = screen.getByRole("button", { name: /Sign In/i });
    expect(signin).toBeInTheDocument();
  });

  it("renders buttons to sign in with other providers", () => {
    setup();
    const providers = screen.getAllByRole("button");
    expect(providers.length).toBeGreaterThanOrEqual(3);
  });

  it("renders link to sign up page", () => {
    setup();
    const link = screen.getByRole("link", { name: /Sign Up/i });
    expect(link).toBeInTheDocument();
  });
});
