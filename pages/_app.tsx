import ActiveTeamContext from "@/contexts/ActiveTeamContext";
import ActiveTeamFormListContext from "@/contexts/ActiveTeamFormListContext";
import CurrentUserProfileContext from "@/contexts/CurrentUserProfileContext";
import CurrentUserTeamListContext from "@/contexts/CurrentUserTeamListContext";
import getMantineTheme from "@/utils/getMantineTheme";
import { distinctByKey } from "@/utils/object";
import {
  createOrRetrieveUserProfile,
  CreateOrRetrieveUserProfile,
  createOrRetrieveUserTeamList,
  CreateOrRetrieveUserTeamList,
  getTeam,
  GetTeam,
  GetTeamFormTemplateList,
  getTeamFormTemplateList,
} from "@/utils/queries-new";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { NextPage } from "next/types";
import { ReactElement, ReactNode, useEffect, useState } from "react";
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
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
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

  const router = useRouter();
  const [userProfile, setUserProfile] = useState<CreateOrRetrieveUserProfile>();
  const [teamList, setTeamList] = useState<CreateOrRetrieveUserTeamList>();
  const [activeTeam, setActiveTeam] = useState<GetTeam>();
  const [formTemplateList, setFormTemplateList] =
    useState<GetTeamFormTemplateList>();

  useEffect(() => {
    (async () => {
      if (!router.isReady) return;

      console.log("_app triggered", new Date());

      const user = (await supabaseClient.auth.getUser()).data.user;
      if (!user) return;

      const promises = [
        createOrRetrieveUserProfile(supabaseClient, user),
        createOrRetrieveUserTeamList(supabaseClient, user.id),
      ];

      const [createdOrRetrievedUser, createdOrRetrievedUserTeamList] =
        await Promise.all(promises);

      setUserProfile(createdOrRetrievedUser as CreateOrRetrieveUserProfile);
      setTeamList(
        createdOrRetrievedUserTeamList as CreateOrRetrieveUserTeamList
      );
      if (router.query.tid) {
        const promises = [
          getTeam(supabaseClient, router.query.tid as string),
          getTeamFormTemplateList(supabaseClient, router.query.tid as string),
        ];
        const [team, formTemplateList] = await Promise.all(promises);
        setActiveTeam(team as GetTeam);
        const formList = formTemplateList as GetTeamFormTemplateList;
        const distinct =
          formList && distinctByKey(formList, "form_fact_form_id");
        setFormTemplateList(distinct as GetTeamFormTemplateList);
      }
    })();
  }, [router]);

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
        <ModalsProvider>
          <SessionContextProvider
            supabaseClient={supabaseClient}
            initialSession={pageProps.initialSession}
          >
            <NotificationsProvider position="top-center">
              <CurrentUserProfileContext.Provider value={userProfile}>
                <CurrentUserTeamListContext.Provider value={teamList}>
                  <ActiveTeamContext.Provider value={activeTeam}>
                    <ActiveTeamFormListContext.Provider
                      value={formTemplateList}
                    >
                      {getLayout(<Component {...pageProps} />)}
                    </ActiveTeamFormListContext.Provider>
                  </ActiveTeamContext.Provider>
                </CurrentUserTeamListContext.Provider>
              </CurrentUserProfileContext.Provider>
            </NotificationsProvider>
          </SessionContextProvider>
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
