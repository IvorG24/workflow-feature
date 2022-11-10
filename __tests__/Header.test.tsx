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
    expect(screen.getByRole("img", { name: /logo/i }));
  });

  it("renders a dark mode toggler", () => {
    setup();
    expect(screen.getByRole("button", { name: /toggle dark mode/i }));
  });
});
