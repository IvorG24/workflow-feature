import { HRScreeningSpreadsheetData } from "@/utils/types";
import {
  ActionIcon,
  Button,
  Center,
  createStyles,
  Flex,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconChevronDown,
} from "@tabler/icons-react";

import { Dispatch, SetStateAction } from "react";
import HRScreeningMainTableRow from "./HRScreeningMainTableRow";

const useStyles = createStyles((theme) => ({
  parentTable: {
    backgroundColor: theme.colors.blue[3],
  },
}));

type Props = {
  data: HRScreeningSpreadsheetData[];
  isLoading: boolean;
  page: number;
  handlePagination: (page: number) => void;
  sort: { sortBy: string; order: string };
  setSort: Dispatch<SetStateAction<{ sortBy: string; order: string }>>;
  isMax: boolean;
  hiddenColumnList: string[];
  handleUpdateHRScreeningStatus: (
    applicationinformationRqeuestId: string,
    status: string
  ) => void;
};

const HRScreeningSpreadsheetTable = ({
  data,
  isLoading,
  page,
  handlePagination,
  sort,
  setSort,
  isMax,
  hiddenColumnList,
  handleUpdateHRScreeningStatus,
}: Props) => {
  const { classes } = useStyles();

  const handleSortClick = (sortBy: string) => {
    setSort((prev) => {
      if (prev.sortBy === sortBy) {
        return {
          sortBy,
          order: prev.order === "ASC" ? "DESC" : "ASC",
        };
      } else {
        return {
          sortBy,
          order: "DESC",
        };
      }
    });
  };

  const sortButtons = (sortBy: string) => {
    return (
      <ActionIcon
        onClick={() => {
          handleSortClick(sortBy);
        }}
        color={sort.sortBy !== sortBy ? "dark" : "blue"}
        variant={sort.sortBy !== sortBy ? "subtle" : "light"}
      >
        {sort.sortBy !== sortBy && <IconArrowsSort size={14} />}
        {sort.sortBy === sortBy && sort.order === "ASC" && (
          <IconArrowUp size={14} />
        )}
        {sort.sortBy === sortBy && sort.order === "DESC" && (
          <IconArrowDown size={14} />
        )}
      </ActionIcon>
    );
  };

  return (
    <Stack>
      <Paper p="xs" pos="relative">
        <ScrollArea type="auto" scrollbarSize={10}>
          <LoadingOverlay
            visible={isLoading}
            overlayBlur={0}
            overlayOpacity={0}
          />
          <Table withBorder withColumnBorders className={classes.parentTable}>
            <thead>
              <tr>
                {!hiddenColumnList.includes("position") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Position</Text>
                      {sortButtons("request_response")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes(
                  "application_information_request_id"
                ) && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Application Information Request ID</Text>
                      {sortButtons("applicationInformation.request_formsly_id")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes(
                  "online_application_request_id"
                ) && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Online Application Request ID</Text>
                      {sortButtons("onlineApplication.request_formsly_id")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("online_application_score") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Online Application Score</Text>
                      {sortButtons(
                        "onlineApplicationScore.request_score_value"
                      )}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("online_assessment_request_id") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Online Assessment Request ID</Text>
                      {sortButtons("onlineAssessment.request_formsly_id")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("online_assessment_score") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Online Assessment Score</Text>
                      {sortButtons("onlineAssessmentScore.request_score_value")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("online_assessment_date") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Online Assessment Date</Text>
                      {sortButtons("onlineAssessment.request_date_created")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("hr_screening_status") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>HR Screening Status</Text>
                      {sortButtons("hr_screening_status")}
                    </Flex>
                  </th>
                )}
                <th>
                  <Flex gap="xs" align="center" justify="center" wrap="wrap">
                    <Text>Action</Text>
                  </Flex>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <HRScreeningMainTableRow
                  key={item.application_information_request_id}
                  item={item}
                  hiddenColumnList={hiddenColumnList}
                  handleUpdateHRScreeningStatus={handleUpdateHRScreeningStatus}
                />
              ))}
            </tbody>
          </Table>
        </ScrollArea>
        {!isMax && (
          <Center mt="md">
            <Button
              leftIcon={<IconChevronDown size={16} />}
              onClick={() => handlePagination(page + 1)}
              disabled={isLoading}
              variant="subtle"
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </Center>
        )}
      </Paper>
    </Stack>
  );
};

export default HRScreeningSpreadsheetTable;
