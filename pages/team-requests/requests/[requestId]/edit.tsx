import {
  getCSICodeOptionsForItems,
  getItem,
  getItemResponseForQuotation,
  getProjectSignerWithTeamMember,
  getRequest,
  getRequestProjectIdAndName,
  getUserActiveTeamId,
  getUserTeamMemberData,
} from "@/backend/api/get";
import EditRequestPage from "@/components/EditRequestPage/EditRequestPage";
import EditRequisitionRequestPage from "@/components/EditRequisitionRequestPage/EditRequisitionRequestPage";

import Meta from "@/components/Meta/Meta";
import {
  parseItemSection,
  parseRequest,
} from "@/utils/arrayFunctions/arrayFunctions";
import { withAuthAndOnboarding } from "@/utils/server-side-protections";
import { parseJSONIfValid } from "@/utils/string";
import { OptionTableRow, RequestWithResponseType } from "@/utils/types";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = withAuthAndOnboarding(
  async ({ supabaseClient, user, context }) => {
    try {
      const { data: requestData, error: requestDataError } =
        await supabaseClient.rpc("get_request", {
          request_id: `${context.query.requestId}`,
        });
      if (requestDataError) throw requestDataError;
      const request = requestData as RequestWithResponseType;

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

      let requestProjectId = "";
      if (context.query.requisitionId) {
        const request = await getRequest(supabaseClient, {
          requestId: `${context.query.requisitionId}`,
        });
        requestProjectId = `${request.request_project_id}`;
      } else if (context.query.withdrawalSlipId) {
        const request = await getRequest(supabaseClient, {
          requestId: `${context.query.withdrawalSlipId}`,
        });
        requestProjectId = `${request.request_project_id}`;
      }

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

      const parsedRequest = parseRequest(request);

      const { request_form: form } = parsedRequest;

      if (!form.form_is_formsly_form)
        return {
          props: { request: parsedRequest },
        };

      // Requisition Form
      if (form.form_name === "Requisition") {
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

        const sectionWithDuplicateList = form.form_section
          .slice(1)
          .map((section) => parseItemSection(section));

        const itemSectionList = (await Promise.all(
          sectionWithDuplicateList.map(async (section) => {
            const itemName = parseJSONIfValid(
              section.section_field[0].field_response[0].request_response
            );
            const item = await getItem(supabaseClient, {
              teamId,
              itemName,
            });

            const csiCodeList = await getCSICodeOptionsForItems(
              supabaseClient,
              {
                divisionIdList: item.item_division_id_list,
              }
            );
            const csiCodeOptions = csiCodeList.map((csiCode, index) => {
              return {
                option_description: null,
                option_field_id: form.form_section[0].section_field[0].field_id,
                option_id: csiCode.csi_code_id,
                option_order: index,
                option_value: csiCode.csi_code_level_three_description,
              };
            });

            const descriptionList = section.section_field.slice(5);
            const newFieldsWithOptions = item.item_description.map(
              (description) => {
                const options = description.item_description_field.map(
                  (options, optionIndex) => {
                    return {
                      option_description: null,
                      option_field_id: description.item_field.field_id,
                      option_id: options.item_description_field_id,
                      option_order: optionIndex + 1,
                      option_value: `${options.item_description_field_value}${
                        options.item_description_field_uom
                          ? ` ${options.item_description_field_uom}`
                          : ""
                      }`,
                    };
                  }
                );

                const field = descriptionList.find(
                  (refDescription) =>
                    refDescription.field_id === description.item_field.field_id
                );

                return {
                  ...field,
                  field_option: options,
                };
              }
            );

            return {
              ...section,
              section_field: [
                {
                  ...section.section_field[0],
                  field_option: itemOptions,
                },
                ...section.section_field.slice(1, 4),
                {
                  ...section.section_field[4],
                  field_option: csiCodeOptions,
                },
                ...section.section_field.slice(5, 9),
                ...newFieldsWithOptions,
              ],
            };
          })
        )) as RequestWithResponseType["request_form"]["form_section"];

        const formattedRequest: RequestWithResponseType = {
          ...parsedRequest,
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
              ...itemSectionList,
            ],
          },
        };

        return {
          props: {
            request: formattedRequest,
            itemOptions,
            projectOptions,
          },
        };
      }

      const project = await getRequestProjectIdAndName(supabaseClient, {
        requestId: `${
          context.query.requisitionId
            ? context.query.requisitionId
            : context.query.withdrawalSlipId
        }`,
      });

      if (!project) throw new Error();
      const formattedProject = project as unknown as {
        team_project_id: string;
        team_project_name: string;
      };

      const projectSigner = await getProjectSignerWithTeamMember(
        supabaseClient,
        {
          formId: form.form_id,
          projectId: `${formattedProject.team_project_id}`,
        }
      );
      // Sourced Item
      if (form.form_name === "Sourced Item") {
        const items = await getItemResponseForQuotation(supabaseClient, {
          requestId: `${context.query.requisitionId}`,
        });

        const itemOptions = Object.keys(items).map((item, index) => {
          const value = `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`;

          return {
            option_description: null,
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        const formattedRequest: RequestWithResponseType = {
          ...parsedRequest,
          request_form: {
            ...form,
            form_section: [
              form.form_section[0],
              {
                ...form.form_section[1],
                section_field: [
                  ...form.form_section[1].section_field.slice(0, 2),
                  {
                    ...form.form_section[1].section_field[2],
                    field_option: projectOptions.filter(
                      (project) =>
                        project.option_description !== requestProjectId
                    ),
                  },
                ],
              },
            ],
          },
          request_signer:
            projectSigner.length !== 0 ? [] : request.request_signer,
        };

        return {
          props: {
            request: formattedRequest,
            itemOptions,
            requestProjectId,
            requestingProject: formattedProject.team_project_name,
          },
        };
      }

      return {
        props: {
          request: parsedRequest,
        },
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
  sourceProjectList?: Record<string, string>;
  requestProjectId: string;
  requestingProject?: string;
};

const Page = ({ request, itemOptions = [], projectOptions = [] }: Props) => {
  const { request_form: form } = request;
  console.log(request);

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
