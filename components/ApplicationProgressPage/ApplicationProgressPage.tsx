import { HRScreeningTableRow, RequestViewRow } from "@/utils/types";
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
import HRScreening from "./HRScreening";
import OnlineApplication from "./OnlineApplication";
import OnlineAssessment from "./OnlineAssessment";

type Props = {
  applicationInformationData: RequestViewRow | null;
  onlineApplicationData: RequestViewRow | null;
  onlineAssessmentData: RequestViewRow | null;
  hrScreeningData: HRScreeningTableRow;
};
const ApplicationProgressPage = ({
  applicationInformationData,
  onlineApplicationData,
  onlineAssessmentData,
  hrScreeningData,
}: Props) => {
  let maxValue = 0;

  if (Boolean(hrScreeningData)) {
    maxValue = 3;
  } else if (Boolean(onlineAssessmentData)) {
    maxValue = 2;
  } else if (Boolean(onlineApplicationData)) {
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
              !Boolean(onlineApplicationData)
            }
          />
        );
      case 1:
        if (!onlineApplicationData) return;
        return (
          <OnlineApplication
            onlineApplicationData={onlineApplicationData}
            isWithNextStep={
              onlineApplicationData.request_status === "APPROVED" &&
              !Boolean(onlineAssessmentData)
            }
          />
        );
      case 2:
        if (!onlineAssessmentData) return;
        return <OnlineAssessment onlineAssessmentData={onlineAssessmentData} />;
      case 3:
        if (!hrScreeningData) return;
        return <HRScreening hrScreeningData={hrScreeningData} />;
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
            label="Online Application"
            disabled={!Boolean(onlineApplicationData)}
            {...stepperProps(onlineApplicationData?.request_status as string)}
          />
          <Stepper.Step
            label="Online Assessment"
            disabled={!Boolean(onlineAssessmentData)}
            {...stepperProps(onlineAssessmentData?.request_status as string)}
          />
          <Stepper.Step
            label="HR Screening"
            disabled={!Boolean(hrScreeningData)}
            {...stepperProps(hrScreeningData?.hr_screening_status as string)}
          />
          <Stepper.Step label="Director Screening" disabled />
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
