import { AppShell, useMantineTheme } from "@mantine/core";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const theme = useMantineTheme();

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
          position: "relative",
        },
      }}
      navbarOffsetBreakpoint={999999}
      asideOffsetBreakpoint="sm"
      padding={0}
    >
      {children}
    </AppShell>
  );
};

export default Layout;
