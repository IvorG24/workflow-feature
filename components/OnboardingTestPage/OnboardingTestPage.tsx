import { createOnboard } from "@/backend/api/post";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { Database } from "@/utils/database";
import { OnboardAnswer, checkOnboardingAnswers } from "@/utils/onboarding";
import { FormWithResponseType } from "@/utils/types";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  RingProgress,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import RequestFormSection from "../CreateRequestPage/RequestFormSection";

type Props = {
  userId: string;
  questionList: OnboardingTestFormValues["sections"];
  answerList: OnboardAnswer[];
};

export type Section = FormWithResponseType["form_section"][0];

export type OnboardingTestFormValues = {
  sections: Section[];
};

const OnboardingTestPage = ({ userId, questionList, answerList }: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const { setIsLoading } = useLoadingActions();

  const requestFormMethods = useForm<OnboardingTestFormValues>();
  const { handleSubmit, control } = requestFormMethods;
  const { fields: formSections, replace: replaceSection } = useFieldArray({
    control,
    name: "sections",
  });

  const calculatePercentage = (score: number, total: number) => {
    if (total === 0) {
      throw new Error("Total should not be zero to avoid division by zero.");
    }
    return (score / total) * 100;
  };

  const getScores = (score: number, total: number) => {
    const right = calculatePercentage(score, total);
    const wrong = calculatePercentage(total - score, total);

    const scores = [
      {
        value: right,
        color: "green",
      },
      {
        value: wrong,
        color: "red",
      },
    ];

    if (score === total) return [scores[0]];
    else if (total - score === total) return [scores[1]];
    else return scores;
  };

  const handleCreateOnboard = async (data: OnboardingTestFormValues) => {
    try {
      setIsLoading(true);

      const responses = data.sections[0].section_field.map((field) => ({
        fieldId: field.field_id,
        response: field.field_response as string | string[],
      }));

      const result = checkOnboardingAnswers({
        responses,
        answers: answerList,
      });
      const onboardScore = result.filter((correct) => correct).length;
      const onboardTopScore = result.length;

      const onboardData = await createOnboard(supabaseClient, {
        onboardData: {
          user_onboard_user_id: userId,
          user_onboard_name: `${router.query.onboardName}`,
          user_onboard_score: onboardScore,
          user_onboard_top_score: onboardTopScore,
        },
      });

      if (onboardData)
        modals.open({
          centered: true,
          title: (
            <Title order={3} align="center">
              Assessment Complete
            </Title>
          ),
          closeOnEscape: false,
          closeOnClickOutside: false,
          withCloseButton: false,
          children: (
            <Box>
              <Text align="center">{router.query.onboardName} Score</Text>
              <Center mt={-10}>
                <RingProgress
                  size={110}
                  roundCaps
                  label={
                    <Flex direction="column">
                      <Text size={28} align="center" weight="bold">
                        {onboardScore}
                      </Text>
                      <Text
                        mt={-7}
                        size="sm"
                        weight="bold"
                        color="dimmed"
                        align="center"
                      >
                        {onboardTopScore}
                      </Text>
                    </Flex>
                  }
                  sections={getScores(onboardScore, onboardTopScore)}
                />
              </Center>

              <Text>
                Thank you for participating in the assessment. Your engagement
                is appreciated! You&apos;ve completed a crucial step in
                familiarizing yourself with our platform. If you have any
                questions or need further assistance, feel free to reach out.
                Well done!
              </Text>

              <Button
                onClick={() => {
                  modals.closeAll();
                  router.push(`/team-requests/dashboard`);
                }}
                mt="md"
                fullWidth
              >
                Continue
              </Button>
              <Button
                onClick={() => {
                  modals.closeAll();
                  router.push(
                    `/team-requests/requests/test?onboardName=${router.query.onboardName}`
                  );
                  router.reload();
                }}
                mt="md"
                fullWidth
                variant="outline"
              >
                Retake
              </Button>
            </Box>
          ),
        });
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openSuccessNoticeModal = () =>
    modals.open({
      centered: true,
      title: (
        <Title order={3} align="center">
          Post-Onboarding Assessment
        </Title>
      ),
      closeOnEscape: false,
      closeOnClickOutside: false,
      withCloseButton: false,
      children: (
        <Box>
          <Text>
            Congratulations on completing the onboarding! Please note that a
            brief assessment awaits you to reinforce your understanding of our
            platform&apos;s features.
          </Text>

          <Button
            onClick={() => {
              modals.closeAll();
            }}
            mt="md"
            fullWidth
          >
            Test
          </Button>
          <Button
            onClick={() => {
              modals.closeAll();
              router.back();
            }}
            mt="md"
            fullWidth
            variant="outline"
          >
            Review
          </Button>
        </Box>
      ),
    });

  useEffect(() => {
    replaceSection(questionList);
  }, [questionList]);

  useEffect(() => {
    if (router.query.notice === "success") openSuccessNoticeModal();
  }, [router.query.notice]);

  return (
    <Container>
      <Flex justify="space-between" direction={{ base: "column", sm: "row" }}>
        <Title order={2}>Post-Onboarding Assessment</Title>
        <Button
          onClick={() => {
            modals.closeAll();
            router.back();
          }}
          mt="md"
          variant="outline"
        >
          Review
        </Button>
      </Flex>
      <FormProvider {...requestFormMethods}>
        <form onSubmit={handleSubmit(handleCreateOnboard)}>
          <Stack spacing="xl" mt="lg">
            {formSections.map((section, idx) => {
              return (
                <Box key={section.id}>
                  <RequestFormSection
                    key={section.section_id}
                    section={section}
                    sectionIndex={idx}
                  />
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

export default OnboardingTestPage;
