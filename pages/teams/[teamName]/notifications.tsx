import Layout from "@/components/Layout/Layout";
import { createStyles, Text } from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { InferGetServerSidePropsType } from "next";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../_app";

type NotificationListPageProps = { sampleProp: string };

const useStyles = createStyles((theme) => ({}));

export const getServerSideProps = async () => {
  // const res = await fetch('https://.../data')
  const res = { sampleProp: "sample" };
  // const data: NotificationListPageProps = await res.json();
  const data: NotificationListPageProps = res;

  return {
    props: {
      data,
    },
  };
};

const NotificationListPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ data }) => {
  // will resolve data to type Data
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const { classes, cx } = useStyles();

  return <Text>Resize app to see responsive navbar in action</Text>;
};

export default NotificationListPage;

NotificationListPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
