import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
import { JoyRideNoSSR } from "@/utils/functions";
import { ONBOARDING_DASHBOARD_STEP, ONBOARD_NAME } from "@/utils/onboarding";
import { startCase } from "@/utils/string";
import {
  Alert,
  Box,
  Button,
  Container,
  Flex,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { usePrevious } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconAlertCircle, IconCalendarEvent } from "@tabler/icons-react";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CallBackProps, STATUS } from "react-joyride";
import Overview from "./OverviewTab/Overview";

// response tab is hidden
const TABS = ["overview"];
// const SPECIAL_FORMS = [
//   "Requisition",
//   "Receiving Inspecting Report",
//   "Quotation",
// ];
const DAYSDATA = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "0", label: "Custom" },
];

type Props = {
  ticketListCount: number;
};

const Dashboard = ({ ticketListCount }: Props) => {
  const router = useRouter();
  const { colors } = useMantineTheme();
  const formList = useFormList();
  const activeTeam = useActiveTeam();
  const teamMember = useUserTeamMember();
  const [isOnboarding, setIsOnboarding] = useState(false);

  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string | null>(null);
  const previousActiveTeamId = usePrevious(activeTeam.team_id);
  const [isFetching, setIsFetching] = useState(true);
  // const [isRequsitionForm, setIsRequsitionForm] = useState(false);

  const currentDate = moment().toDate();
  const firstDayOfCurrentYear = moment({
    year: moment().year(),
    month: 0,
    day: 1,
  }).toDate();

  const [startDateFilter, setStartDateFilter] = useState<Date | null>(
    firstDayOfCurrentYear
  );
  const [endDateFilter, setEndDateFilter] = useState<Date | null>(currentDate);

  //check if selected form is formsly form
  // const isFormslyForm =
  //   formList.find((form) => form.form_id === selectedForm)
  //     ?.form_is_formsly_form || false;
  // const selectedFormName =
  //   formList.find((form) => form.form_id === selectedForm)?.form_name || "";

  // useEffect(() => {
  //   setIsRequsitionForm(isFormslyForm && SPECIAL_FORMS.includes(selectedFormName));
  // }, [isFormslyForm, selectedFormName]);

  const formData = formList
    .filter(
      (form) =>
        (form.form_is_formsly_form &&
          !UNHIDEABLE_FORMLY_FORMS.includes(form.form_name)) ||
        !form.form_is_formsly_form
    )
    .map((form) => ({
      value: form.form_id,
      label: form.form_name,
    }));
  useEffect(() => {
    if (formData.length) {
      const requisitionIndex = formData
        .map((form) => form.label)
        .indexOf("Requisition");

      if (selectedForm) return;
      if (requisitionIndex !== -1) {
        setSelectedForm(formData[requisitionIndex].value);
      } else {
        setSelectedForm(formData[0].value ?? null);
      }
    }
  }, [formData]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED) {
      console.log("first");
      router.push(
        `/user/onboarding/test?notice=success&onboardName=${ONBOARD_NAME.DASHBOARD}`
      );
    }
  };

  const openDashboardOnboardingModal = () =>
    modals.open({
      centered: true,
      closeOnEscape: false,
      closeOnClickOutside: false,
      withCloseButton: false,
      zIndex: 1000,
      children: (
        <Box>
          <Title order={3}>Welcome to Dashboard Overview</Title>
          <Text mt="xs" align="justify">
            Navigate through key features, including &apos;Total Requests,&apos;
            &apos;Top Requestor,&apos; &apos;Top Signer,&apos; and &apos;Monthly
            Statistics.&apos; Effortlessly track and manage your requests with
            our user-friendly dashboard. This quick session will guide you
            through the essentials for a seamless and informed experience.
          </Text>
          <Flex justify="flex-end" direction="row" gap="md" mt="lg">
            <Button
              variant="outline"
              onClick={() => {
                modals.closeAll();
                setIsOnboarding(false);
                router.push("/team-requests/dashboard", undefined, {
                  shallow: true,
                });
              }}
            >
              Skip Onboarding
            </Button>
            <Button
              onClick={() => {
                modals.closeAll();
                setIsOnboarding(true);
              }}
            >
              Start
            </Button>
          </Flex>
        </Box>
      ),
    });

  useEffect(() => {
    if (router.query.onboarding) {
      setIsOnboarding(true);
      openDashboardOnboardingModal();
    }
  }, [router.query]);

  useEffect(() => {
    if (previousActiveTeamId && previousActiveTeamId !== activeTeam.team_id) {
      setSelectedForm(null);
    }
  }, [activeTeam.team_id]);

  useEffect(() => {
    if (selectedDays && Number(selectedDays) > 0) {
      const currDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(currDate.getDate() - Number(selectedDays));

      setStartDateFilter(startDate);
      setEndDateFilter(currDate);
    }
  }, [selectedDays]);
  const renderTabs = (tab: string) => {
    switch (tab) {
      case "overview":
        return (
          <>
            {!selectedForm && (
              <Alert
                mb="sm"
                icon={<IconAlertCircle size="1rem" />}
                color="blue"
              >
                Please select a form to generate data.
              </Alert>
            )}
            <Overview
              selectedDays={selectedDays}
              startDateFilter={startDateFilter}
              endDateFilter={endDateFilter}
              selectedForm={selectedForm}
              setIsFetching={setIsFetching}
            />
          </>
        );

      // case "responses":
      //   return selectedForm ? (
      //     <ResponseTab
      //       isRequsitionForm={isRequsitionForm}
      //       selectedForm={selectedForm}
      //       selectedFormName={selectedFormName}
      //       activeTeamId={activeTeam.team_id}
      //     />
      //   ) : (
      //     <Alert icon={<IconAlertCircle size="1rem" />} color="orange">
      //       Please select a form to generate data.
      //     </Alert>
      //   );
    }
  };

  return (
    <Container p={0} maw={1024} h="100%">
      <Stack>
        <Group position="apart">
          <Title order={2}>Dashboard</Title>
        </Group>
        {(teamMember?.team_member_role === "ADMIN" ||
          teamMember?.team_member_role === "OWNER") &&
          ticketListCount > 0 && (
            <Alert variant="light" color="blue" title="Pending Tickets">
              <Group>
                <Text>{`Your team have (${ticketListCount}) pending tickets.`}</Text>
                <Button
                  size="xs"
                  onClick={() => router.push("/team-requests/tickets")}
                >
                  Resolve
                </Button>
              </Group>
            </Alert>
          )}
        <Flex
          justify="space-between"
          align="flex-end"
          rowGap="sm"
          wrap="wrap"
          direction={{ base: "column-reverse", sm: "row" }}
        >
          <SegmentedControl
            value={selectedTab}
            onChange={setSelectedTab}
            data={TABS.map((tab) => ({ value: tab, label: startCase(tab) }))}
          />
          <Group>
            <Select
              label="Form"
              placeholder="Select a Form"
              data={formData}
              value={selectedForm}
              onChange={setSelectedForm}
              searchable
              disabled={isFetching}
              className="onboarding-dashboard-filter-form"
            />
            <Select
              label="Date Created"
              placeholder="Select days"
              data={DAYSDATA}
              value={selectedDays}
              onChange={setSelectedDays}
              searchable
              disabled={isFetching}
              className="onboarding-dashboard-filter-date-created"
            />

            {selectedDays === "0" && (
              <>
                <DatePickerInput
                  label="Start Date"
                  placeholder="Select a start date"
                  value={startDateFilter}
                  onChange={setStartDateFilter}
                  icon={<IconCalendarEvent />}
                  dropdownType="popover"
                  minDate={new Date("2023-01-01")}
                  maxDate={currentDate}
                />
                <DatePickerInput
                  label="End Date"
                  placeholder="Select a end date"
                  value={endDateFilter}
                  onChange={setEndDateFilter}
                  icon={<IconCalendarEvent />}
                  dropdownType="popover"
                  minDate={startDateFilter || new Date()}
                  maxDate={currentDate}
                />
              </>
            )}
          </Group>
        </Flex>
        <Box>{renderTabs(selectedTab)}</Box>
      </Stack>

      <JoyRideNoSSR
        callback={handleJoyrideCallback}
        continuous
        run={isOnboarding}
        steps={ONBOARDING_DASHBOARD_STEP}
        scrollToFirstStep
        hideCloseButton
        disableCloseOnEsc
        disableOverlayClose
        showProgress
        styles={{
          buttonNext: { backgroundColor: colors.blue[6] },
          buttonBack: { color: colors.blue[6] },
          beaconInner: { backgroundColor: colors.blue[6] },
          tooltipContent: { padding: 0 },
        }}
      />
    </Container>
  );
};

export default Dashboard;
