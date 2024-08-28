import { HRPhoneInterviewSpreadsheetData } from "@/utils/types";
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
import HRPhoneInterviewMainTableRow from "./HRPhoneInterviewMainTableRow";

const useStyles = createStyles((theme) => ({
  parentTable: {
    backgroundColor: theme.colors.blue[3],
  },
}));

type Props = {
  data: HRPhoneInterviewSpreadsheetData[];
  isLoading: boolean;
  page: number;
  handlePagination: (page: number) => void;
  sort: { sortBy: string; order: string };
  setSort: Dispatch<SetStateAction<{ sortBy: string; order: string }>>;
  isMax: boolean;
  hiddenColumnList: string[];
  handleUpdateHRPhoneInterviewStatus: (
    applicationinformationRqeuestId: string,
    status: string
  ) => void;
};

const HRPhoneInterviewSpreadsheetTable = ({
  data,
  isLoading,
  page,
  handlePagination,
  sort,
  setSort,
  isMax,
  hiddenColumnList,
  handleUpdateHRPhoneInterviewStatus,
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
                  "application_information_full_name"
                ) && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Name</Text>
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes(
                  "application_information_contact_number"
                ) && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Contact Number</Text>
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes(
                  "application_information_email"
                ) && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Email</Text>
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
                  "application_information_score"
                ) && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Application Information Score</Text>
                      {sortButtons(
                        "applicationInformationScore.request_score_value"
                      )}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes(
                  "general_assessment_request_id"
                ) && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>General Assessment Request ID</Text>
                      {sortButtons("generalAssessment.request_formsly_id")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("general_assessment_score") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>General Assessment Score</Text>
                      {sortButtons(
                        "generalAssessmentScore.request_score_value"
                      )}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes(
                  "technical_assessment_request_id"
                ) && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Technical Assessment Request ID</Text>
                      {sortButtons("technicalAssessment.request_formsly_id")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("technical_assessment_score") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Technical Assessment Score</Text>
                      {sortButtons(
                        "technicalAssessmentScore.request_score_value"
                      )}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("technical_assessment_date") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Technical Assessment Date</Text>
                      {sortButtons("technicalAssessment.request_date_created")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("hr_phone_interview_status") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>HR Phone Interview Status</Text>
                      {sortButtons("hr_phone_interview_status")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("hr_phone_interview_schedule") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>HR Phone Interview Schedule</Text>
                      {sortButtons("hr_phone_interview_schedule")}
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
                <HRPhoneInterviewMainTableRow
                  key={item.application_information_request_id}
                  item={item}
                  hiddenColumnList={hiddenColumnList}
                  handleUpdateHRPhoneInterviewStatus={
                    handleUpdateHRPhoneInterviewStatus
                  }
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

export default HRPhoneInterviewSpreadsheetTable;
