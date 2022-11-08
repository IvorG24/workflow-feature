import createClient from "@/utils/supabase";
import { MantineProvider } from "@mantine/core";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import createClient from "../utils/supabase";
import { MantineProvider } from "@mantine/core";
import mantineTheme from "utils/mantineTheme";

export default function App({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      withCSSVariables
      theme={mantineTheme}
    >
      <SessionContextProvider
        supabaseClient={createClient}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />
      </SessionContextProvider>
    </MantineProvider>
  );
}
