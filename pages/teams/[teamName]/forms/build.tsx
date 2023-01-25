import Layout from "@/components/Layout/Layout";
import { createStyles, Text } from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

type BuildFormPageProps = { sampleProp: string };

const useStyles = createStyles((theme) => ({}));

export const getServerSideProps = async () => {
  // const res = await fetch('https://.../data')
  const res = { sampleProp: "sample" };
  // const data: BuildFormPageProps = await res.json();
  const data: BuildFormPageProps = res;

  return {
    props: {
      data,
    },
  };
};

const BuildFormPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ data }) => {
  // will resolve data to type Data
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const { classes, cx } = useStyles();

  return <Text>Resize app to see responsive navbar in action</Text>;
};

export default BuildFormPage;

BuildFormPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
