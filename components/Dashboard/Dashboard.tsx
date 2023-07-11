import { useFormList } from "@/stores/useFormStore";
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
import { usePrevious } from "@mantine/hooks";
import { IconAlertCircle, IconCalendarEvent } from "@tabler/icons-react";
import { startCase } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Overview from "./OverviewTab/Overview";
import ResponseTab from "./ResponseTab/ResponseTab";

const TABS = ["overview", "responses"];
const SPECIAL_FORMS = [
  "Order to Purchase",
  "Receiving Inspecting Report",
  "Quotation",
];

type Props = {
  activeTeamId: string;
};

const Dashboard = ({ activeTeamId }: Props) => {
  const formList = useFormList();
  const router = useRouter();
  const routerFormId =
    router.query.formId !== undefined ? `${router.query.formId}` : null;
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedForm, setSelectedForm] = useState<string | null>(routerFormId);
  const previousActiveTeamId = usePrevious(activeTeamId);
  const [isOTPForm, setIsOTPForm] = useState(false);

  const dateFilterList = [
    {
      value: moment({ year: moment().year(), month: 0, day: 1 }).format(
        "YYYY-MM-DD"
      ),
      label: `This year, ${moment().year()}`,
    },
    {
      value: moment().subtract(6, "months").format("YYYY-MM-DD"),
      label: `Last 6 months: ${moment()
        .subtract(6, "months")
        .format("MMM DD, YYYY")} - ${moment().format("MMM DD, YYYY")}`,
    },
  ];
  const [dateFilter, setDateFilter] = useState(dateFilterList[0].value);

  // check if selected form is formsly form
  const isFormslyForm =
    formList.find((form) => form.form_id === selectedForm)
      ?.form_is_formsly_form || false;
  const selectedFormName =
    formList.find((form) => form.form_id === selectedForm)?.form_name || "";

  useEffect(() => {
    setIsOTPForm(isFormslyForm && SPECIAL_FORMS.includes(selectedFormName));
  }, [isFormslyForm, selectedFormName]);

  useEffect(() => {
    if (previousActiveTeamId !== activeTeamId) {
      setSelectedForm(null);
    }
  }, [activeTeamId]);

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

      case "responses":
        return selectedForm ? (
          <ResponseTab
            isOTPForm={isOTPForm}
            selectedForm={selectedForm}
            selectedFormName={selectedFormName}
            activeTeamId={activeTeamId}
          />
        ) : (
          <Alert icon={<IconAlertCircle size="1rem" />} color="orange">
            Please select a form to generate data.
          </Alert>
        );
    }
  };

  return (
    <Container p={0} maw={1024} h="100%">
      <Stack>
        <Group position="apart">
          <Title order={2}>Dashboard</Title>
          <Select
            w={300}
            data={dateFilterList}
            value={dateFilter}
            onChange={(value: string) => setDateFilter(value)}
            icon={<IconCalendarEvent />}
          />
        </Group>
        <Flex justify="space-between" rowGap="sm" wrap="wrap">
          <SegmentedControl
            value={selectedTab}
            onChange={setSelectedTab}
            data={TABS.map((tab) => ({ value: tab, label: startCase(tab) }))}
          />

          <Group>
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
          </Group>
        </Flex>
        <Box>{renderTabs(selectedTab)}</Box>
      </Stack>
    </Container>
  );
};

export default Dashboard;
