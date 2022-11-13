import getMantineTheme from "@/utils/getMantineTheme";
import createClient from "@/utils/supabase";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { NextPage } from "next/types";
import { ReactElement, ReactNode } from "react";
import "../styles/globals.css";

// #todo: implement better typing but I think it's okay because it's from the docs
// https://nextjs.org/docs/basic-features/layouts
// eslint-disable-next-line
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  // save theme to local storage
  // ref: https://mantine.dev/guides/dark-theme/
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value ?? (colorScheme === "dark" ? "light" : "dark"));

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        withCSSVariables
        theme={{ colorScheme, ...getMantineTheme(colorScheme) }}
      >
        <SessionContextProvider
          supabaseClient={createClient}
          initialSession={pageProps.initialSession}
        >
          {getLayout(<Component {...pageProps} />)}
        </SessionContextProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
