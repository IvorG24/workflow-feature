import {
  getRequest,
  getUserActiveTeamId,
  getUserTeamMemberData,
} from "@/backend/api/get";
import EditRequestPage from "@/components/EditRequestPage/EditRequestPage";

import Meta from "@/components/Meta/Meta";
import { parseRequest } from "@/utils/arrayFunctions/arrayFunctions";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { RequestWithResponseType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const request = await getRequest(supabaseClient, {
        requestId: `${context.query.requestId}`,
      });

      const teamId = await getUserActiveTeamId(supabaseClient, {
        userId: user.id,
      });
      if (!teamId) throw new Error("No team found");

      // check if the user have access to create request on the form.
      const teamMember = await getUserTeamMemberData(supabaseClient, {
        userId: user.id,
        teamId: teamId,
      });
      if (!teamMember) throw new Error("No team member found");

      const parsedRequest = parseRequest(request);

      return {
        props: { request: parsedRequest },
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
  console.log(request);
  return (
    <>
      <Meta
        description="Edit Request Page"
        url="/team-requests/requests/[requestId]/edit"
      />
      {/* {form.form_is_formsly_form ? formslyForm() : null} */}
      {!request.request_form.form_is_formsly_form ? (
        <EditRequestPage request={request} />
      ) : null}

      {/* <Paper>
        <pre>{JSON.stringify(request, null, 2)}</pre>
      </Paper> */}
    </>
  );
};

export default Page;
Page.Layout = "APP";
