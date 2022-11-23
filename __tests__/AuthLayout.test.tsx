import AuthLayout from "@/components/Layout/AuthLayout";
import { render, screen } from "@testing-library/react";

const setup = () => {
  render(<AuthLayout>children</AuthLayout>);
};

describe("auth layout", () => {
  it("renders a logo", () => {
    setup();
    const logo = screen.getByTestId("logo");
    expect(logo).toBeInTheDocument();
  });
  it("renders a heading", () => {
    setup();
    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
  });
});
