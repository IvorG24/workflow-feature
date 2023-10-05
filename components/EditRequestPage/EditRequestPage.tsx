import { checkIfRequestIsPending } from "@/backend/api/get";
import { editRequest } from "@/backend/api/post";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useUserProfile, useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import {
  FormType,
  RequestResponseTableRow,
  RequestWithResponseType,
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
import { useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useBeforeunload } from "react-beforeunload";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import RequestFormDetails from "./RequestFormDetails";
import RequestFormSection from "./RequestFormSection";
import RequestFormSigner from "./RequestFormSigner";

export type Section =
  RequestWithResponseType["request_form"]["form_section"][0];
export type RequestFormValues = {
  sections: Section[];
};

export type FieldWithResponseArray = Section["section_field"][0] & {
  field_response: RequestResponseTableRow[];
};

type Props = {
  request: RequestWithResponseType;
  formslyFormName?: string;
};

const EditRequestPage = ({ request, formslyFormName = "" }: Props) => {
  const router = useRouter();
  const teamMember = useUserTeamMember();
  const supabaseClient = createPagesBrowserClient<Database>();

  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();

  const [localFormState, setLocalFormState, removeLocalFormState] =
    useLocalStorage<RequestWithResponseType | null>({
      key: `${router.query.requestId}`,
      defaultValue: request,
    });

  const { request_form } = request;
  const formDetails = {
    form_name: request_form.form_name,
    form_description: request_form.form_description,
    form_date_created: request.request_date_created,
    form_team_member: request.request_team_member,
  };

  const signerList: FormType["form_signer"] = request.request_signer
    .map((signer) => signer.request_signer_signer)
    .map((signer) => ({
      ...signer,
      signer_action: signer.signer_action.toUpperCase(),
      signer_team_member: {
        ...signer.signer_team_member,
        team_member_user: {
          ...signer.signer_team_member.team_member_user,
          user_id: signer.signer_team_member.team_member_user.user_id,
          user_avatar: "",
        },
      },
    }));

  const requestFormMethods = useForm<RequestFormValues>({
    defaultValues: { sections: request_form.form_section },
  });
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = requestFormMethods;
  const {
    fields: formSections,
    insert: addSection,
    remove: removeSection,
    replace: replaceSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const handleEditRequest = async (data: RequestFormValues) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;

      setIsLoading(true);
      const isPending = await checkIfRequestIsPending(supabaseClient, {
        requestId: request.request_id,
      });

      if (!isPending) {
        notifications.show({
          message: "Request can't be edited",
          color: "red",
        });
        router.push(`/team-requests/requests/${request.request_id}`);
        return;
      }

      await editRequest(supabaseClient, {
        requestId: request.request_id,
        requestFormValues: data,
        signers: signerList,
        teamId: teamMember.team_member_team_id,
        requesterName: `${requestorProfile.user_first_name} ${requestorProfile.user_last_name}`,
        formName: request_form.form_name,
      });

      removeLocalFormState();
      notifications.show({
        message: "Request Edited.",
        color: "green",
      });
      router.push(`/team-requests/requests/${request.request_id}`);
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
    const sectionMatch = request_form.form_section.find(
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

  const handleRemoveSection = (sectionMatchIndex: number) =>
    removeSection(sectionMatchIndex);

  useEffect(() => {
    if (localFormState) {
      replaceSection(localFormState.request_form.form_section);
    } else {
      replaceSection(request.request_form.form_section);
    }
  }, [request, localFormState, replaceSection, requestFormMethods]);

  useBeforeunload(() => {
    const formWithResponse: RequestWithResponseType = {
      ...request,
      request_form: {
        ...request.request_form,
        form_section: getValues("sections"),
      },
    };
    setLocalFormState(formWithResponse);
  });

  return (
    <Container>
      <Title order={2} color="dimmed">
        Edit Request
      </Title>
      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleEditRequest)}>
          <Stack spacing="xl">
            <RequestFormDetails formDetails={formDetails} />
            {formSections.map((section, idx) => {
              // used to render add duplicate button
              // find the last index of current section, and render add duplicate button if match
              const sectionIdToFind = section.section_id;
              const sectionLastIndex = getValues("sections")
                .map((sectionItem) => sectionItem.section_id)
                .lastIndexOf(sectionIdToFind);

              const isRemovable =
                formSections[idx - 1]?.section_is_duplicatable &&
                section.section_is_duplicatable;

              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                    onRemoveSection={handleRemoveSection}
                    formslyFormName={formslyFormName}
                    isSectionRemovable={isRemovable}
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
            <Flex direction="column" gap="sm">
              {isDirty && (
                <Button variant="outline" color="red" onClick={() => reset()}>
                  Reset
                </Button>
              )}
              <Button type="submit" disabled={!isDirty}>
                Submit
              </Button>
            </Flex>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default EditRequestPage;
