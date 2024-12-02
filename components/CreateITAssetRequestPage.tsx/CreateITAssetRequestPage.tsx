import {
  getEmployeeName,
  getITAssetItemOptions,
  getItem,
  getProjectSignerWithTeamMember,
} from "@/backend/api/get";
import { createModuleRequest, createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { FETCH_OPTION_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  ItemCategoryType,
  OptionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import {
  Alert,
  Box,
  Button,
  Container,
  Flex,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import InvalidSignerNotification from "../InvalidSignerNotification/InvalidSignerNotification";

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
  type?: "Request" | "Module Request";
};

const CreateITAssetRequestPage = ({
  form,
  projectOptions,
  type = "Request",
}: Props) => {
  const router = useRouter();
  const moduleId = router.query.moduleId as string;
  const moduleRequestId = router.query.moduleRequestId as string;
  const formId = router.query.formId as string;

  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const activeTeam = useActiveTeam();
  const requestorProfile = useUserProfile();

  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
    form_module_name: form?.form_module_name,
  };

  const requestFormMethods = useForm<RequestFormValues>({ mode: "onChange" });
  const { handleSubmit, control, setValue, getValues } = requestFormMethods;
  const {
    fields: formSections,
    insert: insertSection,
    remove: removeSection,
    replace: replaceSection,
    update: updateSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [itemOptions, setItemOptions] = useState<OptionTableRow[]>([]);
  const [signerList, setSignerList] = useState(
    form.form_signer.map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
    }))
  );
  const [loadingFieldList, setLoadingFieldList] = useState<
    { sectionIndex: number; fieldIndex: number }[]
  >([]);
  const [itemCategoryList, setItemCategoryList] = useState<
    (ItemCategoryType["item_category"] | null)[]
  >([null]);

  const handleCreateRequest = async (data: RequestFormValues) => {
    if (isFetchingSigner) {
      notifications.show({
        message: "Wait until all signers are fetched before submitting.",
        color: "orange",
      });
      return;
    }

    if (signerList.length === 0) {
      notifications.show({
        message: "Primary signer is required",
        color: "orange",
      });
      return;
    }

    try {
      if (!requestorProfile || !teamMember) return;

      setIsLoading(true);

      const response = data.sections[0].section_field[0]
        .field_response as string;

      const projectId = data.sections[0].section_field[0].field_option.find(
        (option) => option.option_value === response
      )?.option_id as string;

      switch (type) {
        case "Request":
          const additionalSignerList: FormType["form_signer"] = [];
          const alreadyAddedAdditionalSigner: string[] = signerList.map(
            (signer) => signer.signer_team_member.team_member_id
          );

          itemCategoryList.forEach((itemCategory) => {
            if (!itemCategory) return;
            if (
              alreadyAddedAdditionalSigner.includes(
                itemCategory.item_category_signer.signer_team_member
                  .team_member_id
              )
            )
              return;
            alreadyAddedAdditionalSigner.push(
              itemCategory.item_category_signer.signer_team_member
                .team_member_id
            );
            additionalSignerList.push(itemCategory.item_category_signer);
          });
          if (![...signerList, ...additionalSignerList].length) {
            notifications.show({
              title: "There's no assigned signer.",
              message: <InvalidSignerNotification />,
              color: "orange",
              autoClose: false,
            });
            return;
          }

          const request = await createRequest(supabaseClient, {
            requestFormValues: data,
            formId,
            teamMemberId: teamMember.team_member_id,
            signers: [...signerList, ...additionalSignerList],
            teamId: teamMember.team_member_team_id,
            requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
            formName: form.form_name,
            isFormslyForm: true,
            projectId,
            teamName: formatTeamNameToUrlKey(activeTeam.team_name ?? ""),
            userId: requestorProfile.user_id,
          });

          notifications.show({
            message: "Request created.",
            color: "green",
          });

          await router.push(
            `/${formatTeamNameToUrlKey(activeTeam.team_name ?? "")}/requests/${
              request.request_formsly_id_prefix
            }-${request.request_formsly_id_serial}`
          );
          break;

        case "Module Request":
          const moduleRequest = await createModuleRequest(supabaseClient, {
            requestFormValues: data,
            formId: form.form_id,
            moduleId: moduleId,
            moduleRequestId: moduleRequestId,
            teamMemberId: teamMember.team_member_id,
            signers: form.form_signer,
            teamId: teamMember.team_member_team_id,
            requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
            formName: form.form_name,
            isFormslyForm: true,
            projectId: projectId,
            teamName: formatTeamNameToUrlKey(activeTeam.team_name ?? ""),
            userId: requestorProfile.user_id,
            moduleVersion: form.form_module_version ?? "",
          });

          notifications.show({
            message: "Module Request created.",
            color: "green",
          });

          await router.push(
            `/${formatTeamNameToUrlKey(activeTeam.team_name ?? "")}/module-request/${
              moduleRequest.module_request_formsly_id_prefix
            }-${moduleRequest.module_request_formsly_id_serial}/view`
          );

          break;
      }
    } catch (e) {
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
            formId,
            requesterTeamMemberId: `${teamMember?.team_member_id}`,
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

  const handleDuplicateSection = (sectionId: string) => {
    const sectionLastIndex = formSections
      .map((sectionItem) => sectionItem.section_id)
      .lastIndexOf(sectionId);
    const sectionMatch = form.form_section.find(
      (section) => section.section_id === sectionId
    );
    if (sectionMatch) {
      const sectionDuplicatableId = uuidv4();
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field.map(
        (field) => {
          if (field.field_name === "General Name") {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: itemOptions,
            };
          } else {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
            };
          }
        }
      );
      duplicatedFieldsWithDuplicatableId.splice(9, 1);
      const newSection = {
        ...sectionMatch,
        section_order: sectionLastIndex + 1,
        section_field: duplicatedFieldsWithDuplicatableId.slice(0, 4),
      };

      insertSection(sectionLastIndex + 1, newSection);
      return;
    }
  };

  const handleRemoveSection = (sectionDuplicatableId: string) => {
    const sectionMatchIndex = formSections.findIndex(
      (section) =>
        section.section_field[0].field_section_duplicatable_id ===
        sectionDuplicatableId
    );
    if (sectionMatchIndex) {
      removeSection(sectionMatchIndex);
      const newItemCategoryList = itemCategoryList.filter(
        (_, index) => index !== sectionMatchIndex
      );
      setItemCategoryList(newItemCategoryList);
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
        ]);
        const item = await getItem(supabaseClient, {
          teamId: activeTeam.team_id,
          itemName: value,
        });
        setItemCategoryList((prev) => {
          prev[index] = item.item_category;
          return prev;
        });

        const generalField = [
          {
            ...newSection.section_field[0],
          },
          {
            ...newSection.section_field[1],
            field_response: item.item_unit,
          },
          {
            ...newSection.section_field[2],
          },
          {
            ...newSection.section_field[3],
            field_response: item.item_gl_account,
          },
        ];

        const duplicatableSectionId = index === 1 ? undefined : uuidv4();

        if (value.toLowerCase().includes("ink")) {
          generalField.push({
            ...form.form_section[1].section_field[9],
            field_section_duplicatable_id: duplicatableSectionId,
          });
        }

        const newFields = item.item_description.map((description) => {
          const options = description.item_description_field.map(
            (options, optionIndex) => {
              return {
                option_field_id: description.item_field.field_id,
                option_id: options.item_description_field_id,
                option_order: optionIndex + 1,
                option_value: `${options.item_description_field_value}${
                  description.item_description_is_with_uom
                    ? ` ${options.item_description_field_uom[0].item_description_field_uom}`
                    : ""
                }`,
              };
            }
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
            field_section_duplicatable_id: duplicatableSectionId,
            field_option: options,
            field_response: index !== -1 ? "Any" : "",
          };
        });

        updateSection(index, {
          ...newSection,
          section_field: [
            ...generalField.map((field) => {
              return {
                ...field,
                field_section_duplicatable_id: duplicatableSectionId,
              };
            }),
            ...newFields,
          ],
        });
      } else {
        const generalField = [
          newSection.section_field[0],
          {
            ...newSection.section_field[1],
            field_response: "",
          },
          newSection.section_field[2],
          {
            ...newSection.section_field[3],
            field_response: "",
          },
        ];
        setItemCategoryList((prev) => {
          prev[index] = null;
          return prev;
        });
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

  const handleEmployeeNumberChange = async (
    value: string | null,
    sectionIndex: number
  ) => {
    try {
      if (!value) return;
      const employee = await getEmployeeName(supabaseClient, {
        employeeId: value,
      });

      if (employee) {
        setValue(
          `sections.${sectionIndex}.section_field.2.field_response`,
          employee.scic_employee_first_name
        );
        setValue(
          `sections.${sectionIndex}.section_field.3.field_response`,
          employee.scic_employee_middle_name
        );
        setValue(
          `sections.${sectionIndex}.section_field.4.field_response`,
          employee.scic_employee_last_name
        );
        setValue(
          `sections.${sectionIndex}.section_field.5.field_response`,
          employee.scic_employee_suffix
        );
      } else {
        modals.open({
          title: (
            <Flex gap="xs" align="center">
              <IconAlertTriangle size={16} color="red" />
              <Text>Employee not found!</Text>
            </Flex>
          ),
          centered: true,
          children: (
            <>
              <Alert color="blue">
                Employee not found. Please enter your Project Manager&apos;s
                details as the assignee of the IT Asset for advance requests or
                for newly hired employees.
              </Alert>
              <Button fullWidth onClick={() => modals.closeAll()} mt="md">
                I understand
              </Button>
            </>
          ),
        });
        setValue(`sections.${sectionIndex}.section_field.0.field_response`, "");
        setValue(`sections.${sectionIndex}.section_field.2.field_response`, "");
        setValue(`sections.${sectionIndex}.section_field.3.field_response`, "");
        setValue(`sections.${sectionIndex}.section_field.4.field_response`, "");
        setValue(`sections.${sectionIndex}.section_field.5.field_response`, "");
      }
    } catch (e) {
      notifications.show({
        message: "Failed to fetch employee data",
        color: "orange",
      });
    }
  };

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        if (!activeTeam.team_id) return;
        let index = 0;
        const itemOptionList: OptionTableRow[] = [];
        while (1) {
          const itemData = await getITAssetItemOptions(supabaseClient, {
            teamId: activeTeam.team_id,
            index,
            limit: FETCH_OPTION_LIMIT,
          });
          const itemOptions = itemData.map((item, index) => {
            return {
              option_field_id: form.form_section[1].section_field[0].field_id,
              option_id: item.item_id,
              option_order: index,
              option_value: item.item_general_name,
            };
          });
          itemOptionList.push(...itemOptions);

          if (itemData.length < FETCH_OPTION_LIMIT) break;
          index += FETCH_OPTION_LIMIT;
        }
        setItemOptions(itemOptionList);
        replaceSection([
          form.form_section[0],
          {
            ...form.form_section[1],
            section_field: [
              {
                ...form.form_section[1].section_field[0],
                field_option: itemOptionList,
              },
              ...form.form_section[1].section_field.slice(1, 4),
            ],
          },
          form.form_section[2],
        ]);
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOptions();
  }, [activeTeam]);

  return (
    <Container>
      <Title order={2} color="dimmed">
        Create {type}
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleCreateRequest)}>
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
            {formSections.map((section, idx) => {
              const sectionIdToFind = section.section_id;
              const sectionLastIndex = getValues("sections")
                .map((sectionItem) => sectionItem.section_id)
                .lastIndexOf(sectionIdToFind);

              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    onRemoveSection={handleRemoveSection}
                    itAssetRequestFormMethods={{
                      onProjectNameChange: handleProjectNameChange,
                      onGeneralNameChange: handleGeneralNameChange,
                      onEmployeeNumberChange: handleEmployeeNumberChange,
                    }}
                    formslyFormName={form.form_name}
                    loadingFieldList={loadingFieldList}
                  />
                  {section.section_is_duplicatable &&
                    idx === sectionLastIndex && (
                      <Button
                        mt="md"
                        variant="default"
                        onClick={() =>
                          handleDuplicateSection(section.section_id)
                        }
                        fullWidth
                      >
                        {section.section_name} +
                      </Button>
                    )}
                </Box>
              );
            })}
            <RequestFormSigner type={type} signerList={signerList} />
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateITAssetRequestPage;
