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
  IconCircleCheck,
  IconCircleX,
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

  if (Boolean(hrPhoneInterviewData)) {
    maxValue = 3;
  } else if (Boolean(technicalAssessmentData)) {
    maxValue = 2;
  } else if (Boolean(generalAssessmentData)) {
    maxValue = 1;
  } else if (Boolean(applicationInformationData)) {
    maxValue = 0;
  }
  const [stepperValue, setStepperValue] = useState(maxValue);

  const stepperProps = (value: string) => {
    switch (value) {
      case "APPROVED":
        return {
          description: (
            <Badge color="green">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconCircleCheck color={"green"} />,
          completedIcon: <IconCircleCheck color={"white"} />,
          color: "green",
        };
      case "REJECTED":
        return {
          description: (
            <Badge color="red">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconCircleX color={"red"} />,
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
          icon: <IconProgress color={"blue"} />,
          completedIcon: <IconProgress color={"white"} />,
          color: "blue",
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
          <Stepper.Step label="Qualifier Interview" disabled />
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
