import {
  getOptionsTechnicalQuestion,
  getQuestionnaireName,
} from "@/backend/api/get";
import {
  checkIfQuestionExists,
  createTechnicalQuestions,
} from "@/backend/api/post";

import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  useUserProfile,
  useUserTeamMember,
  useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import { FETCH_OPTION_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import { Box, Button, Container, Space, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import RequestFormDetails from "../CreateRequestPage/RequestFormDetails";
import RequestFormSection from "../CreateRequestPage/RequestFormSection";

export type Section = FormWithResponseType["form_section"][0];

export type RequestFormValues = {
  sections: (Section & { section_is_old_data?: boolean })[];
};

export type FieldWithResponseArray =
  FormType["form_section"][0]["section_field"][0] & {
    field_response: RequestResponseTableRow[];
  };

type Props = {
  form: FormType;
  requestProjectId?: string;
  formslyFormName?: string;
};

const TechnicalAssessmentCreateQuestionPage = ({
  form,
  formslyFormName = "",
}: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const teamGroup = useUserTeamMemberGroupList();
  const team = useActiveTeam();
  const requestorProfile = useUserProfile();
  const questionnaireId = router.query.questionnaireId as string;
  const { setIsLoading } = useLoadingActions();

  const [correctOptions, setCorrectOptions] = useState<OptionTableRow[]>([]);
  const [questionnaireName, setQuestionnaireName] = useState<string>("");

  const formId = router.query.formId as string;

  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
    form_questionnaire_name: questionnaireName,
  };

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues } = requestFormMethods;
  const {
    fields: formSections,
    insert: insertSection,
    remove: removeSection,
    replace: replaceSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const handleCreateRequest = async (data: RequestFormValues) => {
    try {
      setIsLoading(true);
      if (!requestorProfile) return;
      if (!teamMember) return;
      if (!teamGroup.includes("HUMAN RESOURCES")) return;

      const isQuestionExists = await checkIfQuestionExists(supabaseClient, {
        data,
        questionnaireId: questionnaireId,
      });

      if (isQuestionExists) {
        notifications.show({
          message: "Question already exists.",
          color: "orange",
        });
        return;
      }

      const uniqueQuestions = new Set();

      for (const section of data.sections) {
        const questionResponse = section.section_field[0]
          .field_response as string;

        if (uniqueQuestions.has(questionResponse)) {
          notifications.show({
            message: `Duplicate question found: ${questionResponse}`,
            color: "orange",
          });
          return;
        }
        uniqueQuestions.add(questionResponse);

        const uniqueChoices = new Set();

        for (let i = 1; i < section.section_field.length; i++) {
          if (i === 5) {
            const correctResponseIndex = (
              section.section_field[i].field_response as string
            ).match(/\d+/g);
            if (correctResponseIndex) {
              if (
                !section.section_field[Number(correctResponseIndex[0])]
                  .field_response
              ) {
                notifications.show({
                  message: `Invalid Correct Answer: ${questionResponse}`,
                  color: "orange",
                });
                return;
              }
            }
          }

          if (
            section.section_field[i].field_response === "" ||
            section.section_field[i].field_response === null ||
            section.section_field[i].field_response === undefined
          ) {
            continue;
          }

          const choiceResponse = section.section_field[i]
            .field_response as string;
          if (uniqueChoices.has(choiceResponse)) {
            notifications.show({
              message: `Duplicate choice found in question: ${questionResponse}`,
              color: "orange",
            });
            return;
          }
          uniqueChoices.add(choiceResponse);
        }
      }

      await createTechnicalQuestions(supabaseClient, {
        requestFormValues: data,
        formId,
        teamMemberId: teamMember.team_member_id,
        teamId: teamMember.team_member_team_id,
        questionnaireId,
      });

      notifications.show({
        message: "Technical question created.",
        color: "green",
      });
      await router.push(
        `/${formatTeamNameToUrlKey(
          team.team_name
        )}/forms/${formId}/technical-questionnaire-view?questionnaireId=${questionnaireId}`
      );
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
      const duplicatedFieldsWithDuplicatableId = sectionMatch.section_field
        .slice(0, 6)
        .map((field) => {
          if (field.field_name === "Correct Answer") {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
              field_option: correctOptions,
            };
          } else {
            return {
              ...field,
              field_section_duplicatable_id: sectionDuplicatableId,
            };
          }
        });
      const newSection = {
        ...sectionMatch,
        section_is_duplicatable: true,
        section_order: sectionLastIndex + 1,
        section_field: duplicatedFieldsWithDuplicatableId,
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
      return;
    }
  };

  useEffect(() => {
    const handleFetchOptions = async () => {
      try {
        setIsLoading(true);
        if (!teamGroup.includes("HUMAN RESOURCES")) return;
        if (!teamMember) return;

        const correctOptions: OptionTableRow[] = [];

        while (1) {
          const correctData = await getOptionsTechnicalQuestion(
            supabaseClient,
            {
              fieldId: form.form_section[2].section_field[5].field_id,
            }
          );
          const correctOptionsFinal = correctData.map((option, index) => {
            return {
              option_field_id: form.form_section[2].section_field[5].field_id,
              option_id: option.option_id,
              option_order: index,
              option_value: option.option_value,
            };
          });
          correctOptions.push(...correctOptionsFinal);
          if (correctData.length < FETCH_OPTION_LIMIT) break;
        }
        setCorrectOptions(correctOptions);
        const questionnaireName = await getQuestionnaireName(supabaseClient, {
          questionnaireId: questionnaireId,
        });
        setQuestionnaireName(questionnaireName.questionnaire_name);
        replaceSection([
          {
            ...form.form_section[2],
            section_is_duplicatable: true,
            section_field: [
              ...form.form_section[2].section_field.slice(0, 5),

              {
                ...form.form_section[2].section_field[5],
                field_option: correctOptions,
              },
            ],
          },
        ]);
        setIsLoading(false);
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      }
    };
    handleFetchOptions();
  }, [teamGroup, teamMember, questionnaireId]);

  return (
    <Container>
      <Title order={2} color="dimmed">
        Create Techincal Question
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
                    formslyFormName={formslyFormName}
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

            <Button type="submit">Submit</Button>
          </Stack>
        </form>
      </FormProvider>
    </Container>
  );
};

export default TechnicalAssessmentCreateQuestionPage;
