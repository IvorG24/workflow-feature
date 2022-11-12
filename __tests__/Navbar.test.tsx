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
    const logo = screen.getByRole("img", { name: "logo" });
    expect(logo).toBeInTheDocument();
  });

  it("renders a dark mode toggler", () => {
    setup();
    const button = screen.getByRole("button", { name: "toggle dark mode" });
    expect(button).toBeInTheDocument();
  });

  it("renders a workspaces dropdown", () => {
    setup();
    const searchbox = screen.getByRole("searchbox", { name: /workspace/i });
    expect(searchbox).toBeInTheDocument();
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

  it("renders a create a request button", () => {
    setup();
    const button = screen.getByRole("button", { name: /create a request/i });
    expect(button).toBeInTheDocument();
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
    const button = screen.getByRole("button", { name: /notifications/i });
    expect(button).toBeInTheDocument();
  });

  it("renders a link to settings", () => {
    setup();
    const link = screen.getByRole("link", { name: /settings/i });
    expect(link).toHaveAttribute("href", "/settings");
  });

  it("renders a link to view profile", () => {
    setup();
    const link = screen.getByRole("link", { name: /view profile/i });
    expect(link).toHaveAttribute("href", "/profile");
  });

  it("renders a logout button", () => {
    setup();
    const button = screen.getByRole("button", { name: /logout/i });
    expect(button).toBeInTheDocument();
  });
});
