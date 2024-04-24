import SignInPage from "@/components/SignInPage/SignInPage";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createPagesBrowserClient: jest.fn(),
}));

describe("SignInPage", () => {
  it("renders required fields", async () => {
    render(<SignInPage />);
    const emailInput = screen.getByRole("textbox", { name: "Email" });
    const passwordInput = screen.getByLabelText("Password");
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it("renders oauth buttons", () => {
    render(<SignInPage />);
    const googleAuth = screen.getByRole("button", { name: /google/i });
    const azureAuth = screen.getByRole("button", { name: /azure/i });
    expect(googleAuth).toBeInTheDocument();
    expect(azureAuth).toBeInTheDocument();
  });

  it("renders error on empty input", async () => {
    render(<SignInPage />);
    const signInButton = screen.getByRole("button", { name: "Sign in" });
    fireEvent.click(signInButton);
    expect(
      await screen.findByText(/email field cannot be empty/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/^password field cannot be empty/i)
    ).toBeInTheDocument();
  });

  it("renders error on invalid email", async () => {
    render(<SignInPage />);
    const emailInput = screen.getByRole("textbox", { name: "Email" });
    const signInButton = screen.getByRole("button", { name: "Sign in" });
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    fireEvent.click(signInButton);
    expect(await screen.findByText(/email is invalid/i)).toBeInTheDocument();
  });
});
