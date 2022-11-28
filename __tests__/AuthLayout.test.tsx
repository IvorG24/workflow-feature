import AuthLayout from "@/components/Layout/AuthLayout";
import { render, screen } from "@testing-library/react";

const setup = () => {
  render(<AuthLayout>children</AuthLayout>);
};

jest.mock("@mantine/core", () => ({
  ...jest.requireActual("@mantine/core"),
  useMantineColorScheme: () => ({
    colorScheme: "dark",
    toggleColorScheme: jest.fn(),
  }),
}));

describe("auth layout", () => {
  it("renders a logo", () => {
    setup();

    // Todo: refactor into expect(screen.getByRole("img", {name: "logo"})
    const logo = screen.getByTestId("logo");
    expect(logo).toBeInTheDocument();
  });
  it("renders a heading", () => {
    setup();
    const heading = screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
  });
});
