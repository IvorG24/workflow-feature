import { getTeam, getUserActiveTeamId } from "@/backend/api/get";
import { checkIfEmailExists } from "@/backend/api/post";
import Meta from "@/components/Meta/Meta";
import RequestPage from "@/components/RequestPage/RequestPage";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { RequestWithResponseType } from "@/utils/types";
import { Space } from "@mantine/core";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabaseClient = createPagesServerClient(context);
  try {
    const { data: requestData, error } = await supabaseClient.rpc(
      "get_request",
      {
        request_id: `${context.query.requestId}`,
      }
    );
    if (error) throw error;

    // * 1. Check if there is user active session
    const {
      data: { session },
    } = await supabaseClient.auth.getSession();

    if (session) {
      if (!session?.user?.email) {
        return {
          redirect: {
            destination: "/sign-in",
            permanent: false,
          },
        };
      }

      // * 2. Check if user is onboarded
      if (
        !(await checkIfEmailExists(supabaseClient, {
          email: session.user.email,
        }))
      ) {
        return {
          redirect: {
            destination: "/onboarding",
            permanent: false,
          },
        };
      }

      // * 3. Check if user has active team
      const user = session.user;

      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });

      if (!teamId) {
        return {
          redirect: {
            destination: "/create-team",
            permanent: false,
          },
        };
      }

      const activeTeam = await getTeam(supabaseClient, { teamId });

      if (activeTeam) {
        return {
          redirect: {
            destination: `/${formatTeamNameToUrlKey(
              activeTeam.team_name
            )}/requests/${requestData.request_formsly_id}`,
            permanent: false,
          },
        };
      }
    }

    return {
      props: {
        request: requestData,
      },
    };
  } catch (e) {
    console.error(e);
    return {
      redirect: {
        destination: "/500",
        permanent: false,
      },
    };
  }
};

type Props = {
  request: RequestWithResponseType;
};

const Page = ({ request }: Props) => {
  return (
    <>
      <Meta description="Request Page" url="/<teamName>/requests/[requestId]" />
      <Space h="xl" />
      <RequestPage
        request={request}
        isAnon={true}
        isFormslyForm={request.request_form.form_is_formsly_form}
      />
      <Space h="xl" />
    </>
  );
};

export default Page;
Page.Layout = "HOME";
