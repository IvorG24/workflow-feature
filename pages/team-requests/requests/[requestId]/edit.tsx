import {
  getRequest,
  getUserActiveTeamId,
  getUserTeamMemberData,
} from "@/backend/api/get";
import EditRequestPage from "@/components/EditRequestPage/EditRequestPage";
import EditRequisitionRequestPage from "@/components/EditRequisitionRequestPage/EditRequisitionRequestPage";

import Meta from "@/components/Meta/Meta";
import { parseRequest } from "@/utils/arrayFunctions/arrayFunctions";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { OptionTableRow, RequestWithResponseType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const requestData = await getRequest(supabaseClient, {
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

      const request = parseRequest(requestData);
      const { request_form: form } = request;

      const { data: itemList, error: itemListError } = await supabaseClient
        .from("item_table")
        .select("*, item_description: item_description_table(*)")
        .eq("item_team_id", teamId)
        .eq("item_is_disabled", false)
        .eq("item_is_available", true)
        .order("item_general_name", { ascending: true });
      if (itemListError) throw itemListError;

      const itemOptions = itemList.map((item, index) => {
        return {
          option_description: null,
          option_field_id:
            request.request_form.form_section[1].section_field[0].field_id,
          option_id: item.item_id,
          option_order: index,
          option_value: item.item_general_name,
        };
      });

      const { data: projectList, error: projectListError } =
        await supabaseClient
          .from("team_project_table")
          .select(
            "*, team_project_member: team_project_member_table!inner(team_member_id)"
          )
          .eq("team_project_team_id", teamId)
          .eq("team_project_member.team_member_id", teamMember.team_member_id)
          .eq("team_project_is_disabled", false);
      if (projectListError) throw projectListError;

      const projectOptions = projectList.map((project, index) => {
        return {
          option_description: null,
          option_field_id:
            request.request_form.form_section[0].section_field[0].field_id,
          option_id: project.team_project_id,
          option_order: index,
          option_value: project.team_project_name,
        };
      });

      if (form.form_is_formsly_form) {
        // Requisition Form
        if (form.form_name === "Requisition") {
          return {
            props: {
              request: {
                ...request,
                request_form: {
                  ...form,
                  form_section: [
                    {
                      ...form.form_section[0],
                      section_field: [
                        {
                          ...form.form_section[0].section_field[0],
                          field_option: projectOptions,
                        },
                        ...form.form_section[0].section_field.slice(1),
                      ],
                    },
                    {
                      ...form.form_section[1],
                      section_field: [
                        ...form.form_section[1].section_field.slice(0, 4),
                      ],
                    },
                  ],
                },
              },
              itemOptions,
              projectOptions,
            },
          };
        }
      } else {
        return {
          props: { request },
        };
      }
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
};

const Page = ({ request, itemOptions = [], projectOptions = [] }: Props) => {
  const { request_form: form } = request;

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
