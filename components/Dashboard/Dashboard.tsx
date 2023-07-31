import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import {
  Alert,
  Box,
  Container,
  Flex,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { usePrevious } from "@mantine/hooks";
import { IconAlertCircle, IconCalendarEvent } from "@tabler/icons-react";
import { startCase } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Overview from "./OverviewTab/Overview";

// response tab is hidden
const TABS = ["overview"];
// const SPECIAL_FORMS = [
//   "Order to Purchase",
//   "Receiving Inspecting Report",
//   "Quotation",
// ];

const Dashboard = () => {
  const formList = useFormList();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const routerFormId =
    router.query.formId !== undefined ? `${router.query.formId}` : null;
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedForm, setSelectedForm] = useState<string | null>(routerFormId);
  const previousActiveTeamId = usePrevious(activeTeam.team_id);
  // const [isOTPForm, setIsOTPForm] = useState(false);

  const currentDate = moment().toDate();
  const firstDayOfCurrentYear = moment({
    year: moment().year(),
    month: 0,
    day: 1,
  }).toDate();

  const [dateFilter, setDateFilter] = useState<[Date | null, Date | null]>([
    firstDayOfCurrentYear,
    currentDate,
  ]);

  //check if selected form is formsly form
  // const isFormslyForm =
  //   formList.find((form) => form.form_id === selectedForm)
  //     ?.form_is_formsly_form || false;
  // const selectedFormName =
  //   formList.find((form) => form.form_id === selectedForm)?.form_name || "";

  // useEffect(() => {
  //   setIsOTPForm(isFormslyForm && SPECIAL_FORMS.includes(selectedFormName));
  // }, [isFormslyForm, selectedFormName]);

  useEffect(() => {
    if (previousActiveTeamId !== activeTeam.team_id) {
      setSelectedForm(null);
    }
  }, [activeTeam.team_id]);

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
            <Overview dateFilter={dateFilter} selectedForm={selectedForm} />
          </>
        );

      // case "responses":
      //   return selectedForm ? (
      //     <ResponseTab
      //       isOTPForm={isOTPForm}
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
          <DatePickerInput
            type="range"
            placeholder="Select a start and end date"
            value={dateFilter}
            onChange={setDateFilter}
            icon={<IconCalendarEvent />}
            dropdownType="popover"
            maxDate={currentDate}
            allowSingleDateInRange
            w={300}
          />
        </Group>
        <Flex
          justify="space-between"
          rowGap="sm"
          wrap="wrap"
          direction={{ base: "column-reverse", sm: "row" }}
        >
          <SegmentedControl
            value={selectedTab}
            onChange={setSelectedTab}
            data={TABS.map((tab) => ({ value: tab, label: startCase(tab) }))}
          />

          <Select
            w={300}
            placeholder="Select a Form"
            data={formList.map((form) => ({
              value: form.form_id,
              label: form.form_name,
            }))}
            value={selectedForm}
            onChange={setSelectedForm}
            searchable
          />
        </Flex>
        <Box>{renderTabs(selectedTab)}</Box>
      </Stack>
    </Container>
  );
};

export default Dashboard;
