import Layout from "@/components/Layout/Layout";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { AppProps } from "next/app";
import { useState } from "react";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "light",
      }}
    >
      <Notifications />
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionContextProvider>
    </MantineProvider>
  );
}
