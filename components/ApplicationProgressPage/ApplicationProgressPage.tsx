import { RequestViewRow } from "@/utils/types";
import { Container, Space, Stepper, Title } from "@mantine/core";
import { IconCircleCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";

type Props = {
  applicationInformationData: RequestViewRow | null;
  onlineApplicationData: RequestViewRow | null;
  onlineAssessmentData: RequestViewRow | null;
};
const ApplicationProgressPage = ({
  applicationInformationData,
  onlineApplicationData,
  onlineAssessmentData,
}: Props) => {
  const [stepperValue, setStepperValue] = useState(0);
  return (
    <Container fluid>
      <Title order={2} color="dimmed">
        Application Progress
      </Title>
      <Space h="xl" />
      <Stepper
        active={stepperValue}
        onStepClick={setStepperValue}
        orientation="vertical"
        completedIcon={<IconCircleCheck />}
      >
        <Stepper.Step
          label="Application Information"
          description={
            applicationInformationData
              ? applicationInformationData.request_status
              : ""
          }
          disabled={Boolean(applicationInformationData)}
          icon={<IconX color="red" />}
          color="red"
        />
        <Stepper.Step
          label="Online Application"
          description={
            onlineApplicationData ? onlineApplicationData.request_status : ""
          }
          disabled={Boolean(onlineApplicationData)}
        />
        <Stepper.Step
          label="Online Assessment"
          description={
            onlineAssessmentData ? onlineAssessmentData.request_status : ""
          }
          disabled={Boolean(onlineAssessmentData)}
        />
        <Stepper.Step label="HR Screening" />
        <Stepper.Step label="Director Screening" />
        <Stepper.Step label="Job Offer" />
      </Stepper>
    </Container>
  );
};

export default ApplicationProgressPage;
