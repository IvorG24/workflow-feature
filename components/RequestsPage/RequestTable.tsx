import { Close } from "@/components/Icon";
import { setBadgeColor } from "@/utils/request";
import type { Database, QuestionOptionRow, QuestionRow } from "@/utils/types";
import { FormTable, UserProfile } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  MultiSelect,
  NumberInput,
  Paper,
  Select,
  Slider,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker, DateRangePicker, TimeInput } from "@mantine/dates";
import { useViewportSize } from "@mantine/hooks";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import styles from "./RequestTable.module.scss";

type Marks = {
  value: number;
  label: string;
};

const MARKS: Marks[] = [
  {
    value: 1,
    label: "0%",
  },
  {
    value: 2,
    label: "25%",
  },
  {
    value: 3,
    label: "50%",
  },
  {
    value: 4,
    label: "75%",
  },
  {
    value: 5,
    label: "100%",
  },
];

type RequestType = FormTable & {
  owner: UserProfile;
} & { approver: UserProfile };

type QuestionsType = FormTable & { question: QuestionRow } & {
  question_option: QuestionOptionRow;
};

type Props = {
  requestList: RequestType[];
  selectedRequest: RequestType | null;
  setSelectedRequest: Dispatch<SetStateAction<RequestType | null>>;
  isApprover: boolean;
  handleApprove: () => void;
  handleSendToRevision: () => void;
  handleReject: () => void;
};

