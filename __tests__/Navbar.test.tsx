import { render, screen } from "@testing-library/react";
import Navbar from "components/Layout/WorkspaceLayout/Navbar/Navbar";

const setup = () => {
  render(<Navbar />);
};

// mock mantine
jest.mock("@mantine/core", () => ({
  ...jest.requireActual("@mantine/core"),
  useMantineColorScheme: () => ({
    colorScheme: "dark",
    toggleColorScheme: jest.fn(),
  }),
}));

describe("header", () => {
  it("renders a logo", () => {
    setup();
    expect(screen.getByRole("img", { name: /logo/i })).toBeInTheDocument();
  });

  it("renders a dark mode toggler", () => {
    setup();
    expect(
      screen.getByRole("button", { name: /toggle dark mode/i })
    ).toBeInTheDocument();
  });

  it("renders a workspaces dropdown", () => {
    setup();
    expect(
      screen.getByRole("searchbox", { name: /workspace/i })
    ).toBeInTheDocument();
  });

  it("renders a link to dashboard", () => {
    setup();
    const link = screen.getByRole("link", { name: /dashboard/i });
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("renders a link to requests", () => {
    setup();
    const link = screen.getByRole("link", { name: /requests/i });
    expect(link).toHaveAttribute("href", "/requests");
  });

  it("renders a link to forms", () => {
    setup();
    const link = screen.getByRole("link", { name: /forms/i });
    expect(link).toHaveAttribute("href", "/forms");
  });

  it("renders a link to team", () => {
    setup();
    const link = screen.getByRole("link", { name: /team/i });
    expect(link).toHaveAttribute("href", "/team");
  });

  it("renders a notifications button", () => {
    setup();
    expect(
      screen.getByRole("button", { name: /notifications/i })
    ).toBeInTheDocument();
  });

  it("renders a link to settings", () => {
    setup();
    const link = screen.getByRole("link", { name: /settings/i });
    expect(link).toHaveAttribute("href", "/settings");
  });
});
