import {
  getCSICode,
  getCSICodeOptions,
  getITAssetItemOptions,
  getItem,
  getLevelThreeDescription,
  getNonDuplictableSectionResponse,
  getProjectSignerWithTeamMember,
} from "@/backend/api/get";
import { createRequest, editRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { FETCH_OPTION_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { safeParse } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  CSICodeTableRow,
  FormType,
  FormWithResponseType,
  ItemWithDescriptionAndField,
  OptionTableRow,
  RequestResponseTableRow,
  RequestTableRow,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Flex,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";

export type Section = FormWithResponseType["form_section"][0];
export type Field = FormType["form_section"][0]["section_field"][0];

export type RequestFormValues = {
  sections: Section[];
};

export type FieldWithResponseArray = Field & {
  field_response: RequestResponseTableRow[];
};

type Props = {
  form: FormType;
  projectOptions: OptionTableRow[];
  requestId: string;
};

const EditITAssetRequestPage = ({ form, projectOptions, requestId }: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const requestorProfile = useUserProfile();
  const team = useActiveTeam();

  const isReferenceOnly = Boolean(router.query.referenceOnly);

  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };

  const requestFormMethods = useForm<RequestFormValues>({ mode: "onChange" });
  const { handleSubmit, control, setValue, unregister, getValues } =
    requestFormMethods;
  const {
    fields: formSections,
    replace: replaceSection,
    update: updateSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const [initialRequestDetails, setInitialRequestDetails] =
    useState<RequestFormValues>();
  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [signerList, setSignerList] = useState(
    form.form_signer.map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
    }))
  );
  const [loadingFieldList, setLoadingFieldList] = useState<
    { sectionIndex: number; fieldIndex: number }[]
  >([]);

  const onSubmit = async (data: RequestFormValues) => {
    if (isFetchingSigner) {
      notifications.show({
        message: "Wait until all signers are fetched before submitting.",
        color: "orange",
      });
      return;
    }
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      setIsLoading(true);

      const response = data.sections[0].section_field[0]
        .field_response as string;

      const projectId = data.sections[0].section_field[0].field_option.find(
        (option) => option.option_value === response
      )?.option_id as string;

      let request: RequestTableRow;
      if (isReferenceOnly) {
        request = await createRequest(supabaseClient, {
          requestFormValues: data,
          formId: form.form_id,
          teamMemberId: teamMember.team_member_id,
          signers: signerList,
          teamId: teamMember.team_member_team_id,
          requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
          formName: form.form_name,
          isFormslyForm: true,
          projectId,
          teamName: formatTeamNameToUrlKey(team.team_name ?? ""),
        });
      } else {
        request = await editRequest(supabaseClient, {
          requestId,
          requestFormValues: data,
          signers: signerList,
          teamId: teamMember.team_member_team_id,
          requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
          formName: form.form_name,
          teamName: formatTeamNameToUrlKey(team.team_name ?? ""),
        });
      }

      notifications.show({
        message: `Request ${isReferenceOnly ? "created" : "edited"}.`,
        color: "green",
      });

      router.push(
        `/${formatTeamNameToUrlKey(team.team_name ?? "")}/requests/${
          request.request_formsly_id_prefix
        }-${request.request_formsly_id_serial}`
      );
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSigner = () => {
    setSignerList(
      form.form_signer.map((signer) => ({
        ...signer,
        signer_action: signer.signer_action.toUpperCase(),
      }))
    );
  };

  const handleProjectNameChange = async (value: string | null) => {
    try {
      setIsFetchingSigner(true);
      if (value) {
        const projectId = projectOptions.find(
          (option) => option.option_value === value
        )?.option_id;
        if (projectId) {
          const data = await getProjectSignerWithTeamMember(supabaseClient, {
            projectId,
            formId: form.form_id,
          });
          if (data.length !== 0) {
            setSignerList(data as unknown as FormType["form_signer"]);
          } else {
            resetSigner();
          }
        }
      } else {
        resetSigner();
      }
    } catch (e) {
      setValue(`sections.0.section_field.0.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingSigner(false);
    }
  };

  const handleResetRequest = () => {
    unregister(`sections.${0}`);
    replaceSection(initialRequestDetails ? initialRequestDetails.sections : []);
    handleProjectNameChange(
      initialRequestDetails?.sections[0].section_field[0]
        .field_response as string
    );
  };

  const handleCSICodeChange = async (index: number, value: string | null) => {
    const newSection = getValues(`sections.${index}`);

    try {
      if (value) {
        setLoadingFieldList([
          { sectionIndex: index, fieldIndex: 5 },
          { sectionIndex: index, fieldIndex: 6 },
          { sectionIndex: index, fieldIndex: 7 },
          { sectionIndex: index, fieldIndex: 8 },
        ]);
        const csiCode = await getCSICode(supabaseClient, { csiCode: value });

        const generalField = [
          ...newSection.section_field.slice(0, 5),
          {
            ...newSection.section_field[5],
            field_response: csiCode?.csi_code_section,
          },
          {
            ...newSection.section_field[6],
            field_response: csiCode?.csi_code_division_description,
          },
          {
            ...newSection.section_field[7],
            field_response: csiCode?.csi_code_level_two_major_group_description,
          },
          {
            ...newSection.section_field[8],
            field_response: csiCode?.csi_code_level_two_minor_group_description,
          },
        ];

        updateSection(index, {
          ...newSection,
          section_field: [
            ...generalField.map((field) => {
              return {
                ...field,
                field_section_duplicatable_id: undefined,
              };
            }),
          ],
        });
      } else {
        const generalField = [
          ...newSection.section_field.slice(0, 4),
          ...newSection.section_field.slice(4, 8).map((field) => {
            return {
              ...field,
              field_response: "",
            };
          }),
          ...newSection.section_field.slice(8),
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.4.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setLoadingFieldList([]);
    }
  };

  const handleGeneralNameChange = async (
    index: number,
    value: string | null
  ) => {
    const newSection = getValues(`sections.${index}`);
    try {
      if (value) {
        setLoadingFieldList([
          { sectionIndex: index, fieldIndex: 1 },
          { sectionIndex: index, fieldIndex: 3 },
          { sectionIndex: index, fieldIndex: 4 },
        ]);
        const item = await getItem(supabaseClient, {
          teamId: team.team_id,
          itemName: value,
        });
        const isWithDescription = Boolean(item.item_level_three_description);
        const csiCodeList = await fetchCSIOptions({
          itemWithLevelThreeDescription: item.item_level_three_description,
          itemDivisionIdList: item.item_division_id_list,
        });
        const generalField = [
          { ...newSection.section_field[0] },
          { ...newSection.section_field[1], field_response: item.item_unit },
          { ...newSection.section_field[2] },
          {
            ...newSection.section_field[3],
            field_response: item.item_gl_account,
          },
          {
            ...newSection.section_field[4],
            field_response: isWithDescription
              ? csiCodeList[0].csi_code_level_three_description
              : "",
            field_option: csiCodeList.map((csiCode, index) => ({
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: csiCode.csi_code_id,
              option_order: index,
              option_value: csiCode.csi_code_level_three_description,
            })),
          },
          ...newSection.section_field.slice(5, 8).map((field) => {
            if (isWithDescription) {
              switch (field.field_name) {
                case "CSI Code":
                  return {
                    ...field,
                    field_response: csiCodeList[0].csi_code_section,
                  };
                case "Division Description":
                  return {
                    ...field,
                    field_response:
                      csiCodeList[0].csi_code_division_description,
                  };
                case "Level 2 Major Group Description":
                  return {
                    ...field,
                    field_response:
                      csiCodeList[0].csi_code_level_two_major_group_description,
                  };
                case "Level 2 Minor Group Description":
                  return {
                    ...field,
                    field_response:
                      csiCodeList[0].csi_code_level_two_minor_group_description,
                  };
                default:
                  return { ...field, field_response: "" };
              }
            } else {
              return { ...field, field_response: "" };
            }
          }),
        ];
        if (value.toLowerCase() === "ink") {
          generalField.push(form.form_section[1].section_field[9]);
        }
        const newFields = item.item_description.map((description) => {
          const options = description.item_description_field.map(
            (options, optionIndex) => ({
              option_field_id: description.item_field.field_id,
              option_id: options.item_description_field_id,
              option_order: optionIndex + 1,
              option_value: `${options.item_description_field_value}${
                description.item_description_is_with_uom
                  ? ` ${options.item_description_field_uom[0].item_description_field_uom}`
                  : ""
              }`,
            })
          );
          const index = options.findIndex(
            (value) => value.option_value === "Any"
          );
          if (index !== -1) {
            const anyOption = options[index];
            options.splice(index, 1);
            options.unshift({ ...anyOption });
          }
          return {
            ...description.item_field,
            field_section_duplicatable_id: undefined,
            field_option: options,
            field_response: index !== -1 ? "Any" : "",
          };
        });
        updateSection(index, {
          ...newSection,
          section_field: [
            ...generalField.map((field) => ({
              ...field,
              field_section_duplicatable_id: undefined,
            })),
            ...newFields,
          ],
        });
      } else {
        const generalField = [
          newSection.section_field[0],
          { ...newSection.section_field[1], field_response: "" },
          newSection.section_field[2],
          ...newSection.section_field.slice(3, 8).map((field) => ({
            ...field,
            field_response: "",
            field_option: [],
          })),
          newSection.section_field[8],
        ];
        updateSection(index, {
          ...newSection,
          section_field: generalField,
        });
      }
    } catch (e) {
      setValue(`sections.${index}.section_field.0.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setLoadingFieldList([]);
    }
  };

  const fetchCSIOptions = async ({
    itemWithLevelThreeDescription,
    itemDivisionIdList,
  }: {
    itemWithLevelThreeDescription: string | undefined;
    itemDivisionIdList: ItemWithDescriptionAndField["item_division_id_list"];
  }) => {
    let csiCodeList: CSICodeTableRow[] = [];
    if (itemWithLevelThreeDescription) {
      csiCodeList = await getLevelThreeDescription(supabaseClient, {
        levelThreeDescription: itemWithLevelThreeDescription,
      });
    } else {
      let index = 0;
      const csiOptionList: CSICodeTableRow[] = [];
      while (true) {
        const csiData = await getCSICodeOptions(supabaseClient, {
          index,
          limit: FETCH_OPTION_LIMIT,
          divisionIdList: itemDivisionIdList,
        });
        csiOptionList.push(...(csiData as CSICodeTableRow[]));
        if (csiData.length < FETCH_OPTION_LIMIT) break;
        index += FETCH_OPTION_LIMIT;
      }
      csiCodeList = csiOptionList;
    }
    return csiCodeList;
  };

  const fetchItemOptions = async () => {
    let index = 0;
    const itemOptionList: OptionTableRow[] = [];
    while (true) {
      const itemData = await getITAssetItemOptions(supabaseClient, {
        teamId: team.team_id,
        index,
        limit: FETCH_OPTION_LIMIT,
      });
      const itemOptions = itemData.map((item, index) => ({
        option_field_id: form.form_section[1].section_field[0].field_id,
        option_id: item.item_id,
        option_order: index,
        option_value: item.item_general_name,
      }));
      itemOptionList.push(...itemOptions);
      if (itemData.length < FETCH_OPTION_LIMIT) break;
      index += FETCH_OPTION_LIMIT;
    }
    return itemOptionList;
  };

  const fetchNonDuplicatableSectionResponse = async (sectionIndex: number) => {
    const fieldResponseList = await getNonDuplictableSectionResponse(
      supabaseClient,
      {
        requestId,
        fieldIdList: form.form_section[sectionIndex].section_field.map(
          (field) => field.field_id
        ),
      }
    );
    const sectionWithFieldResponse = {
      ...form.form_section[sectionIndex],
      section_field: form.form_section[sectionIndex].section_field.map(
        (field) => {
          const fieldResponse = fieldResponseList.find(
            (response) => response.request_response_field_id === field.field_id
          )?.request_response;

          return {
            ...field,
            field_response: safeParse(`${fieldResponse}`),
          };
        }
      ),
    };

    return sectionWithFieldResponse;
  };

  const fetchInitialRequestDetails = async () => {
    try {
      setIsLoading(true);
      if (!team.team_id) return;

      const requestDetailsSection = await fetchNonDuplicatableSectionResponse(
        0
      );
      const assigneeInformationSectionField =
        await fetchNonDuplicatableSectionResponse(2);
      const itemSection = await fetchNonDuplicatableSectionResponse(1);
      const itemSectionFieldList = itemSection.section_field;
      const itemGeneralName = safeParse(itemSectionFieldList[0].field_response);
      const item = await getItem(supabaseClient, {
        teamId: team.team_id,
        itemName: itemGeneralName,
      });

      const csiCodeList = await fetchCSIOptions({
        itemWithLevelThreeDescription: item.item_level_three_description,
        itemDivisionIdList: item.item_division_id_list,
      });
      const itemOptionList = await fetchItemOptions();

      const itemGeneralField = itemSectionFieldList.slice(0, 9).map((field) => {
        if (field.field_name === "General Name") {
          return {
            ...field,
            field_option: itemOptionList,
          };
        } else if (field.field_name === "CSI Code Description") {
          return {
            ...field,
            field_option: csiCodeList.map((csiCode, index) => ({
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: csiCode.csi_code_id,
              option_order: index,
              option_value: csiCode.csi_code_level_three_description,
            })),
          };
        } else {
          return field;
        }
      });

      if (itemGeneralName.toLowerCase() === "ink") {
        itemGeneralField.push(itemSectionFieldList[9]);
      }

      const itemConditionalField = item.item_description.map((description) => {
        const options = description.item_description_field.map(
          (options, optionIndex) => ({
            option_field_id: description.item_field.field_id,
            option_id: options.item_description_field_id,
            option_order: optionIndex + 1,
            option_value: `${options.item_description_field_value}${
              description.item_description_is_with_uom
                ? ` ${options.item_description_field_uom[0].item_description_field_uom}`
                : ""
            }`,
          })
        );

        const index = options.findIndex(
          (value) => value.option_value === "Any"
        );
        if (index !== -1) {
          const anyOption = options[index];
          options.splice(index, 1);
          options.unshift({ ...anyOption });
        }

        const fieldResponse = itemSectionFieldList.find(
          (response) => response.field_id === description.item_field.field_id
        );

        return {
          ...description.item_field,
          field_section_duplicatable_id: undefined,
          field_option: options,
          field_response: fieldResponse
            ? safeParse(fieldResponse.field_response)
            : "",
        };
      });

      handleProjectNameChange(
        requestDetailsSection.section_field[0].field_response
      );

      const finalInitialRequestDetails = [
        requestDetailsSection,
        {
          ...form.form_section[1],
          section_field: [...itemGeneralField, ...itemConditionalField],
        },
        assigneeInformationSectionField,
      ];
      replaceSection(finalInitialRequestDetails);
      setInitialRequestDetails({ sections: finalInitialRequestDetails });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (team.team_id) {
      fetchInitialRequestDetails();
    }
  }, [team]);

  return (
    <Container>
      <Title order={2} color="dimmed">
        {isReferenceOnly ? "Create" : "Edit"} Request
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
            {formSections.map((section, idx) => {
              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    formslyFormName={form.form_name}
                    itAssetRequestFormMethods={{
                      onProjectNameChange: handleProjectNameChange,
                      onGeneralNameChange: handleGeneralNameChange,
                      onCSICodeChange: handleCSICodeChange,
                    }}
                    isEdit={!isReferenceOnly}
                    loadingFieldList={loadingFieldList}
                  />
                </Box>
              );
            })}
            <RequestFormSigner signerList={signerList} />
            <Flex direction="column" gap="sm">
              <Button
                variant="outline"
                color="red"
                onClick={handleResetRequest}
              >
                Reset
              </Button>
              <Button type="submit">Submit</Button>
            </Flex>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default EditITAssetRequestPage;
