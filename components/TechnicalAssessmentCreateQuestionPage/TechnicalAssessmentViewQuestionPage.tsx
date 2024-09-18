import {
  getOptionsTechnicalQuestion,
  getPositionPerQuestionnaire,
  getPositionTypeOptions,
  getQuestionnaireName,
  getTechnicalOptionsItem,
} from "@/backend/api/get";

import { checkIfQuestionExistsUpdate } from "@/backend/api/post";
import {
  handleDeleteTechnicalQuestion,
  updateQuestionnairePosition,
  updateTechnicalQuestion,
} from "@/backend/api/update";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  useUserProfile,
  useUserTeamMember,
  useUserTeamMemberGroupList,
} from "@/stores/useUserStore";
import { FETCH_OPTION_LIMIT } from "@/utils/constant";
import { Database } from "@/utils/database";
import { JoyRideNoSSR } from "@/utils/functions";
import { formatTeamNameToUrlKey } from "@/utils/string";
import {
  FormType,
  FormWithResponseType,
  OptionTableRow,
  RequestResponseTableRow,
} from "@/utils/types";
import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Container,
  Flex,
  Space,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
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

const TechnicalAssessmentViewQuestionPage = ({
  form,
  formslyFormName = "",
}: Props) => {
  const router = useRouter();
  const { colors } = useMantineTheme();
  const supabaseClient = createPagesBrowserClient<Database>();
  const teamMember = useUserTeamMember();
  const teamGroup = useUserTeamMemberGroupList();
  const team = useActiveTeam();
  const requestorProfile = useUserProfile();
  const { setIsLoading } = useLoadingActions();
  const activeTeam = useUserTeamMember();
  const [isJoyRideOpen, setIsJoyRideOpen] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [positions, setPositions] = useState<string[]>([]);
  const [questionnaireName, setQuestionnaireName] = useState<string>("");
  const formId = router.query.formId as string;
  const questionnaireId = router.query.questionnaireId as string;
  const formDetails = {
    form_name: form.form_name,
    form_description: form.form_description,
    form_date_created: form.form_date_created,
    form_team_member: form.form_team_member,
    form_questionnaire_name: questionnaireName,
  };

  const requestFormMethods = useForm<RequestFormValues>();
  const { handleSubmit, control, getValues, setValue } = requestFormMethods;
  const {
    fields: formSections,
    remove: removeSection,
    replace: replaceSection,
  } = useFieldArray({
    control,
    name: "sections",
  });
  const watchedFieldResponse = useWatch({
    control,
    name: "sections.0.section_field.0.field_response",
  });
  const handleUpdateQuestionnairePosition = async (data: RequestFormValues) => {
    try {
      if (!questionnaireId) return;
      if (!teamGroup.includes("HUMAN RESOURCES")) return;
      if (!teamMember) return;
      setIsLoading(true);
      if (data.sections[0].section_field[0].field_is_read_only) {
        notifications.show({
          message: "No Questions Found",
          color: "orange",
        });
        setIsLoading(false);
        return;
      }

      const positions = data.sections[0].section_field[0]
        .field_response as string[];

      await updateQuestionnairePosition(supabaseClient, {
        questionnaireId: questionnaireId,
        teamMemberId: activeTeam?.team_member_id || "",
        position: positions,
      });
      notifications.show({
        message: "Questionnaire updated successfully",
        color: "green",
      });
      setIsLoading(false);
    } catch (e) {
      notifications.show({
        message: "Something went wrong",
        color: "red",
      });
    }
  };

  const handleUpdateQuestion = async (data: Section) => {
    try {
      if (!requestorProfile) return;
      if (!teamMember) return;
      if (!teamGroup.includes("HUMAN RESOURCES")) return;

      const isQuestionExists = await checkIfQuestionExistsUpdate(
        supabaseClient,
        {
          data,
          questionnaireId,
        }
      );

      if (isQuestionExists) {
        notifications.show({
          message: "Question already exists.",
          color: "orange",
        });
        return;
      }

      const choiceSet = new Set();

      for (const [index, field] of data.section_field.entries()) {
        const fieldResponse = (field.field_response as string).trim();
        if ((index === 3 || index === 4) && !fieldResponse) {
          continue;
        }
        if (!fieldResponse) {
          notifications.show({
            message: `Field "${field.field_name}" cannot be empty.`,
            color: "orange",
          });
          return;
        }

        if (field.field_name.toLowerCase().includes("question choice")) {
          if (choiceSet.has(fieldResponse)) {
            notifications.show({
              message: `Duplicate choice "${fieldResponse}" found. Choices must be unique.`,
              color: "orange",
            });
            return;
          }

          choiceSet.add(fieldResponse);
        }
      }

      setIsLoading(true);

      await updateTechnicalQuestion(supabaseClient, {
        requestValues: data,
        teamMemberId: activeTeam?.team_member_id || "",
        questionnaireId: questionnaireId,
      });

      notifications.show({
        message: "Questionnaire Updated.",
        color: "green",
      });
      setIsLoading(false);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again.",
        color: "red",
      });
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (sectionIndex: number, data: Section) => {
    try {
      removeSection(sectionIndex);

      await handleDeleteTechnicalQuestion(supabaseClient, {
        fieldId: data.section_field[0].field_id,
      });
      notifications.show({
        message: "Question deleted.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong",
        color: "red",
      });
    }
  };

  const openCancelInterviewModal = (sectionIndex: number, data: Section) =>
    modals.openConfirmModal({
      title: "Please confirm your action",
      children: (
        <Text size="sm">Are you sure you want to delete this question?</Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      onConfirm: () => handleDeleteQuestion(sectionIndex, data),
      confirmProps: { color: "red" },
      centered: true,
    });

  useEffect(() => {
    const handleFetchOptions = async () => {
      try {
        setIsLoading(true);
        if (!questionnaireId) return;
        if (!teamGroup.includes("HUMAN RESOURCES")) return;
        if (!teamMember) return;
        const positionOptions: OptionTableRow[] = [];
        const correctOptions: OptionTableRow[] = [];

        while (1) {
          const positionData = await getPositionTypeOptions(supabaseClient, {
            fieldId: form.form_section[1].section_field[0].field_id,
            teamId: team.team_id,
          });

          const positionOptionsFinal = positionData.map((option, index) => {
            return {
              option_field_id: form.form_section[1].section_field[0].field_id,
              option_id: option.option_id,
              option_order: index,
              option_value: option.option_value,
            };
          });
          positionOptions.push(...positionOptionsFinal);
          if (positionData.length < FETCH_OPTION_LIMIT) break;
        }

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

        const questionnaireName = await getQuestionnaireName(supabaseClient, {
          questionnaireId: questionnaireId,
        });
        setQuestionnaireName(questionnaireName.questionnaire_name);

        const questionnaireData = await getTechnicalOptionsItem(
          supabaseClient,
          {
            teamId: team.team_id,
            questionnaireId: questionnaireId,
          }
        );

        const positions = await getPositionPerQuestionnaire(supabaseClient, {
          questionnaireId: questionnaireId,
        });

        setPositions(positions);
        if (questionnaireData.length === 0) {
          setIsJoyRideOpen(true);

          replaceSection([
            {
              ...form.form_section[1],
              section_field: [
                {
                  ...form.form_section[1].section_field[0],
                  field_option: positionOptions,
                  field_response: positions ? positions : null,
                  field_is_read_only: true,
                },
              ],
            },
          ]);
          setIsLoading(false);
          return;
        }

        if (questionnaireData) {
          replaceSection([
            {
              ...form.form_section[1],
              section_field: [
                {
                  ...form.form_section[1].section_field[0],
                  field_option: positionOptions,
                  field_response: positions ? positions : null,
                },
              ],
            },
            {
              ...form.form_section[2],
              section_field: [
                ...form.form_section[2].section_field.slice(0, 5),
                {
                  ...form.form_section[2].section_field[5],
                  field_option: correctOptions,
                },
              ],
            },
          ]);

          const updatedSections = questionnaireData.map(
            (sectionData, sectionIndex) => {
              const newSection = getValues(`sections.${1}`);
              const updatedFields = newSection.section_field.map((field) => {
                const correspondingResponse = sectionData.field_options.find(
                  (response) => response.field_name === field.field_name
                );

                const isTechnicalQuestion =
                  field.field_name === "Technical Question";

                const isCorrectAnswer = field.field_name === "Correct Answer";

                return isTechnicalQuestion
                  ? {
                      ...field,
                      field_id: sectionData.field_id,
                      field_type: "TEXT",
                      field_response: sectionData.field_response,
                      field_is_required: false,
                    }
                  : correspondingResponse
                    ? {
                        ...field,
                        field_id: correspondingResponse.field_id,
                        field_type: isCorrectAnswer ? "DROPDOWN" : "TEXT",
                        field_response: correspondingResponse.field_response,
                        field_is_required: false,
                      }
                    : field;
              });

              return {
                ...newSection,
                section_order: sectionIndex,
                section_field: updatedFields,
                section_is_old_data: true,
                section_is_duplicatable: false,
              };
            }
          );

          removeSection(1);
          const currentSections = getValues("sections");
          setValue("sections", [...currentSections, ...updatedSections]);
          setIsLoading(false);
          const isButtonDisabled =
            positions.length ===
            (currentSections[0]?.section_field[0]?.field_response as string[])
              .length;
          setIsButtonDisabled(isButtonDisabled);
        }
      } catch (e) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      }
    };
    handleFetchOptions();
  }, [teamGroup, teamMember, questionnaireId, form]);

  useEffect(() => {
    if (positions && watchedFieldResponse) {
      const isButtonDisabled =
        positions.length === (watchedFieldResponse as string[]).length;
      setIsButtonDisabled(isButtonDisabled);
    }
  }, [positions, watchedFieldResponse]);

  return (
    <Container>
      <JoyRideNoSSR
        steps={[
          {
            target: ".add-question",
            content: (
              <Text>
                To add questions, click the &ldquo;Add Questions&ldquo; button.
              </Text>
            ),
            disableBeacon: true,
          },
        ]}
        run={isJoyRideOpen}
        hideCloseButton
        disableCloseOnEsc
        disableOverlayClose
        hideBackButton
        styles={{ buttonNext: { backgroundColor: colors.blue[6] } }}
      />
      <Flex justify="space-between">
        <Title order={2} color="dimmed">
          View Technical Question
        </Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          className="add-question"
          onClick={() =>
            router.push(
              `/${formatTeamNameToUrlKey(
                team.team_name
              )}/forms/${formId}/technical-interview-questionnaire?questionnaireId=${questionnaireId}`
            )
          }
        >
          Add Questions
        </Button>
      </Flex>
      <Space h="xl" />
      <RequestFormDetails formDetails={formDetails} />

      <Space h="xl" />
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleUpdateQuestionnairePosition)}>
          <Stack spacing="xs">
            {formSections.map((section, idx) => {
              const isQuestionSection = section.section_name === "Question";
              const sectionKey =
                section.section_id && !isNaN(Number(section.section_id))
                  ? section.section_id
                  : `section-${idx}`;

              return (
                <Box key={sectionKey}>
                  {isQuestionSection ? (
                    <Accordion
                      sx={(theme) => ({
                        background:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[6]
                            : theme.white,
                        color:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.black,
                      })}
                      multiple
                      variant="contained"
                      key={sectionKey}
                    >
                      <Accordion.Item value={`section-${sectionKey}`}>
                        <Flex justify="space-between" align="center">
                          <Accordion.Control>
                            {`${section.section_field[0].field_response}`}
                          </Accordion.Control>
                          <ActionIcon
                            mr="md"
                            color="red"
                            size={22}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent accordion toggle
                              openCancelInterviewModal(
                                idx,
                                getValues(`sections.${idx}`)
                              );
                            }}
                          >
                            <IconTrash size={22} />
                          </ActionIcon>
                        </Flex>
                        <Accordion.Panel>
                          <RequestFormSection
                            section={section}
                            sectionIndex={idx}
                            formslyFormName={formslyFormName}
                          />
                          <Space h="xl" />
                          <Button
                            fullWidth
                            onClick={() =>
                              handleUpdateQuestion(getValues(`sections.${idx}`))
                            }
                          >
                            Update
                          </Button>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  ) : (
                    <>
                      <Box>
                        <RequestFormSection
                          section={section}
                          sectionIndex={idx}
                          formslyFormName={formslyFormName}
                        />
                      </Box>
                      <Space h="xl" />
                      <Button
                        disabled={isButtonDisabled}
                        fullWidth
                        type="submit"
                      >
                        Update Position
                      </Button>{" "}
                    </>
                  )}
                </Box>
              );
            })}
          </Stack>
          <Space h="xl" />
        </form>
      </FormProvider>
    </Container>
  );
};

export default TechnicalAssessmentViewQuestionPage;
