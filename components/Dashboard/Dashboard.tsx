import { useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
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

const Dashboard = () => {
  const formList = useFormList();
  const router = useRouter();
  const activeTeam = useActiveTeam();
  const routerFormId =
    router.query.formId !== undefined ? `${router.query.formId}` : null;
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedForm, setSelectedForm] = useState<string | null>(routerFormId);
  const [selectedDays, setSelectedDays] = useState<string | null>(null);
  const previousActiveTeamId = usePrevious(activeTeam.team_id);
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
    if (formData.length > 0) {
      setSelectedForm(formData[2].value);
    }
  }, [formData]);

  useEffect(() => {
    if (previousActiveTeamId !== activeTeam.team_id) {
      setSelectedForm(null);
    }
  }, [activeTeam.team_id]);

  useEffect(() => {
    if (selectedDays && Number(selectedDays) > 0) {
      const currDate = new Date();
      const startDate = new Date(currentDate);
      startDate.setDate(currDate.getDate() - 7);

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
            />
            <Select
              label="Date Created"
              placeholder="Select days"
              data={DAYSDATA}
              value={selectedDays}
              onChange={setSelectedDays}
              searchable
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
    </Container>
  );
};

export default Dashboard;
