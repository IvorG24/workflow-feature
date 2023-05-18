import { Layouts, PageWithLayoutProps } from "@/components/Layout/LayoutList";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";

export default function App(props: PageWithLayoutProps) {
  const { Component, pageProps } = props;

  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const Layout =
    Layouts[Component.Layout] ?? (({ children }) => <>{children}</>);

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
