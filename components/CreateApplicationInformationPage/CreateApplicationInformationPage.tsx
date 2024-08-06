import {
  fetchRegion,
  getApplicationInformationPositionOptions,
} from "@/backend/api/get";
import { createRequest } from "@/backend/api/post";
import RequestFormDetails from "@/components/CreateRequestPage/RequestFormDetails";
import RequestFormSection from "@/components/CreateRequestPage/RequestFormSection";
import RequestFormSigner from "@/components/CreateRequestPage/RequestFormSigner";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { FETCH_OPTION_LIMIT } from "@/utils/constant";
import { formatTeamNameToUrlKey } from "@/utils/string";
import supabaseClientAddress from "@/utils/supabase/address";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  PositionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import { Box, Button, Container, Space, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  createPagesBrowserClient,
  SupabaseClient,
} from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { Database, Database as OneOfficeDatabase } from "oneoffice-api";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";

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
};

const CreateApplicationInformationPage = ({ form }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();

  const [positionList, setPositionList] = useState<PositionTableRow[]>([]);
  const [loadingFieldList, setLoadingFieldList] = useState<
    { sectionIndex: number; fieldIndex: number }[]
  >([]);

  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
  };
  const signerList = form.form_signer.map((signer) => ({
    ...signer,
    signer_action: signer.signer_action.toUpperCase(),
  }));

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues, setValue } = requestFormMethods;
  const {
    fields: formSections,
    insert: addSection,
    remove: removeSection,
    update: updateSection,
    replace: replaceSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        let index = 0;
        const positionOptionList: OptionTableRow[] = [];
        const positionList: PositionTableRow[] = [];
        while (1) {
          const positionData = await getApplicationInformationPositionOptions(
            supabaseClient,
            {
              teamId: form.form_team_member.team_member_team_id,
              index,
              limit: FETCH_OPTION_LIMIT,
            }
          );

          const positionOptions = positionData.map((position, index) => {
            return {
              option_field_id: form.form_section[0].section_field[0].field_id,
              option_id: position.position_id,
              option_order: index,
              option_value: position.position,
            };
          });
          positionOptionList.push(...positionOptions);
          positionList.push(...positionData);
          if (positionData.length < FETCH_OPTION_LIMIT) break;
          index += FETCH_OPTION_LIMIT;
        }
        setPositionList(positionList);

        const regionData = await fetchRegion(
          supabaseClientAddress as unknown as SupabaseClient<
            OneOfficeDatabase["address_schema"]
          >
        );
        if (!regionData) throw new Error();

        const regionOptionList = regionData.map((region, index) => {
          return {
            option_field_id: form.form_section[2].section_field[1].field_id,
            option_id: region.region_id,
            option_order: index,
            option_value: region.region,
          };
        });
        replaceSection([
          {
            ...form.form_section[0],
            section_field: [
              {
                ...form.form_section[0].section_field[0],
                field_option: positionOptionList,
              },
              ...form.form_section[0].section_field.slice(3),
            ],
          },
          form.form_section[1],
          {
            ...form.form_section[2],
            section_field: [
              form.form_section[2].section_field[0],
              {
                ...form.form_section[2].section_field[1],
                field_option: regionOptionList,
              },
              ...form.form_section[2].section_field.slice(2),
            ],
          },
          ...form.form_section.slice(3),
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
  }, [form, replaceSection, requestFormMethods]);

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      setIsLoading(true);
      const request = await createRequest(supabaseClient, {
        requestFormValues: data,
        formId: form.form_id,
        signers: form.form_signer,
        teamId: "a5a28977-6956-45c1-a624-b9e90911502e",
        requesterName: `TEMP`,
        formName: form.form_name,
        isFormslyForm: false,
        projectId: "",
        teamName: formatTeamNameToUrlKey(
          process.env.NODE_ENV === "production" ? "SCIC" : "Sta Clara"
        ),
      });
      notifications.show({
        message: "Request created.",
        color: "green",
      });

      await router.push(`/public-request/${request.request_id}`);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
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
        (field) => ({
          ...field,
          field_section_duplicatable_id: sectionDuplicatableId,
        })
      );
      const newSection = {
        ...sectionMatch,
        section_field: duplicatedFieldsWithDuplicatableId,
      };
      addSection(sectionLastIndex + 1, newSection);
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
      if (formSections[sectionMatchIndex].section_field[0].field_response) {
        const option = formSections[
          sectionMatchIndex
        ].section_field[0].field_option.find(
          (fieldOption) =>
            fieldOption.option_value ===
            formSections[sectionMatchIndex].section_field[0].field_response
        ) as OptionTableRow;

        if (option) {
          const sectionList = getValues(`sections`);
          const itemSectionList = sectionList.slice(1);

          itemSectionList.forEach((section, sectionIndex) => {
            sectionIndex += 1;
            if (sectionIndex !== sectionMatchIndex) {
              updateSection(sectionIndex, {
                ...section,
                section_field: [
                  {
                    ...section.section_field[0],
                    field_option: [
                      ...section.section_field[0].field_option,
                      option,
                    ].sort((a, b) => {
                      return a.option_order - b.option_order;
                    }),
                  },
                  ...section.section_field.slice(1),
                ],
              });
            }
          });
        }
      }

      removeSection(sectionMatchIndex);
      return;
    }
  };

  const handlePositionChange = (value: string | null) => {
    const newSection = getValues(`sections.0`);

    try {
      if (value) {
        setLoadingFieldList([{ sectionIndex: 0, fieldIndex: 0 }]);

        const position = positionList.find(
          (position) => position.position === value
        );

        updateSection(0, {
          ...newSection,
          section_field: [
            newSection.section_field[0],
            ...(position?.position_is_with_certificate
              ? [{ ...form.form_section[0].section_field[1] }]
              : []),
            ...(position?.position_is_with_license
              ? [{ ...form.form_section[0].section_field[2] }]
              : []),
            newSection.section_field[newSection.section_field.length - 1],
          ],
        });
      } else {
        updateSection(0, {
          ...newSection,
          section_field: [
            newSection.section_field[0],
            newSection.section_field[newSection.section_field.length - 1],
          ],
        });
      }
    } catch (e) {
      setValue(`sections.0.section_field.0.field_response`, "");
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setLoadingFieldList([]);
    }
  };

  return (
    <Container>
      <Title order={2} color="dimmed">
        Create Request
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
                    formslyFormName={form.form_name}
                    loadingFieldList={loadingFieldList}
                    onRemoveSection={handleRemoveSection}
                    applicationInformationFormMethods={{
                      onPositionChange: handlePositionChange,
                    }}
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
            <RequestFormSigner signerList={signerList} />
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateApplicationInformationPage;
