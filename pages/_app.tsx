import { Layouts, PageWithLayoutProps } from "@/components/Layout/LayoutList";
import { RouterTransition } from "@/components/RouterTransition/RouterTransition";
import { useIsLoading } from "@/stores/useLoadingStore";
import { useActiveApp } from "@/stores/useTeamStore";

import {
  ColorScheme,
  ColorSchemeProvider,
  LoadingOverlay,
  MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { getCookie, setCookie } from "cookies-next";
import NextApp, { AppContext } from "next/app";
import { useState } from "react";

export default function App(
  props: PageWithLayoutProps & { colorScheme: ColorScheme }
) {
  const { Component, pageProps } = props;

  const activeApp = useActiveApp();
  const isLoading = useIsLoading();

  const [supabaseClient] = useState(() => createPagesBrowserClient());
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    props.colorScheme
  );

  const Layout =
    Layouts[Component.Layout] ?? (({ children }) => <>{children}</>);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    setCookie("mantine-color-scheme", nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme,
          primaryColor: activeApp === "REVIEW" ? "green" : "blue",
        }}
      >
        <ModalsProvider>
          <RouterTransition />

          <Notifications />
          <SessionContextProvider
            supabaseClient={supabaseClient}
            initialSession={pageProps.initialSession}
          >
            <Layout>
              <LoadingOverlay
                visible={isLoading}
                overlayBlur={2}
                sx={{ position: "fixed" }}
              />
              <Component {...pageProps} />
            </Layout>
          </SessionContextProvider>
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie("mantine-color-scheme", appContext.ctx) || "dark",
  };
};
