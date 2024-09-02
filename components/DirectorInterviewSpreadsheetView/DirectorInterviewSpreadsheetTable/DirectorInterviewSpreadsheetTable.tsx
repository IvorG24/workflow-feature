import { DirectorInterviewSpreadsheetData } from "@/utils/types";
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
import DirectorInterviewMainTableRow from "./DirectorInterviewMainTableRow";

const useStyles = createStyles((theme) => ({
  parentTable: {
    backgroundColor: theme.colors.blue[3],
  },
}));

type Props = {
  data: DirectorInterviewSpreadsheetData[];
  isLoading: boolean;
  page: number;
  handlePagination: (page: number) => void;
  sort: { sortBy: string; order: string };
  setSort: Dispatch<SetStateAction<{ sortBy: string; order: string }>>;
  isMax: boolean;
  hiddenColumnList: string[];
  handleUpdateDirectorInterviewStatus: (
    status: string,
    data: DirectorInterviewSpreadsheetData
  ) => void;
  setData: Dispatch<SetStateAction<DirectorInterviewSpreadsheetData[]>>;
};

const DirectorInterviewSpreadsheetTable = ({
  data,
  isLoading,
  page,
  handlePagination,
  sort,
  setSort,
  isMax,
  hiddenColumnList,
  handleUpdateDirectorInterviewStatus,
  setData
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
                  "director_assessment_request_id"
                ) && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Director Assessment Request ID</Text>
                      {sortButtons("directorAssessment.request_formsly_id")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("director_assessment_score") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Director Assessment Score</Text>
                      {sortButtons(
                        "directorAssessmentScore.request_score_value"
                      )}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("director_interview_date_created") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Director Interview Date Created</Text>
                      {sortButtons("director_interview_date_created")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("director_interview_status") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Director Interview Status</Text>
                      {sortButtons("director_interview_status")}
                    </Flex>
                  </th>
                )}
                {!hiddenColumnList.includes("director_interview_schedule") && (
                  <th>
                    <Flex gap="xs" align="center" justify="center" wrap="wrap">
                      <Text>Director Interview Schedule</Text>
                      {sortButtons("director_interview_schedule")}
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
                <DirectorInterviewMainTableRow
                  key={item.application_information_request_id}
                  item={item}
                  hiddenColumnList={hiddenColumnList}
                  handleUpdateDirectorInterviewStatus={handleUpdateDirectorInterviewStatus}
                  setData={setData}

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

export default DirectorInterviewSpreadsheetTable;
