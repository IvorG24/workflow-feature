import { getTeamMemberProjectList } from "@/backend/api/get";
import { useFormList } from "@/stores/useFormStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { Database } from "@/utils/database";
import { ONBOARD_NAME } from "@/utils/onboarding";
import { FormTableRow, UserOnboardTableRow } from "@/utils/types";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  RingProgress,
  Text,
  Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import moment from "moment";
import { useRouter } from "next/router";

type Props = {
  onboardList: UserOnboardTableRow[];
};

type OnboardListType = {
  onboardName: string;
  onboardDescription: string;
  onboardingList: UserOnboardTableRow[];
  path: string;
}[];

const OnboardingListPage = ({ onboardList }: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const member = useUserTeamMember();
  const forms = useFormList();
  const rfForm = forms.filter(
    (form) => form.form_is_formsly_form && form.form_name === "Requisition"
  )[0];
  const requisitionForm = rfForm as unknown as FormTableRow & {
    form_team_group: string[];
  };
  const showRequisition = requisitionForm?.form_team_group.length > 0;

  let onboardingList: OnboardListType = [
    {
      onboardName: ONBOARD_NAME.DASHBOARD,
      onboardDescription:
        "Navigate through key features, including 'Total Requests','Top Requestor,' 'Top Signer,' and 'Monthly Statistics.' Effortlessly track and manage your requests with our user-friendly dashboard. This quick session will guide you through the essentials for a seamless and informed experience.",
      onboardingList: [],
      path: "/team-requests/dashboard?onboarding=true",
    },
    {
      onboardName: ONBOARD_NAME.CREATE_REQUISITION,
      onboardDescription:
        "Effortlessly create a requisition request using Formsly. This user-friendly feature guides you through the process, ensuring a seamless experience. Simplify requisition submission and make your workflow more efficient with Formsly's intuitive interface.",
      onboardingList: [],
      path: "/team-requests/forms/d13b3b0f-14df-4277-b6c1-7c80f7e7a829/create/onboarding?onboarding=true",
    },
    {
      onboardName: ONBOARD_NAME.REQUISITION_REQUEST,
      onboardDescription:
        "Streamline your workflow, review details, and easily take action on pending requests. This brief session will guide you through key features for a seamless experience on the Requisition Request Page.",
      onboardingList: [],
      path: "/team-requests/requests/40a7c790-6b30-45f1-a29a-a398c4a5514d/onboarding?requestFormName=Requisition&onboarding=true",
    },
    {
      onboardName: ONBOARD_NAME.REQUEST_LIST,
      onboardDescription:
        "Explore and manage your requests in one centralized space. The 'View All Requests' feature provides a comprehensive overview, allowing you to review, track, and take necessary actions on your submitted requests efficiently.",
      onboardingList: [],
      path: "/team-requests/requests?onboarding=true",
    },
  ];

  if (!showRequisition)
    onboardingList = onboardingList.filter(
      (onboard) => onboard.onboardName !== ONBOARD_NAME.CREATE_REQUISITION
    );
  const onboardingCategorized = onboardingList.map((onboard) => ({
    ...onboard,
    onboardingList: onboardList.filter(
      (onboardData) => onboardData.user_onboard_name === onboard.onboardName
    ),
  }));

  const canCreateRequisition = async () => {
    try {
      const { data } = await getTeamMemberProjectList(supabaseClient, {
        teamMemberId: `${member?.team_member_id}`,
        limit: 10,
        page: 1,
      });
      console.log(data.length > 0);
      if (data.length > 0) return true;
      else return false;
    } catch (error) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const openRequestingProjectModal = () =>
    modals.open({
      centered: true,
      closeOnEscape: false,
      closeOnClickOutside: false,
      withCloseButton: false,
      children: (
        <Box>
          <Title order={3}>Warning! Join a Project</Title>
          <Text mt="xs">
            Ready to collaborate? If you&apos;re not in a project yet, ask your
            admin to invite you. Join your respective project and start making
            requests.
          </Text>

          <Button onClick={() => modals.closeAll()} mt="md" fullWidth>
            Confirm
          </Button>
        </Box>
      ),
    });

  const calculatePercentage = (score: number, total: number) => {
    if (total === 0) {
      throw new Error("Total should not be zero to avoid division by zero.");
    }
    return (score / total) * 100;
  };

  const getScores = (onboard: OnboardListType[0]["onboardingList"][0]) => {
    const score = onboard.user_onboard_score;
    const total = onboard.user_onboard_top_score;
    const right = calculatePercentage(score, onboard.user_onboard_top_score);
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

  return (
    <Container>
      <Title order={2}> Onboarding Assessment</Title>
      <Flex gap="md" wrap="wrap" mt="lg">
        {onboardingCategorized.map((onboard, onboardIdx) => (
          <Card radius="sm" mih={150} miw="100%" shadow="xs" key={onboardIdx}>
            <Card.Section px="md" pt="xs">
              <Text size="xl" weight="bold">
                {onboard.onboardName}
              </Text>
            </Card.Section>
            <Card.Section p="md" pt="xs">
              {onboard.onboardingList.length > 0 ? (
                <Flex
                  direction={{ base: "column", sm: "row" }}
                  justify="space-between"
                  gap="xl"
                >
                  <Flex direction="column" justify="space-between">
                    <Text size="xs" color="dimmed">
                      {onboard.onboardDescription}
                    </Text>

                    <Text size="xs" color="dimmed">
                      Onboarded&nbsp;
                      {moment(
                        onboard.onboardingList[0].user_onboard_date_created
                      ).fromNow()}
                    </Text>
                  </Flex>
                  <Flex gap="md" direction="column">
                    <Text align="center">Score</Text>

                    <RingProgress
                      size={110}
                      roundCaps
                      mt={-20}
                      label={
                        <Flex direction="column">
                          <Text size={28} align="center" weight="bold">
                            {onboard.onboardingList[0].user_onboard_score}
                          </Text>
                          <Text
                            mt={-7}
                            size="sm"
                            weight="bold"
                            color="dimmed"
                            align="center"
                          >
                            {onboard.onboardingList[0].user_onboard_top_score}
                          </Text>
                        </Flex>
                      }
                      sections={getScores(onboard.onboardingList[0])}
                    />
                    <Button
                      variant="outline"
                      size="xs"
                      mt={-16}
                      onClick={async () => {
                        if (
                          onboard.onboardName ===
                          ONBOARD_NAME.CREATE_REQUISITION
                        ) {
                          const isValid = await canCreateRequisition();
                          if (isValid) router.push(onboard.path);
                          else openRequestingProjectModal();
                        } else {
                          router.push(onboard.path);
                        }
                      }}
                    >
                      Retake
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Flex direction="column">
                  <Text size="xs" color="dimmed">
                    {onboard.onboardDescription}
                  </Text>
                  <Group spacing="md" mt={40}>
                    <Text size="sm" color="dimmed">
                      Not onboarded yet
                    </Text>
                    <Button
                      size="xs"
                      onClick={async () => {
                        if (
                          onboard.onboardName ===
                          ONBOARD_NAME.CREATE_REQUISITION
                        ) {
                          const isValid = await canCreateRequisition();
                          if (isValid) router.push(onboard.path);
                          else openRequestingProjectModal();
                        } else {
                          router.push(onboard.path);
                        }
                      }}
                    >
                      Onboard
                    </Button>
                  </Group>
                </Flex>
              )}
            </Card.Section>
          </Card>
        ))}
      </Flex>
    </Container>
  );
};

export default OnboardingListPage;
