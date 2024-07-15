import { getLRFSummaryData } from "@/backend/api/get";
import {
  DEFAULT_NUMBER_SSOT_ROWS,
  formatDate,
  formatTime,
} from "@/utils/constant";
import { safeParse } from "@/utils/functions";
import { LRFSpreadsheetData, OptionType } from "@/utils/types";
import {
  Box,
  Button,
  Center,
  createStyles,
  Group,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import ExportCSVButton from "./ExportCSVButton";

const useStyles = createStyles((theme) => ({
  parentTable: {
    "& th": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.blue[6]
          : theme.colors.red[3],
      height: 48,
    },
    "& tbody": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.red[9]
          : theme.colors.red[0],
    },
    "& td": {
      minWidth: 130,
      width: "100%",
    },
  },
}));

type Props = {
  initialData: LRFSpreadsheetData[];
  projectListOptions: OptionType[];
};

const LRFSpreadsheetView = ({ initialData, projectListOptions }: Props) => {
  const user = useUser();
  const { classes } = useStyles();
  const supabaseClient = useSupabaseClient();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);

  const fetchData = async ({
    currentPage,
    projectFilter,
  }: {
    currentPage: number;
    projectFilter?: string;
  }) => {
    try {
      if (!user) return;
      setLoading(true);

      const { data: newData } = await getLRFSummaryData(supabaseClient, {
        userId: user.id,
        limit: DEFAULT_NUMBER_SSOT_ROWS,
        page: currentPage,
        projectFilter: projectFilter ?? undefined,
      });

      return newData;
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to fetch data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterData = async (value: string | null) => {
    setProjectFilter(value);
    setPage(1);
    const newData = await fetchData({
      currentPage: 1,
      projectFilter: value ?? undefined,
    });

    if (!newData) throw Error;

    setData(newData);
  };

  const handlePagination = async (currentPage: number) => {
    setPage(currentPage);
    const newData = await fetchData({
      currentPage,
      projectFilter: projectFilter ?? undefined,
    });

    if (newData && newData.length > 0) {
      setPage(currentPage);
    }

    if (!newData) throw Error;

    setData((prev) => [...prev, ...newData]);
  };

  const MainTableRow = ({
    item,
    index,
  }: {
    item: LRFSpreadsheetData;
    index: number;
  }) => (
    <tr>
      <td>{`${item.request_formsly_id_prefix}-${item.request_formsly_id_serial}`}</td>
      <td>{item.jira_project_jira_label}</td>
      <td>{item.request_department_code}</td>
      <td>{item.request_jira_id}</td>
      <td>
        {formatDate(new Date(item.request_date_created))}{" "}
        {formatTime(new Date(item.request_date_created))}
      </td>
      <td>
        {item.request_boq_data
          ? item.request_boq_data.request_formsly_id
          : "N/A"}
      </td>
      <td style={{ padding: 0 }}>
        {renderNestedTable({
          requestResponseList: item.request_response_list,
          parentIndex: index,
        })}
      </td>
    </tr>
  );

  const renderNestedTable = ({
    requestResponseList,
    parentIndex,
  }: {
    requestResponseList: LRFSpreadsheetData["request_response_list"];
    parentIndex: number;
  }) => {
    const groupedRows = renderNestedRows(requestResponseList);

    return (
      <Table withColumnBorders>
        {parentIndex === 0 && (
          <thead>
            <tr>
              <th>Supplier Name/Payee</th>
              <th>Type of Request</th>
              <th>Invoice Amount</th>
              <th>VAT</th>
              <th>Cost</th>
              <th>Equipment/Cost Code</th>
              <th>BOQ Code</th>
            </tr>
          </thead>
        )}
        <tbody>{groupedRows}</tbody>
      </Table>
    );
  };

  const renderNestedRows = (
    responseList: LRFSpreadsheetData["request_response_list"]
  ) => {
    const groupedData = responseList.reduce((acc, current) => {
      const key =
        current.request_response_request_id +
        (current.request_response_duplicatable_section_id || "");
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(current);
      return acc;
    }, {} as { [key: string]: LRFSpreadsheetData["request_response_list"] });

    return Object.values(groupedData).map((responses, index) => (
      <tr key={index}>{renderCells(responses)}</tr>
    ));
  };

  const renderCells = (
    responseList: LRFSpreadsheetData["request_response_list"]
  ) => {
    const fields = [
      "Supplier Name/Payee",
      "Type of Request",
      "Invoice Amount",
      "VAT",
      "Cost",
      "Equipment/Cost Code",
      "Bill of Quantity Code",
    ];

    return fields.map((field) => {
      let response: string | undefined;

      if (field === "Equipment/Cost Code") {
        response =
          responseList.find(
            (response) => response.field_name === "Equipment Code"
          )?.request_response ||
          responseList.find((response) => response.field_name === "Cost Code")
            ?.request_response;
      } else {
        response = responseList.find(
          (response) => response.field_name === field
        )?.request_response;
      }

      const value = safeParse(response ?? "");

      const isNumber = !isNaN(value) && value !== "";

      return <td key={field}>{isNumber ? Number(value).toFixed(2) : value}</td>;
    });
  };

  return (
    <Stack>
      <Box>
        <Group>
          <Title order={2} color="dimmed">
            Liquidation Spreadsheet View
          </Title>
          <Select
            placeholder="Filter by Project"
            data={projectListOptions}
            value={projectFilter}
            onChange={handleFilterData}
            allowDeselect
            clearable
          />
          {data.length > 0 && <ExportCSVButton data={data} />}
        </Group>
      </Box>
      <Paper p="xs">
        <ScrollArea type="auto" scrollbarSize={10} pos="relative">
          <LoadingOverlay visible={loading} overlayBlur={3} />
          <Table withBorder withColumnBorders className={classes.parentTable}>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Project Code</th>
                <th>Department Code</th>
                <th>Jira ID</th>
                <th>Date Created</th>
                <th>BOQ Request</th>
                <th>Payee</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <MainTableRow key={item.request_id} item={item} index={index} />
              ))}
            </tbody>
          </Table>
        </ScrollArea>
        <Center mt="md">
          <Button
            leftIcon={<IconChevronDown size={16} />}
            onClick={() => handlePagination(page + 1)}
            disabled={loading}
            variant="subtle"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </Center>
      </Paper>
    </Stack>
  );
};

export default LRFSpreadsheetView;
