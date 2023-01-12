import ActiveTeamContext, {
  ActiveTeamProps,
} from "@/contexts/ActiveTeamContext";
import ActiveTeamFormListContext from "@/contexts/ActiveTeamFormListContext";
import CurrentUserProfileContext from "@/contexts/CurrentUserProfileContext";
import CurrentUserTeamListContext from "@/contexts/CurrentUserTeamListContext";
import FileUrlListContext, { FileUrlList } from "@/contexts/FileUrlListContext";
import getMantineTheme from "@/utils/getMantineTheme";
import {
  createOrRetrieveUserProfile,
  CreateOrRetrieveUserProfile,
  createOrRetrieveUserTeamList,
  CreateOrRetrieveUserTeamList,
  getTeam,
  GetTeam,
  GetTeamFormTemplateList,
  getTeamFormTemplateList,
  GetTeamLogoUrlList,
  getTeamLogoUrlList,
  GetTeamMemberAvatarUrlList,
  getTeamMemberAvatarUrlList,
} from "@/utils/queries-new";
import {
  ColorScheme,
  ColorSchemeProvider,
  LoadingOverlay,
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
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<CreateOrRetrieveUserProfile>();
  const [teamList, setTeamList] = useState<CreateOrRetrieveUserTeamList>([]);
  const [activeTeam, setActiveTeam] = useState<ActiveTeamProps>({
    teamMemberList: [],
    approverIdList: [],
    purchaserIdList: [],
  });
  const currentTeam = { ...activeTeam, setActiveTeam };
  const [formTemplateList, setFormTemplateList] =
    useState<GetTeamFormTemplateList>();
  const [fileUrlList, setFileUrlList] = useState<FileUrlList>({
    avatarUrlList: {},
    teamLogoUrlList: {},
  });

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);

        const user = (await supabaseClient.auth.getUser()).data.user;
        if (!user) return;

        const promises = [
          createOrRetrieveUserProfile(supabaseClient, user),
          createOrRetrieveUserTeamList(supabaseClient, user),
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

          if (!team) return router.push("/");
          if (team && team.length === 0) return router.push("/");

          const activeTeam = {
            teamMemberList: team as GetTeam,
            approverIdList: (team as GetTeam)
              .filter(
                (member) =>
                  member.member_role_id === "owner" ||
                  member.member_role_id === "admin"
              )
              .map((member) => member.user_id),
            purchaserIdList: (team as GetTeam)
              .filter((member) => member.member_role_id === "purchaser")
              .map((member) => member.user_id),
          };

          setActiveTeam(activeTeam as ActiveTeamProps);
          setFormTemplateList(formTemplateList as GetTeamFormTemplateList);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router.query.tid]);

  useEffect(() => {
    (async () => {
      try {
        if (teamList.length === 0) return;
        if (activeTeam.teamMemberList.length === 0) return;

        const teamIdList = teamList.map((team) => team.team_id);
        const teamId = activeTeam.teamMemberList[0].team_id;

        const [teamLogoUrlList, avatarUrlList] = await Promise.all([
          getTeamLogoUrlList(supabaseClient, teamIdList as string[]),
          getTeamMemberAvatarUrlList(supabaseClient, teamId as string),
        ]);

        setFileUrlList({
          teamLogoUrlList: teamLogoUrlList as GetTeamLogoUrlList,
          avatarUrlList: avatarUrlList as GetTeamMemberAvatarUrlList,
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }, [activeTeam, teamList]);

  if (isLoading) return <LoadingOverlay visible={isLoading} overlayBlur={2} />;

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
                  <ActiveTeamContext.Provider value={currentTeam}>
                    <ActiveTeamFormListContext.Provider
                      value={{ formTemplateList, setFormTemplateList }}
                    >
                      <FileUrlListContext.Provider value={fileUrlList}>
                        {getLayout(<Component {...pageProps} />)}
                      </FileUrlListContext.Provider>
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
