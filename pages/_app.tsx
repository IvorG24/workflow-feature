import { MantineProvider } from "@mantine/core";
import { Session, SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import createClient from "../utils/supabase";

export default function App({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <SessionContextProvider
        supabaseClient={createClient}
        initialSession={pageProps.initialSession}
      >
        <Component {...pageProps} />;
      </SessionContextProvider>
    </MantineProvider>
  );
}
