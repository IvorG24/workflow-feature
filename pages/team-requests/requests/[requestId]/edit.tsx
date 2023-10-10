import {
  checkIfRequestIsPending,
  getCSICodeOptionsForItems,
  getItem,
  getItemResponseForQuotation,
  getItemResponseForRIR,
  getItemResponseForRO,
  getProjectSignerWithTeamMember,
  getSupplier,
  getUserActiveTeamId,
  getUserTeamMemberData,
} from "@/backend/api/get";
import EditQuotationRequestPage from "@/components/EditQuotationRequestPage/EditQuotationRequestPage";
import EditReceivingInspectingReportPage from "@/components/EditReceivingInspectingReport/EditReceivingInspectingReport";
import EditReleaseOrderPage from "@/components/EditReleaseOrderPage/EditReleaseOrderPage";
import EditRequestPage from "@/components/EditRequestPage/EditRequestPage";
import EditRequisitionRequestPage from "@/components/EditRequisitionRequestPage/EditRequisitionRequestPage";
import EditSourcedItemRequestPage from "@/components/EditSourcedItemRequestPage/EditSourcedItemRequestPage";
import EditTransferReceiptPage from "@/components/EditTransferReceiptPage/EditTransferReceiptPage";

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
      const isPending = await checkIfRequestIsPending(supabaseClient, {
        requestId: `${context.query.requestId}`,
      });
      if (!isPending) throw new Error("Request can't be edited");

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

      const projectSigner = await getProjectSignerWithTeamMember(
        supabaseClient,
        {
          formId: form.form_id,
          projectId: `${request.request_project_id}`,
        }
      );
      const projectSignerList: RequestWithResponseType["request_signer"] =
        projectSigner.map((signer) => ({
          request_signer_id: signer.signer_id,
          request_signer_status: "PENDING",
          request_signer_request_id: request.request_id,
          request_signer_signer_id: signer.signer_id,
          request_signer_status_date_updated: "",
          request_signer_signer: {
            signer_id: signer.signer_id,
            signer_is_primary_signer: signer.signer_is_primary_signer,
            signer_action: signer.signer_action,
            signer_order: signer.signer_order,
            signer_form_id: request.request_form_id,
            signer_team_member: {
              team_member_id: signer.signer_team_member.team_member_id,
              team_member_user: {
                user_id: signer.signer_team_member.team_member_user.user_id,
                user_first_name:
                  signer.signer_team_member.team_member_user.user_first_name,
                user_last_name:
                  signer.signer_team_member.team_member_user.user_last_name,
              },
            },
          },
        }));

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
          request_signer:
            projectSigner.length !== 0
              ? projectSignerList
              : parsedRequest.request_signer,
        };

        return {
          props: {
            request: formattedRequest,
            itemOptions,
            projectOptions,
          },
        };
      }

      // Sourced Item
      if (form.form_name === "Sourced Item") {
        const requisitionId = form.form_section[0].section_field.find(
          (field) => field.field_name === "Requisition ID"
        )?.field_response[0].request_response;

        const items = await getItemResponseForQuotation(supabaseClient, {
          requestId: parseJSONIfValid(`${requisitionId}`),
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

        const itemSectionWithProjectOptions = form.form_section
          .slice(1)
          .map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: itemOptions,
              },
              section.section_field[1],
              {
                ...section.section_field[2],
                field_option: projectOptions.filter(
                  (project) => project.option_id !== request.request_project_id
                ),
              },
            ],
          }));

        const formattedRequest: RequestWithResponseType = {
          ...parsedRequest,
          request_form: {
            ...parsedRequest.request_form,
            form_section: [
              parsedRequest.request_form.form_section[0],
              ...itemSectionWithProjectOptions,
            ],
          },
          request_signer:
            projectSigner.length !== 0
              ? projectSignerList
              : parsedRequest.request_signer,
        };

        return {
          props: {
            request: formattedRequest,
            itemOptions,
            requestingProject: request.request_project.team_project_name,
          },
        };
      }

      // Release Order
      if (form.form_name === "Release Order") {
        const sourcedItemId =
          form.form_section[0].section_field.slice(-1)[0].field_response[0]
            .request_response;

        const items = await getItemResponseForRO(supabaseClient, {
          requestId: parseJSONIfValid(sourcedItemId),
        });

        const sourceProjectList: {
          [key: string]: string;
        } = {};

        const regex = /\(([^()]+)\)/g;
        const itemList = Object.keys(items);
        const newOptionList = itemList.map((item, index) => {
          const itemName = items[item].item;
          const quantity = items[item].quantity;
          const sourceProject = items[item].sourceProject;

          const matches = regex.exec(itemName);
          const unit = matches && matches[1].replace(/\d+/g, "").trim();

          const replace = items[item].item.match(regex);
          if (!replace) return;

          const value = `${itemName.replace(
            replace[0],
            `(${quantity} ${unit}) (${sourceProject})`
          )} `;
          sourceProjectList[value] = items[item].sourceProject;

          return {
            option_description: null,
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        const itemOptions = newOptionList.filter(
          (item) => item?.option_value
        ) as unknown as OptionTableRow[];

        const usedItem = parsedRequest.request_form.form_section
          .slice(1)
          .map((section) =>
            `${parseJSONIfValid(
              section.section_field[0].field_response[0].request_response
            )}`.trim()
          )
          .flat();

        const unusedItemOption = itemOptions.filter(
          (option) => !usedItem.includes(option.option_value.trim())
        );
        const itemSectionWithOptions: RequestWithResponseType["request_form"]["form_section"] =
          parsedRequest.request_form.form_section.slice(1).map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...itemOptions.filter(
                    (option) =>
                      option.option_value ===
                      parseJSONIfValid(
                        section.section_field[0].field_response[0]
                          .request_response
                      )
                  ),
                  ...unusedItemOption,
                ],
              },
              ...section.section_field.slice(1),
            ],
          }));

        const formattedRequest: RequestWithResponseType = {
          ...parsedRequest,
          request_form: {
            ...parsedRequest.request_form,
            form_section: [
              parsedRequest.request_form.form_section[0],
              ...itemSectionWithOptions,
            ],
          },
          request_signer:
            projectSigner.length !== 0
              ? projectSignerList
              : parsedRequest.request_signer,
        };

        return {
          props: {
            request: formattedRequest,
            itemOptions: unusedItemOption,
            originalItemOptions: itemOptions,
            sourceProjectList,
            requestingProject: request.request_project.team_project_name,
          },
        };
      }

      // Transfer Receipt
      if (form.form_name === "Transfer Receipt") {
        const releaseOrderId =
          form.form_section[0].section_field.slice(-1)[0].field_response[0]
            .request_response;

        const items = await getItemResponseForRO(supabaseClient, {
          requestId: parseJSONIfValid(releaseOrderId),
        });

        const sourceProjectList: {
          [key: string]: string;
        } = {};

        const regex = /\(([^()]+)\)/g;
        const itemList = Object.keys(items);
        const newOptionList = itemList.map((item, index) => {
          const itemName = items[item].item;
          const quantity = items[item].quantity;
          const matches = regex.exec(itemName);
          const unit = matches && matches[1].replace(/\d+/g, "").trim();

          const replace = items[item].item.match(regex);
          if (!replace) return;

          const value = `${itemName.replace(
            replace[0],
            `(${quantity} ${unit})`
          )} `;
          sourceProjectList[value] = items[item].sourceProject;

          return {
            option_description: null,
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        const itemOptions = newOptionList.filter(
          (item) => item?.option_value
        ) as unknown as OptionTableRow[];

        const usedItem = parsedRequest.request_form.form_section
          .slice(1)
          .map((section) =>
            `${parseJSONIfValid(
              section.section_field[0].field_response[0].request_response
            )}`.trim()
          )
          .flat();

        const unusedItemOption = itemOptions.filter(
          (option) => !usedItem.includes(option.option_value.trim())
        );
        const itemSectionWithOptions: RequestWithResponseType["request_form"]["form_section"] =
          parsedRequest.request_form.form_section.slice(2).map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...itemOptions.filter(
                    (option) =>
                      option.option_value ===
                      parseJSONIfValid(
                        section.section_field[0].field_response[0]
                          .request_response
                      )
                  ),
                  ...unusedItemOption,
                ],
              },
              ...section.section_field.slice(1),
            ],
          }));

        const formattedRequest: RequestWithResponseType = {
          ...parsedRequest,
          request_form: {
            ...parsedRequest.request_form,
            form_section: [
              parsedRequest.request_form.form_section[0],
              parsedRequest.request_form.form_section[1],
              ...itemSectionWithOptions,
            ],
          },
          request_signer:
            projectSigner.length !== 0
              ? projectSignerList
              : parsedRequest.request_signer,
        };

        return {
          props: {
            request: formattedRequest,
            itemOptions: unusedItemOption,
            originalItemOptions: itemOptions,
            sourceProjectList,
            requestingProject: request.request_project.team_project_name,
          },
        };
      }

      // Quotation
      if (form.form_name === "Quotation") {
        const requisitionId =
          form.form_section[0].section_field.slice(-1)[0].field_response[0]
            .request_response;

        const items = await getItemResponseForQuotation(supabaseClient, {
          requestId: parseJSONIfValid(requisitionId),
        });

        const newOptionList = Object.keys(items).map((item, index) => {
          const value = `${items[item].name} (${items[item].quantity} ${items[item].unit}) (${items[item].description})`;
          return {
            option_description: null,
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value,
          };
        });

        const itemOptions = newOptionList.filter(
          (item) => item?.option_value
        ) as unknown as OptionTableRow[];

        const usedItem = parsedRequest.request_form.form_section
          .slice(3)
          .map((section) =>
            `${parseJSONIfValid(
              section.section_field[0].field_response[0].request_response
            )}`.trim()
          )
          .flat();

        const unusedItemOption = itemOptions.filter(
          (option) => !usedItem.includes(option.option_value.trim())
        );

        const itemSectionWithOptions: RequestWithResponseType["request_form"]["form_section"] =
          parsedRequest.request_form.form_section.slice(3).map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...itemOptions.filter(
                    (option) =>
                      option.option_value ===
                      parseJSONIfValid(
                        section.section_field[0].field_response[0]
                          .request_response
                      )
                  ),
                  ...unusedItemOption,
                ],
              },
              ...section.section_field.slice(1),
            ],
          }));

        const supplierResponse =
          parsedRequest.request_form.form_section[1].section_field[0]
            .field_response[0].request_response;

        const supplierList = await getSupplier(supabaseClient, {
          supplier: parseJSONIfValid(supplierResponse),
          teamId: `${teamMember?.team_member_team_id}`,
          fieldId: form.form_section[1].section_field[0].field_id,
        });

        const formattedRequest: RequestWithResponseType = {
          ...parsedRequest,
          request_form: {
            ...parsedRequest.request_form,
            form_section: [
              parsedRequest.request_form.form_section[0],
              {
                ...parsedRequest.request_form.form_section[1],
                section_field: [
                  {
                    ...parsedRequest.request_form.form_section[1]
                      .section_field[0],
                    field_option: supplierList,
                  },
                  ...parsedRequest.request_form.form_section[1].section_field.slice(
                    1
                  ),
                ],
              },
              parsedRequest.request_form.form_section[2],
              ...itemSectionWithOptions,
            ],
          },
          request_signer:
            projectSigner.length !== 0
              ? projectSignerList
              : parsedRequest.request_signer,
        };

        return {
          props: {
            request: formattedRequest,
            itemOptions: unusedItemOption,
            originalItemOptions: itemOptions,
            requestingProject: request.request_project.team_project_name,
          },
        };
      }
      // Receiving Inspecting Report
      if (form.form_name === "Receiving Inspecting Report") {
        const quotationId =
          form.form_section[0].section_field.slice(-1)[0].field_response[0]
            .request_response;

        const items = await getItemResponseForRIR(supabaseClient, {
          requestId: parseJSONIfValid(quotationId),
        });

        const sourceProjectList: {
          [key: string]: string;
        } = {};

        const regex = /\(([^()]+)\)/g;
        const itemList = Object.keys(items);
        const newOptionList = itemList.map((item, index) => {
          const itemName = items[item].item;
          const quantity = items[item].quantity;
          const replace = items[item].item.match(regex);
          if (!replace) return;
          const value = `${itemName.replace(replace[0], `(${quantity})`)} `;

          return {
            option_description: null,
            option_field_id: form.form_section[1].section_field[0].field_id,
            option_id: item,
            option_order: index,
            option_value: value.trim(),
          };
        });

        const itemOptions = newOptionList.filter(
          (item) => item?.option_value
        ) as unknown as OptionTableRow[];

        const usedItem = parsedRequest.request_form.form_section
          .slice(1)
          .map((section) =>
            `${parseJSONIfValid(
              section.section_field[0].field_response[0].request_response
            )}`.trim()
          )
          .flat();

        const unusedItemOption = itemOptions.filter(
          (option) => !usedItem.includes(option.option_value.trim())
        );
        const itemSectionWithOptions: RequestWithResponseType["request_form"]["form_section"] =
          parsedRequest.request_form.form_section.slice(2).map((section) => ({
            ...section,
            section_field: [
              {
                ...section.section_field[0],
                field_option: [
                  ...itemOptions.filter(
                    (option) =>
                      option.option_value ===
                      parseJSONIfValid(
                        section.section_field[0].field_response[0]
                          .request_response
                      )
                  ),
                  ...unusedItemOption,
                ],
              },
              ...section.section_field.slice(1),
            ],
          }));

        const formattedRequest: RequestWithResponseType = {
          ...parsedRequest,
          request_form: {
            ...parsedRequest.request_form,
            form_section: [
              parsedRequest.request_form.form_section[0],
              parsedRequest.request_form.form_section[1],
              ...itemSectionWithOptions,
            ],
          },
          request_signer:
            projectSigner.length !== 0
              ? projectSignerList
              : parsedRequest.request_signer,
        };

        return {
          props: {
            request: formattedRequest,
            itemOptions: unusedItemOption,
            originalItemOptions: itemOptions,
            sourceProjectList,
            requestingProject: request.request_project.team_project_name,
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
  originalItemOptions?: OptionTableRow[];
  projectOptions?: OptionTableRow[];
  sourceProjectList?: Record<string, string>;
  requestingProject?: string;
};

const Page = ({
  request,
  itemOptions,
  originalItemOptions = [],
  projectOptions = [],
  requestingProject = "",
  sourceProjectList = {},
}: Props) => {
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
      case "Sourced Item":
        return (
          <EditSourcedItemRequestPage
            request={request}
            itemOptions={itemOptions}
            requestingProject={requestingProject}
          />
        );
      case "Release Order":
        return (
          <EditReleaseOrderPage
            request={request}
            itemOptions={itemOptions}
            originalItemOptions={originalItemOptions}
            sourceProjectList={sourceProjectList}
            requestingProject={requestingProject}
          />
        );
      case "Transfer Receipt":
        return (
          <EditTransferReceiptPage
            request={request}
            itemOptions={itemOptions}
            originalItemOptions={originalItemOptions}
            sourceProjectList={sourceProjectList}
            requestingProject={requestingProject}
          />
        );
      case "Quotation":
        return (
          <EditQuotationRequestPage
            request={request}
            itemOptions={itemOptions}
            originalItemOptions={originalItemOptions}
            requestingProject={requestingProject}
          />
        );
      case "Receiving Inspecting Report":
        return (
          <EditReceivingInspectingReportPage
            request={request}
            itemOptions={itemOptions}
            originalItemOptions={originalItemOptions}
            requestingProject={requestingProject}
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
