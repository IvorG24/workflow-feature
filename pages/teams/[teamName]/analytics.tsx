import Layout from "@/components/Layout/Layout";
import { createStyles } from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

type AnalyticsPageProps = { sampleProp: string };

const useStyles = createStyles((theme) => ({}));

export const getServerSideProps = async () => {
  // const res = await fetch('https://.../data')
  const res = { sampleProp: "sample" };
  // const data: AnalyticsPageProps = await res.json();
  const data: AnalyticsPageProps = res;

  return {
    props: {
      data,
    },
  };
};
const AnalyticsPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ data }) => {
  // will resolve data to type Data
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const { classes, cx } = useStyles();

  return <h1>index page {JSON.stringify(data)}</h1>;
};

export default AnalyticsPage;

AnalyticsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
