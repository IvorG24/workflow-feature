import {
  getProjectSignerWithTeamMember,
  getSupplierOptions,
} from "@/backend/api/get";
import { createRequest } from "@/backend/api/post";
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
  OptionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import {
  Box,
  Button,
  Container,
  LoadingOverlay,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useBeforeunload } from "react-beforeunload";
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
  projectOptions: OptionTableRow[];
};

const CreateServicesRequestPage = ({ form, projectOptions }: Props) => {
  const router = useRouter();
  const formId = router.query.formId as string;
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const team = useActiveTeam();
  const isSubmitting = useRef(false);
  const [signerList, setSignerList] = useState(
    form.form_signer.map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
    }))
  );
  const [isFetchingSigner, setIsFetchingSigner] = useState(false);
  const [preferredSupplierOptions, setPreferredSupplierOptions] = useState<
    OptionTableRow[]
  >([]);

  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
    form_type: form.form_type,
    form_sub_type: form.form_sub_type,
  };
  const [localFormState, setLocalFormState, removeLocalState] =
    useLocalStorage<FormWithResponseType | null>({
      key: `${formId}`,
      defaultValue: form,
    });
  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues, setValue } = requestFormMethods;
  const {
    fields: formSections,
    insert: addSection,
    remove: removeSection,
    replace: replaceSection,
  } = useFieldArray({
    control,
    name: "sections",
  });
  const saveToLocalStorage = () => {
    if (isSubmitting.current) return;

    const updatedForm = {
      ...form,
      form_section: getValues("sections").map((section) => ({
        ...section,
        section_field: section.section_field.map((field) => {
          return field;
        }),
      })),
      form_signer: signerList,
    };

    setLocalFormState(updatedForm);
  };
  useEffect(() => {
    if (localFormState) {
      removeSection();
      replaceSection(localFormState.form_section);
      setSignerList(localFormState.form_signer);
    } else {
      replaceSection(form.form_section);
      setSignerList(
        form.form_signer.map((signer) => ({
          ...signer,
          signer_action: signer.signer_action.toUpperCase(),
        }))
      );
    }
  }, [form, localFormState, replaceSection]);

  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        if (!team.team_id) return;
        let index = 0;
        const supplierOptionlist: OptionTableRow[] = [];
        while (1) {
          const supplierData = await getSupplierOptions(supabaseClient, {
            teamId: team.team_id,
            index,
            limit: FETCH_OPTION_LIMIT,
          });
          const supplierOptions = supplierData.map((supplier, index) => {
            return {
              option_field_id: form.form_section[1].section_field[0].field_id,
              option_id: supplier.supplier_id,
              option_order: index,
              option_value: supplier.supplier,
            };
          });
          supplierOptionlist.push(...supplierOptions);

          if (supplierOptions.length < FETCH_OPTION_LIMIT) break;
          index += FETCH_OPTION_LIMIT;
        }
        setPreferredSupplierOptions(supplierOptionlist);
        if (!localStorage.getItem(`${formId}`)) {
          replaceSection([
            form.form_section[0],
            {
              ...form.form_section[1],
              section_field: [
                ...form.form_section[1].section_field.slice(0, 4),
                {
                  ...form.form_section[1].section_field[9],
                  field_option: supplierOptionlist,
                },
              ],
            },
          ]);
        }

        const localSection = localFormState?.form_section;
        const newSections = localSection?.map((section) => ({
          ...section,
          section_field: section.section_field.map((field) => {
            if (field.field_name === "Preffered Supplier") {
              return {
                ...field,
                field_option: supplierOptionlist,
              };
            } else if (field.field_name === "Requesting Project") {
              return {
                ...field,
                field_option: projectOptions,
              };
            } else {
              return field;
            }
          }),
        }));
        console.log(newSections);

        // replaceSection([
        //   localFormState?.form_section.map((section,sectionIndex)=>

        //   ),
        //   {
        //     ...form.form_section[1],
        //     section_field: [
        //       ...form.form_section[1].section_field.slice(0, 4),
        //       {
        //         ...form.form_section[1].section_field[9],
        //         field_option: supplierOptionlist,
        //       },
        //     ],
        //   },
        // ]);
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
  }, [team]);
  useBeforeunload(() => saveToLocalStorage());
  const handleCreateRequest = async (data: RequestFormValues) => {
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

      const request = await createRequest(supabaseClient, {
        requestFormValues: data,
        formId,
        teamMemberId: teamMember.team_member_id,
        signers: signerList,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: form.form_name,
        isFormslyForm: true,
        projectId,
        teamName: formatTeamNameToUrlKey(team.team_name ?? ""),
      });
      isSubmitting.current = true;
      removeLocalState();
      notifications.show({
        message: "Request created.",
        color: "green",
      });

      await router.push(
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
          if (field.field_name === "Preferred Supplier") {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: preferredSupplierOptions,
            };
          } else {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
            };
          }
        }
      );
      const newSection = {
        ...sectionMatch,
        section_field: [
          ...duplicatedFieldsWithDuplicatableId.slice(0, 4),
          duplicatedFieldsWithDuplicatableId[9],
        ],
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
      removeSection(sectionMatchIndex);
      return;
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
                    onRemoveSection={handleRemoveSection}
                    formslyFormName={form.form_name}
                    servicesFormMethods={{
                      onProjectNameChange: handleProjectNameChange,
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
            <Box pos="relative">
              <LoadingOverlay visible={isFetchingSigner} overlayBlur={2} />
              <RequestFormSigner signerList={signerList} />
            </Box>
            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default CreateServicesRequestPage;