const RequestTable = ({
  requestList,
  selectedRequest,
  setSelectedRequest,
  isApprover,
  handleApprove,
  handleSendToRevision,
  handleReject,
}: Props) => {
  const { width } = useViewportSize();
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const [selectedRequestFields, setSelectedRequestFields] = useState<
    QuestionsType[]
  >([]);

  const handleSetSelectedRequest = async (request: RequestType) => {
    if (width < 1200) {
      router.push(`/requests/${request.request_id}`);
    } else {
      const { data } = await supabase
        .from("form_table")
        .select(
          `
            *,
            question:question_id(*),
            question_option:question_option_id(*)
          `
        )
        .eq("request_id", request.request_id)
        .not("question_id", "is", null)
        .order("created_at", { ascending: true });

      if (data) {
        setSelectedRequestFields(data as unknown as QuestionsType[]);
      }
      setSelectedRequest(request);
    }
  };

  const rows = requestList.map((request) => {
    return (
      <tr
        key={request.form_id}
        className={styles.row}
        onClick={() => handleSetSelectedRequest(request)}
      >
        <td>{request.request_id}</td>
        <td>{request.request_title}</td>
        <td>
          <Badge color={setBadgeColor(`${request.approval_status}`)}>
            {startCase(`${request.approval_status}`)}
          </Badge>
        </td>
        <td>{request.created_at?.slice(0, 10)}</td>
        <td>
          <Group>
            <Avatar radius={100} />
            {request.owner.full_name}
          </Group>
        </td>
        <td>
          <Group>
            <Avatar radius={100} />
            {request.approver.full_name}
          </Group>
        </td>
      </tr>
    );
  });

  return (
    <Group align="flex-start">
      <Table mt="xl" striped highlightOnHover className={styles.tableContainer}>
        <thead>
          <tr>
            <th>REF</th>
            <th>Request Title</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Requested By</th>
            <th>Approvers</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
      {/* todo: convert into a component and move outside request table*/}
      {selectedRequest ? (
        <Paper shadow="xl" className={styles.requestContainer}>
          <Container m={0} p={0} className={styles.closeIcon}>
            <ActionIcon onClick={() => setSelectedRequest(null)}>
              <Close />
            </ActionIcon>
          </Container>
          <Group position="apart" grow>
            <Stack align="flex-start">
              <Title order={5}>Request Title</Title>
              <Text>{selectedRequest.request_title}</Text>
            </Stack>
            <Stack align="flex-start">
              <Title order={5}>Requested By</Title>
              <Group>
                <Avatar radius={100} />
                <Text>{selectedRequest.owner.full_name}</Text>
              </Group>
            </Stack>
          </Group>
          <Group mt="xl" position="apart" grow>
            <Stack align="flex-start">
              <Title order={5}>Date Created</Title>
              <Text>{selectedRequest.created_at?.slice(0, 10)}</Text>
            </Stack>
            <Stack align="flex-start">
              <Title order={5}>Status</Title>
              <Badge
                color={setBadgeColor(`${selectedRequest.approval_status}`)}
              >
                {startCase(`${selectedRequest.approval_status}`)}
              </Badge>
            </Stack>
          </Group>
          <Stack mt="xl" align="flex-start">
            <Title order={5}>Request Description</Title>
            <Text>{selectedRequest.request_description}</Text>
          </Stack>
          <Divider mt="xl" />
          <Stack mt="xl">
            <Title order={5}>Approver</Title>
            <Group align="apart" grow>
              <Group>
                <Badge
                  color={setBadgeColor(`${selectedRequest.approval_status}`)}
                />
                <Text>{selectedRequest.approver.full_name}</Text>
              </Group>
            </Group>
          </Stack>
          <Divider mt="xl" />
          <Stack mt="xl">
            <Title order={5}>Attachment</Title>
            <Text>---</Text>
          </Stack>

          {isApprover ? (
            <>
              <Divider mt="xl" />
              <Stack mt="xl">
                <Button color="green" onClick={() => handleApprove()}>
                  Approve
                </Button>
                <Button color="dark" onClick={() => handleSendToRevision()}>
                  Send For Revision
                </Button>
                <Button color="red" onClick={() => handleReject()}>
                  Reject
                </Button>
              </Stack>
            </>
          ) : null}

          {selectedRequestFields?.map((form) => {
            const responseValue =
              form.response_value && form.response_value[0]
                ? form.response_value[0]
                : "";

            if (
              form?.question?.expected_response_type === "text" ||
              form?.question?.expected_response_type === "email"
            ) {
              return (
                <Box key={form.form_id} py="sm">
                  <TextInput
                    label={form.question.question}
                    value={responseValue}
                    readOnly
                  />
                </Box>
              );
            } else if (form?.question?.expected_response_type === "number") {
              return (
                <Box key={form?.form_id} py="sm">
                  <NumberInput
                    label={form?.question.question}
                    value={Number(responseValue)}
                    readOnly
                  />
                </Box>
              );
            } else if (form?.question?.expected_response_type === "date") {
              return (
                <Box key={form?.form_id} py="sm">
                  <DatePicker
                    label={form?.question?.question}
                    placeholder={"Choose date"}
                    value={new Date(responseValue)}
                    readOnly
                  />
                </Box>
              );
            } else if (form?.question?.expected_response_type === "daterange") {
              return (
                <Box key={form?.form_id} py="sm">
                  <DateRangePicker
                    label={form?.question?.question}
                    placeholder={"Choose a date range"}
                    value={[
                      new Date(responseValue.split(",")[0]),
                      new Date(responseValue.split(",")[1]),
                    ]}
                    readOnly
                  />
                </Box>
              );
            } else if (form?.question?.expected_response_type === "time") {
              return (
                <Box key={form?.form_id} py="sm">
                  <TimeInput
                    label={form?.question?.question}
                    placeholder={"Choose time"}
                    format="12"
                    value={new Date(responseValue)}
                  />
                </Box>
              );
            } else if (form?.question?.expected_response_type === "slider") {
              return (
                <Box my="md" key={form?.form_id} py="sm">
                  <Text component="label" color="dark">
                    {form?.question?.question}
                  </Text>
                  <Slider
                    label={form?.question?.question}
                    placeholder={"Slide to choose value"}
                    marks={MARKS}
                    min={1}
                    max={5}
                    labelAlwaysOn={false}
                    value={Number(responseValue)}
                  />
                </Box>
              );
            } else if (
              form?.question?.expected_response_type === "multiple" &&
              form.question_option.question_option !== null
            ) {
              return (
                <MultiSelect
                  key={form.form_id}
                  data={form.question_option.question_option.map((option) => {
                    return { value: `${option}`, label: `${option}` };
                  })}
                  label={form.question.question}
                  placeholder={"Choose multiple"}
                  value={responseValue.split(",")}
                  py="sm"
                />
              );
            } else if (
              form?.question?.expected_response_type === "select" &&
              form.question_option.question_option !== null
            ) {
              return (
                <Select
                  key={form.form_id}
                  data={form.question_option.question_option.map((option) => {
                    return { value: `${option}`, label: `${option}` };
                  })}
                  searchable
                  clearable
                  label={form.question.question}
                  placeholder={"Choose one"}
                  value={responseValue}
                  py="sm"
                />
              );
            }
          })}
        </Paper>
      ) : null}
    </Group>
  );
};

export default RequestTable;
