import "../styles/globals.css";
import type { AppProps } from "next/app";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { useState } from "react";
import createClient from "../utils/supabase";

export default function App({
  Component,
  pageProps,
}: AppProps<{ initialSession: Session }>) {
  return (
    <SessionContextProvider
      supabaseClient={createClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />;
    </SessionContextProvider>
  );
}
