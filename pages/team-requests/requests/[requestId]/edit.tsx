import { getRequest } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { RequestWithResponseType } from "@/utils/types";
import { Paper, Title } from "@mantine/core";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, context }) => {
    try {
      const request = await getRequest(supabaseClient, {
        requestId: `${context.query.requestId}`,
      });

      if (!request) {
        return {
          redirect: {
            destination: "/404",
            permanent: false,
          },
        };
      }

      return {
        props: { request },
      };
    } catch (error) {
      console.error(error);
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
  request: RequestWithResponseType;
};

const Page = ({ request }: Props) => {
  return (
    <>
      <Meta
        description="Request Page"
        url="/team-requests/requests/[requestId]"
      />
      <Title>Edit Request Page</Title>
      <Paper p="xl" mt="xl">
        <pre>{JSON.stringify(request, null, 2)}</pre>
      </Paper>
    </>
  );
};

export default Page;
Page.Layout = "APP";
