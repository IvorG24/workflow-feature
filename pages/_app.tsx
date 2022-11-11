import createClient from "@/utils/supabase";
import { MantineProvider } from "@mantine/core";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import createClient from "../utils/supabase";
import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import getMantineTheme from "utils/getMantineTheme";

export default function App({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) {
  // save theme to local storage
  // ref: https://mantine.dev/guides/dark-theme/
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value ?? (colorScheme === "dark" ? "light" : "dark"));

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
          <Component {...pageProps} />
        </SessionContextProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
