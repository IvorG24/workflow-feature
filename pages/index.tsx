import Layout from "@/components/Layout/Layout";
import { getTeamMemberList } from "@/utils/queries";
import { createStyles, JsonInput } from "@mantine/core";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { ReactElement } from "react";
import { NextPageWithLayout } from "./_app";

type IndexPageProps = { sampleProp: string };

const useStyles = createStyles((theme) => ({}));

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const teamName = `${ctx.query?.teamName}`;

  const teamMemberList = await getTeamMemberList(supabaseClient, teamName);

  return {
    props: {
      teamMemberList,
    },
  };
}

const IndexPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ teamMemberList }) => {
  return (
    <JsonInput
      label="Your package.json"
      placeholder="Textarea will autosize to fit the content"
      validationError="Invalid json"
      formatOnBlur
      autosize
      value={JSON.stringify(teamMemberList)}
      minRows={4}
    />
  );
};

export default IndexPage;

IndexPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
