import { Text } from "@mantine/core";
import { getCookie } from "cookies-next";
import NextApp, { AppContext } from "next/app";

export default function App() {
  // props: PageWithLayoutProps & { colorScheme: ColorScheme }
  // const { Component, pageProps } = props;

  // const activeApp = useActiveApp();
  // const isLoading = useIsLoading();

  // const [supabaseClient] = useState(() => createPagesBrowserClient());
  // const [colorScheme, setColorScheme] = useState<ColorScheme>(
  //   props.colorScheme
  // );

  // const Layout =
  //   Layouts[Component.Layout] ?? (({ children }) => <>{children}</>);

  // const toggleColorScheme = (value?: ColorScheme) => {
  //   const nextColorScheme =
  //     value || (colorScheme === "dark" ? "light" : "dark");
  //   setColorScheme(nextColorScheme);
  //   setCookie("mantine-color-scheme", nextColorScheme, {
  //     maxAge: 60 * 60 * 24 * 30,
  //   });
  // };
  return <Text>Formsly is temporarily paused</Text>;
  // return (
  //   <ColorSchemeProvider
  //     colorScheme={colorScheme}
  //     toggleColorScheme={toggleColorScheme}
  //   >
  //     <MantineProvider
  //       withGlobalStyles
  //       withNormalizeCSS
  //       theme={{
  //         colorScheme,
  //         primaryColor: activeApp === "REVIEW" ? "green" : "blue",
  //       }}
  //     >
  //       <ModalsProvider>
  //         <RouterTransition />

  //         <Notifications />
  //         <SessionContextProvider
  //           supabaseClient={supabaseClient}
  //           initialSession={pageProps.initialSession}
  //         >
  //           <Layout>
  //             <LoadingOverlay
  //               visible={isLoading}
  //               overlayBlur={2}
  //               sx={{ position: "fixed" }}
  //             />
  //             <Component {...pageProps} />
  //             <SpeedInsights />
  //           </Layout>
  //         </SessionContextProvider>
  //       </ModalsProvider>
  //     </MantineProvider>
  //   </ColorSchemeProvider>
  // );
}

App.getInitialProps = async (appContext: AppContext) => {
  const appProps = await NextApp.getInitialProps(appContext);
  return {
    ...appProps,
    colorScheme: getCookie("mantine-color-scheme", appContext.ctx) || "dark",
  };
};
