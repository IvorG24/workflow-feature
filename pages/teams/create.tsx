import Layout from "@/components/Layout/Layout";
import { createStyles, Text } from "@mantine/core";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement } from "react";

type CreateTeamPageProps = { sampleProp: string };

const useStyles = createStyles((theme) => ({}));

export const getServerSideProps = async () => {
  // const res = await fetch('https://.../data')
  const res = { sampleProp: "sample" };
  // const data: CreateTeamPageProps = await res.json();
  const data: CreateTeamPageProps = res;

  return {
    props: {
      data,
    },
  };
};

const CreateTeamPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ data }) => {
  // will resolve data to type Data
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const { classes, cx } = useStyles();
  return <Text>Resize app to see responsive navbar in action</Text>;
};

export default CreateTeamPage;

CreateTeamPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
