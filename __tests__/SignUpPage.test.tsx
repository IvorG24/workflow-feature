import SignUpPage from "@/components/SignUpPage/SignUpPage";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createPagesBrowserClient: jest.fn(),
}));

describe("SignUpPage", () => {
  it("renders required fields", () => {
    render(<SignUpPage />);

    const emailInput = screen.getByRole("textbox", { name: "Email" });
    const passwordInput = screen.getByLabelText("Password");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password");

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
  });

  it("renders oauth buttons", () => {
    render(<SignUpPage />);

    const googleAuth = screen.getByRole("button", { name: "Google" });
    const azureAuth = screen.getByRole("button", { name: "Azure" });

    expect(googleAuth).toBeInTheDocument();
    expect(azureAuth).toBeInTheDocument();
  });

  it("renders error on empty input", async () => {
    render(<SignUpPage />);

    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.click(signUpButton);

    expect(
      await screen.findByText(/email field cannot be empty/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/^password field cannot be empty/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/^confirm password field cannot be empty/i)
    ).toBeInTheDocument();
  });

  it("renders error on invalid email", async () => {
    render(<SignUpPage />);
    const emailInput = screen.getByRole("textbox", { name: "Email" });
    const signUpButton = screen.getByRole("button", { name: /sign up/i });
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    fireEvent.click(signUpButton);
    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument();
  });
});
