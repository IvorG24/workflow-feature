import Layout from "@/components/Layout/Layout";
import { createStyles, Text } from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

type UserAccountSettingsPageProps = { sampleProp: string };

const useStyles = createStyles((theme) => ({}));

export const getServerSideProps = async () => {
  // const res = await fetch('https://.../data')
  const res = { sampleProp: "sample" };
  // const data: UserAccountSettingsPageProps = await res.json();
  const data: UserAccountSettingsPageProps = res;

  return {
    props: {
      data,
    },
  };
};
const UserAccountSettingsPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ data }) => {
  // will resolve data to type Data
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const { classes, cx } = useStyles();

  return <Text>Resize app to see responsive navbar in action</Text>;
};

export default UserAccountSettingsPage;

UserAccountSettingsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
