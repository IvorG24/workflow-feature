import { getUserActiveTeamId, getUserTeamMemberData } from "@/backend/api/get";
import EditRequestPage from "@/components/EditRequestPage/EditRequestPage";
import EditRequisitionRequestPage from "@/components/EditRequisitionRequestPage/EditRequisitionRequestPage";

import Meta from "@/components/Meta/Meta";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import {
  OptionTableRow,
  RequestPageOnLoad,
  RequestWithResponseType,
} from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      // const requestData = await getRequest(supabaseClient, {
      //   requestId: `${context.query.requestId}`,
      // });

      const { data } = await supabaseClient.rpc("request_page_on_load", {
        input_data: {
          requestId: context.query.requestId,
          userId: user.id,
        },
      });

      const request = data as unknown as RequestPageOnLoad;

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

      // const request = parseRequest(requestData);

      return {
        props: { request: request.request, org: request },
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
  itemOptions: OptionTableRow[];
  projectOptions?: OptionTableRow[];
  org: RequestWithResponseType;
};

const Page = ({ request, itemOptions, projectOptions = [], org }: Props) => {
  const { request_form: form } = request;
  console.log(org);

  const formslyForm = () => {
    switch (form.form_name) {
      case "Requisition":
        return (
          <EditRequisitionRequestPage
            request={request}
            itemOptions={itemOptions}
            projectOptions={projectOptions}
          />
        );
    }
  };

  return (
    <>
      <Meta
        description="Edit Request Page"
        url="/team-requests/requests/[requestId]/edit"
      />
      {form.form_is_formsly_form ? formslyForm() : null}
      {!form.form_is_formsly_form ? (
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
