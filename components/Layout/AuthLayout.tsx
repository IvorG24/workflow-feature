import { MantineProvider } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { ReactNode } from "react";
import Auth from "../Auth/Auth";

type Props = {
  children: ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  const colorScheme = useColorScheme();
  return (
    <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
      <Auth>{children}</Auth>;
    </MantineProvider>
  );
};

export default AuthLayout;
