import WorkspaceLayout from "@/components/Layout/WorkspaceLayout";
import { render, screen } from "@testing-library/react";

const setup = () => {
  render(<WorkspaceLayout>children</WorkspaceLayout>);
};

jest.mock("@mantine/core", () => ({
  ...jest.requireActual("@mantine/core"),
  useMantineColorScheme: () => ({
    colorScheme: "dark",
    toggleColorScheme: jest.fn(),
  }),
}));
// TODO Mock Supabase
describe.skip("workspace layout", () => {
  it("renders a navbar", () => {
    setup();
    const navbar = screen.getByRole("navigation", {
      name: "sidebar navigation",
    });
    expect(navbar).toBeInTheDocument();
  });

  it("renders the children", () => {
    setup();
    const children = screen.getByText("children");
    expect(children).toBeInTheDocument();
  });
});
