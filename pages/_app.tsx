import { RouterTransition } from "@/components/RouterTransition";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { getCookie, setCookie } from "cookies-next";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import NextApp, { AppContext } from "next/app";
import { ReactElement, ReactNode, useState } from "react";
// Reference:
// https://github.com/eclipse-emfcloud/emfcloud/discussions/125
export type NextPageWithLayout<P = Record<string, unknown>, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App(
  props: AppPropsWithLayout & { colorScheme: ColorScheme }
) {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    props.colorScheme
  );

  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  const getLayout = Component.getLayout ?? ((page) => page);

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    setCookie("mantine-color-scheme", nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  return (
    <>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{ colorScheme }}
          withGlobalStyles
          withNormalizeCSS
        >
          <RouterTransition />
          <NotificationsProvider>
            <SessionContextProvider
              supabaseClient={supabaseClient}
              initialSession={pageProps.initialSession}
            >
              {getLayout(<Component {...pageProps} />)}
            </SessionContextProvider>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie("mantine-color-scheme", appContext.ctx) || "dark",
  };
};
