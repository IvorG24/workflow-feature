import { HRPhoneInterviewTableRow, RequestViewRow } from "@/utils/types";
import {
  Badge,
  Button,
  Center,
  Container,
  Flex,
  Paper,
  Stepper,
  Text,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBan,
  IconCalendarExclamation,
  IconCircleCheck,
  IconCircleX,
  IconClockOff,
  IconProgress,
} from "@tabler/icons-react";
import { useState } from "react";
import ApplicationInformation from "./ApplicationInformation";
import GeneralAssessment from "./GeneralAssessment";
import HRPhoneInterview from "./HRPhoneInterview";
import TechnicalAssessment from "./TechnicalAssessment";

type Props = {
  applicationInformationData: RequestViewRow | null;
  generalAssessmentData: RequestViewRow | null;
  technicalAssessmentData: RequestViewRow | null;
  hrPhoneInterviewData: HRPhoneInterviewTableRow;
};
const ApplicationProgressPage = ({
  applicationInformationData,
  generalAssessmentData,
  technicalAssessmentData,
  hrPhoneInterviewData,
}: Props) => {
  let maxValue = 0;

  if (Boolean(generalAssessmentData)) {
    maxValue += 1;
  }
  if (Boolean(technicalAssessmentData)) {
    maxValue += 1;
  }
  if (Boolean(hrPhoneInterviewData)) {
    maxValue += 1;
  }

  const [stepperValue, setStepperValue] = useState(maxValue);

  const stepperProps = (value: string) => {
    switch (value) {
      case "APPROVED":
      case "QUALIFIED":
        return {
          description: (
            <Badge color="green">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconCircleCheck color={"#40C057"} />,
          completedIcon: <IconCircleCheck color={"white"} />,
          color: "green",
        };
      case "REJECTED":
      case "UNQUALIFIED":
        return {
          description: (
            <Badge color="red">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconCircleX color={"#FA5252"} />,
          completedIcon: <IconCircleX color={"white"} />,
          color: "red",
        };
      case "PENDING":
        return {
          description: (
            <Badge color="blue">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconProgress color={"#228BE6"} />,
          completedIcon: <IconProgress color={"white"} />,
          color: "blue",
        };
      case "WAITING FOR SCHEDULE":
        return {
          description: (
            <Badge color="orange">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconCalendarExclamation color={"#FD7E14"} />,
          completedIcon: <IconCalendarExclamation color={"white"} />,
          color: "orange",
        };
      case "UNRESPONSIVE":
        return {
          description: (
            <Badge color="gray">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconAlertCircle color={"#868E96"} />,
          completedIcon: <IconAlertCircle color={"white"} />,
          color: "gray",
        };
      case "CANCELLED":
        return {
          description: (
            <Badge color="dark">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconBan color="#25262B" />,
          completedIcon: <IconBan color={"white"} />,
          color: "dark",
        };
      case "MISSED":
        return {
          description: (
            <Badge color="grape">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconClockOff color={"#BE4BDB"} />,
          completedIcon: <IconClockOff color={"white"} />,
          color: "grape",
        };
    }
  };

  const renderContent = () => {
    switch (stepperValue) {
      case 0:
        if (!applicationInformationData) return;
        return (
          <ApplicationInformation
            applicationInformationData={applicationInformationData}
            isWithNextStep={
              applicationInformationData.request_status === "APPROVED" &&
              !Boolean(generalAssessmentData)
            }
          />
        );
      case 1:
        if (!generalAssessmentData) return;
        return (
          <GeneralAssessment
            generalAssessmentData={generalAssessmentData}
            isWithNextStep={
              generalAssessmentData.request_status === "APPROVED" &&
              !Boolean(technicalAssessmentData)
            }
          />
        );
      case 2:
        if (!technicalAssessmentData) return;
        return (
          <TechnicalAssessment
            technicalAssessmentData={technicalAssessmentData}
          />
        );
      case 3:
        if (!hrPhoneInterviewData) return;
        return <HRPhoneInterview hrPhoneInterviewData={hrPhoneInterviewData} />;
    }
  };

  return (
    <Container fluid>
      <Title order={2} color="dimmed">
        Application Progress
      </Title>

      <Flex mt="xl" wrap="wrap" gap="xl">
        <Stepper
          active={stepperValue}
          onStepClick={setStepperValue}
          orientation="vertical"
          defaultValue="Application Information"
        >
          <Stepper.Step
            label="Application Information"
            disabled={!Boolean(applicationInformationData)}
            {...stepperProps(
              applicationInformationData?.request_status as string
            )}
          />
          <Stepper.Step
            label="General Assessment"
            disabled={!Boolean(generalAssessmentData)}
            {...stepperProps(generalAssessmentData?.request_status as string)}
          />
          <Stepper.Step
            label="Technical Assessment"
            disabled={!Boolean(technicalAssessmentData)}
            {...stepperProps(technicalAssessmentData?.request_status as string)}
          />
          <Stepper.Step
            label="HR Phone Interview"
            disabled={!Boolean(hrPhoneInterviewData)}
            {...stepperProps(
              hrPhoneInterviewData?.hr_phone_interview_status as string
            )}
          />
          <Stepper.Step label="Trade Test" disabled />
          <Stepper.Step label="Technical Interview" disabled />
          <Stepper.Step label="Director Interview" disabled />
          <Stepper.Step label="Background Check" disabled />
          <Stepper.Step label="Job Offer" disabled />
        </Stepper>
        <Paper p="xl" shadow="xs" sx={{ flex: 1 }}>
          <Flex direction="column" h="100%" justify="space-between">
            {renderContent()}
            <Center>
              <Flex gap="xs">
                <Button
                  w={100}
                  variant="light"
                  onClick={() => {
                    setStepperValue((prev) => prev - 1);
                  }}
                  disabled={stepperValue === 0}
                >
                  Previous
                </Button>
                <Button
                  w={100}
                  variant="light"
                  onClick={() => {
                    setStepperValue((prev) => prev + 1);
                  }}
                  disabled={stepperValue === maxValue}
                >
                  Next
                </Button>
              </Flex>
            </Center>
          </Flex>
        </Paper>
      </Flex>
    </Container>
  );
};

export default ApplicationProgressPage;
