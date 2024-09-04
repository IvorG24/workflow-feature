import { getLatestApiKey } from "@/backend/api/get";
import GenerateKeyPage from "@/components/GenerateKeyPage/GenerateKeyPage";
import Meta from "@/components/Meta/Meta";
import { withOwnerAndRaya } from "@/utils/server-side-protections";
import { ApiKeyData } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withOwnerAndRaya(
  async ({ context, teamId, supabaseClient }) => {
    try {
      const teamName = context.query.teamName as string;

      const latestApiKey = await getLatestApiKey(supabaseClient, {
        teamId: teamId,
      });

      return {
        props: {
          teamName,
          latestApiKeyData: latestApiKey,
        },
      };
    } catch (e) {
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

type Props = {
  teamName: string;
  latestApiKeyData: ApiKeyData[];
};
const Page = ({ teamName, latestApiKeyData }: Props) => {
  return (
    <>
      <Meta description="Genereate Key Page" url="/{teamName}/generate-key" />
      <GenerateKeyPage apiKeyData={latestApiKeyData} teamName={teamName} />
    </>
  );
};

export default Page;
Page.Layout = "APP";
