import { Close } from "@/components/Icon";
import { renderTooltip, setBadgeColor } from "@/utils/request";
import type {
  Database,
  Marks,
  RequestFields,
  RequestType,
} from "@/utils/types";
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
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import styles from "./RequestTable.module.scss";

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
    RequestFields[]
  >([]);

  const handleSetSelectedRequest = async (request: RequestType) => {
    if (width < 1200) {
      router.push(`/requests/${request.request_id}`);
    } else {
      try {
        const { data: requestFields, error: requestFieldsError } =
          await supabase
            .from("request_response_table")
            .select("*, field: field_id(*)")
            .eq("request_id", request.request_id);

        if (requestFieldsError) throw requestFieldsError;

        setSelectedRequest(request);
        setSelectedRequestFields(requestFields as unknown as RequestFields[]);
      } catch {
        showNotification({
          title: "Error!",
          message: "Failed to fetch Request",
          color: "red",
        });
      }
    }
  };

  const rows = requestList.map((request) => {
    return (
      <tr
        key={request.request_id}
        className={styles.row}
        onClick={() => handleSetSelectedRequest(request)}
      >
        <td>{request.request_id}</td>
        <td>{request.request_title}</td>
        <td>
          <Badge color={setBadgeColor(`${request.request_status}`)}>
            {startCase(`${request.request_status}`)}
          </Badge>
        </td>
        <td>{request.request_created_at?.slice(0, 10)}</td>
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
              <Text>{selectedRequest.request_created_at?.slice(0, 10)}</Text>
            </Stack>
            <Stack align="flex-start">
              <Title order={5}>Status</Title>
              <Badge color={setBadgeColor(`${selectedRequest.request_status}`)}>
                {startCase(`${selectedRequest.request_status}`)}
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
                  color={setBadgeColor(`${selectedRequest.request_status}`)}
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

          {selectedRequestFields?.map((field) => {
            const fieldType = field.field.field_type;
            const fieldLabel = field.field.field_name;
            const fieldResponse = `${field.response_value}`;
            const fieldOptions = field.field.field_option;

            if (fieldType === "text" || fieldType === "email") {
              return (
                <Box key={field.field_id} py="sm">
                  {renderTooltip(
                    <TextInput
                      label={fieldLabel}
                      withAsterisk={Boolean(field.field.is_required)}
                      value={`${field.response_value}`}
                      readOnly
                    />,
                    `${field.field.field_tooltip}`
                  )}
                </Box>
              );
            } else if (fieldType === "number") {
              return (
                <Box key={field.field_id} py="sm">
                  {renderTooltip(
                    <NumberInput
                      label={fieldLabel}
                      withAsterisk={Boolean(field.field.is_required)}
                      value={Number(fieldResponse)}
                      readOnly
                    />,
                    `${field.field.field_tooltip}`
                  )}
                </Box>
              );
            } else if (fieldType === "date") {
              return (
                <Box key={field.field_id} py="sm">
                  {renderTooltip(
                    <DatePicker
                      label={fieldLabel}
                      withAsterisk={Boolean(field.field.is_required)}
                      placeholder={"Choose date"}
                      value={new Date(fieldResponse)}
                      readOnly
                    />,
                    `${field.field.field_tooltip}`
                  )}
                </Box>
              );
            } else if (fieldType === "daterange") {
              return (
                <Box key={field.field_id} py="sm">
                  {renderTooltip(
                    <DateRangePicker
                      label={fieldLabel}
                      withAsterisk={Boolean(field.field.is_required)}
                      placeholder={"Choose a date range"}
                      value={[
                        new Date(fieldResponse.split(",")[0]),
                        new Date(fieldResponse.split(",")[1]),
                      ]}
                      readOnly
                    />,
                    `${field.field.field_tooltip}`
                  )}
                </Box>
              );
            } else if (fieldType === "time") {
              return (
                <Box key={field.field_id} py="sm">
                  {renderTooltip(
                    <TimeInput
                      label={fieldLabel}
                      withAsterisk={Boolean(field.field.is_required)}
                      placeholder={"Choose time"}
                      format="12"
                      value={new Date(fieldResponse)}
                    />,
                    `${field.field.field_tooltip}`
                  )}
                </Box>
              );
            } else if (fieldType === "slider") {
              return (
                <Box my="md" key={field.field_id} py="sm">
                  {renderTooltip(
                    <Text component="label" color="dark">
                      {fieldLabel}
                    </Text>,
                    `${field.field.field_tooltip}`
                  )}
                  <Slider
                    label={fieldLabel}
                    placeholder={"Slide to choose value"}
                    marks={MARKS}
                    min={1}
                    max={5}
                    labelAlwaysOn={false}
                    value={Number(fieldResponse)}
                  />
                </Box>
              );
            } else if (fieldType === "multiple" && fieldOptions !== null) {
              return renderTooltip(
                <MultiSelect
                  key={field.field_id}
                  data={fieldOptions.map((option) => {
                    return { value: `${option}`, label: `${option}` };
                  })}
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field.is_required)}
                  placeholder={"Choose multiple"}
                  value={fieldResponse.split(",")}
                  py="sm"
                />,
                `${field.field.field_tooltip}`
              );
            } else if (fieldType === "select" && fieldOptions !== null) {
              return renderTooltip(
                <Select
                  key={field.field_id}
                  data={fieldOptions.map((option) => {
                    return { value: `${option}`, label: `${option}` };
                  })}
                  searchable
                  clearable
                  label={fieldLabel}
                  withAsterisk={Boolean(field.field.is_required)}
                  placeholder={"Choose one"}
                  value={fieldResponse}
                  py="sm"
                />,
                `${field.field.field_tooltip}`
              );
            }
          })}
        </Paper>
      ) : null}
    </Group>
  );
};

export default RequestTable;
