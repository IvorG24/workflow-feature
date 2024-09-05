import {
  AttachmentTableRow,
  BackgroundCheckTableRow,
  DirectorInterviewTableRow,
  HRPhoneInterviewTableRow,
  JobOfferTableRow,
  RequestViewRow,
  TechnicalInterviewTableRow,
  TradeTestTableRow,
} from "@/utils/types";
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
  IconHourglass,
  IconProgress,
  IconTag,
} from "@tabler/icons-react";
import { useState } from "react";
import ApplicationInformation from "./ApplicationInformation";
import BackgroundCheck from "./BackgroundCheck";
import DirectorInterview from "./DirectorInterview";
import GeneralAssessment from "./GeneralAssessment";
import HRPhoneInterview from "./HRPhoneInterview";
import JobOffer from "./JobOffer";
import TechnicalAssessment from "./TechnicalAssessment";
import TechnicalInterview from "./TechnicalInterview";
import TradeTest from "./TradeTest";

type Props = {
  applicationInformationData: RequestViewRow;
  generalAssessmentData?: RequestViewRow;
  technicalAssessmentData?: RequestViewRow;
  hrPhoneInterviewData?: HRPhoneInterviewTableRow;
  tradeTestData?: TradeTestTableRow | null;
  technicalInterviewData?: TechnicalInterviewTableRow | null;
  directorInterviewData?: DirectorInterviewTableRow | null;
  backgroundCheckData?: BackgroundCheckTableRow | null;
  jobOfferData?: (JobOfferTableRow & AttachmentTableRow) | null;
};
const ApplicationProgressPage = (props: Props) => {
  const {
    applicationInformationData,
    generalAssessmentData,
    technicalAssessmentData,
    hrPhoneInterviewData,
    tradeTestData,
    technicalInterviewData,
    directorInterviewData,
    backgroundCheckData,
    jobOfferData,
  } = props;

  const [jobOfferStatus, setJobOfferStatus] = useState(
    jobOfferData?.job_offer_status ?? ""
  );

  const typeCastedProps = props as unknown as Record<string, string>;
  const keyIndexMatcher: Record<number, string> = {};
  const indexComponentMatcher: Record<string, JSX.Element | null> = {
    applicationInformationData: (
      <ApplicationInformation
        applicationInformationData={applicationInformationData}
        isWithNextStep={
          applicationInformationData.request_status === "APPROVED" &&
          !Boolean(generalAssessmentData)
        }
      />
    ),
    generalAssessmentData: generalAssessmentData ? (
      <GeneralAssessment
        generalAssessmentData={generalAssessmentData}
        isWithNextStep={
          generalAssessmentData.request_status === "APPROVED" &&
          !Boolean(technicalAssessmentData)
        }
      />
    ) : null,
    technicalAssessmentData: technicalAssessmentData ? (
      <TechnicalAssessment technicalAssessmentData={technicalAssessmentData} />
    ) : null,
    hrPhoneInterviewData: hrPhoneInterviewData ? (
      <HRPhoneInterview hrPhoneInterviewData={hrPhoneInterviewData} />
    ) : null,
    tradeTestData: tradeTestData ? (
      <TradeTest tradeTestData={tradeTestData} />
    ) : null,
    technicalInterviewData: technicalInterviewData ? (
      <TechnicalInterview technicalInterviewData={technicalInterviewData} />
    ) : null,
    directorInterviewData: directorInterviewData ? (
      <DirectorInterview directorInterviewData={directorInterviewData} />
    ) : null,
    backgroundCheckData: backgroundCheckData ? (
      <BackgroundCheck backgroundCheckData={backgroundCheckData} />
    ) : null,
    jobOfferData: jobOfferData ? (
      <JobOffer
        jobOfferData={jobOfferData}
        jobOfferStatus={jobOfferStatus}
        setJobOfferStatus={setJobOfferStatus}
      />
    ) : null,
  };
  let maxValue = -1;
  let currentMaxValue = -1;
  Object.keys(props).forEach((key) => {
    if (Boolean(typeCastedProps[key])) {
      currentMaxValue += 1;
      maxValue += 1;
      keyIndexMatcher[maxValue] = key;
    } else {
      if (typeCastedProps[key] === undefined) {
        maxValue += 1;
        keyIndexMatcher[maxValue] = key;
      }
    }
  });

  const [stepperValue, setStepperValue] = useState(currentMaxValue);

  const stepperProps = (value: string) => {
    switch (value) {
      case "APPROVED":
      case "QUALIFIED":
      case "ACCEPTED":
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
      case "WAITING FOR OFFER":
        return {
          description: (
            <Badge color="orange">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconTag color={"#FD7E14"} />,
          completedIcon: <IconTag color={"white"} />,
          color: "orange",
        };
      case "FOR POOLING":
        return {
          description: (
            <Badge color="yellow">
              <Text>{value}</Text>
            </Badge>
          ),
          icon: <IconHourglass color={"#FBB605"} />,
          completedIcon: <IconHourglass color={"white"} />,
          color: "yellow",
        };
    }
  };

  const renderContent = () => {
    return indexComponentMatcher[keyIndexMatcher[stepperValue]];
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
          {tradeTestData !== null && (
            <Stepper.Step
              label="Trade Test"
              disabled={!Boolean(tradeTestData)}
              {...stepperProps(tradeTestData?.trade_test_status as string)}
            />
          )}
          {technicalInterviewData !== null && (
            <Stepper.Step
              label="Technical Interview"
              disabled={!Boolean(technicalInterviewData)}
              {...stepperProps(
                technicalInterviewData?.technical_interview_status as string
              )}
            />
          )}
          {directorInterviewData !== null && (
            <Stepper.Step
              label="Director Interview"
              disabled={!Boolean(directorInterviewData)}
              {...stepperProps(
                directorInterviewData?.director_interview_status as string
              )}
            />
          )}
          {backgroundCheckData !== null && (
            <Stepper.Step
              label="Background Check"
              disabled={!Boolean(backgroundCheckData)}
              {...stepperProps(
                backgroundCheckData?.background_check_status as string
              )}
            />
          )}
          <Stepper.Step
            label="Job Offer"
            disabled={!Boolean(jobOfferData)}
            {...stepperProps(jobOfferStatus as string)}
          />
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
                  disabled={stepperValue === currentMaxValue}
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
