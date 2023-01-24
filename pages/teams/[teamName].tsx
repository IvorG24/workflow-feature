import Layout from "@/components/Layout/Layout";
import { createStyles } from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { InferGetServerSidePropsType } from "next";
import { ReactElement } from "react";

type TeamPageProps = { sampleProp: string };

const useStyles = createStyles((theme) => ({}));

export const getServerSideProps = async () => {
  // const res = await fetch('https://.../data')
  const res = { sampleProp: "sample" };
  // const data: TeamPageProps = await res.json();
  const data: TeamPageProps = res;

  return {
    props: {
      data,
    },
  };
};

function IndexPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // will resolve data to type Data
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const { classes, cx } = useStyles();

  return <h1>index page {JSON.stringify(data)}</h1>;
}

export default IndexPage;

IndexPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
