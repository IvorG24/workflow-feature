// todo: create unit test
import { renderTooltip, setBadgeColor } from "@/utils/request";
import type {
  Database,
  Marks,
  RequestFields,
  RequestType,
} from "@/utils/types";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  MultiSelect,
  NumberInput,
  Select,
  Slider,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker, DateRangePicker, TimeInput } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./Request.module.scss";

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

const Request = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();
  const [isFetchingRequest, setIsFetchingRequest] = useState(true);
  const [request, setRequest] = useState<RequestType | null>(null);
  const [requiredFields, setRequiredFields] = useState({
    approval_status: "",
    request_title: "",
    request_description: "",
    on_behalf_of: "",
    requestedBy: "",
    approverName: "",
    approverId: "",
    created_at: "",
  });
  const [requestFields, setRequestFields] = useState<RequestFields[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    setIsFetchingRequest(true);

    const fetchRequest = async () => {
      try {
        const { data: requestRow, error: requestRowError } = await supabase
          .from("request_table")
          .select("*, owner: requested_by(*), approver: approver_id(*)")
          .eq("request_id", router.query.id)
          .single();

        const newRequest = requestRow as RequestType;

        if (requestRowError) throw requestRowError;

        const { data: requestFields, error: requestFieldsError } =
          await supabase
            .from("request_response_table")
            .select("*, field: field_id(*)")
            .eq("request_id", router.query.id);

        if (requestFieldsError) throw requestFieldsError;

        setRequest(newRequest);
        setRequiredFields({
          approval_status: `${newRequest.request_status}`,
          request_title: `${newRequest.request_title}`,
          request_description: `${newRequest.request_description}`,
          on_behalf_of: `${newRequest.on_behalf_of}`,
          requestedBy: `${newRequest.owner.full_name}`,
          approverName: `${newRequest.approver.full_name}`,
          created_at: `${newRequest.request_created_at}`,
          approverId: `${newRequest.approver_id}`,
        });
        setRequestFields(requestFields as RequestFields[]);
        setIsFetchingRequest(false);
      } catch {
        showNotification({
          title: "Error!",
          message: "Failed to fetch Request",
          color: "red",
        });
      }
    };

    fetchRequest();
  }, [supabase, router]);

  let isApprover = false;
  if (request) {
    if (
      (requiredFields.approval_status === "stale" ||
        requiredFields.approval_status === "pending") &&
      requiredFields.approverId === user?.id
    ) {
      isApprover = true;
    }
  }

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("request_table")
        .update({ request_status: "approved" })
        .eq("request_id", Number(`${router.query.id}`));

      if (error) throw error;

      showNotification({
        title: "Success!",
        message: `You approved ${requiredFields?.request_title}`,
        color: "green",
      });
      router.push("/requests");
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${requiredFields?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    }
  };

  const handleSendToRevision = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("request_table")
        .update({ request_status: "revision" })
        .eq("request_id", Number(`${router.query.id}`));

      if (error) throw error;

      showNotification({
        title: "Success!",
        message: `${requiredFields?.request_title} is sent to Revision`,
        color: "green",
      });
      router.push("/requests");
    } catch {
      showNotification({
        title: "Error!",
        message: `${requiredFields?.request_title} has failed to send to revision`,
        color: "red",
      });

      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("request_table")
        .update({ request_status: "rejected" })
        .eq("request_id", Number(`${router.query.id}`));

      if (error) throw error;

      showNotification({
        title: "Success!",
        message: `You rejected ${requiredFields?.request_title}`,
        color: "green",
      });
      router.push("/requests");
    } catch {
      showNotification({
        title: "Error!",
        message: `Failed to reject ${requiredFields?.request_title}`,
        color: "red",
      });

      setIsLoading(false);
    }
  };

  return (
    <Container px={8} py={16} fluid>
      <LoadingOverlay
        visible={isLoading || isFetchingRequest}
        overlayBlur={2}
      />

      <Stack>
        <Flex
          direction="row"
          justify="space-between"
          align="stretch"
          wrap="wrap"
          gap="xl"
        >
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Request Title</Title>
            <Text>{requiredFields.request_title}</Text>
          </Stack>
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Request By</Title>
            <Group>
              <Avatar radius={100} />
              <Text>{requiredFields.requestedBy}</Text>
            </Group>
          </Stack>
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Date Created</Title>
            <Text>{requiredFields.created_at?.slice(0, 10)}</Text>
          </Stack>
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Status</Title>
            <Badge color={setBadgeColor(`${requiredFields.approval_status}`)}>
              {startCase(`${requiredFields.approval_status}`)}
            </Badge>
          </Stack>
        </Flex>
        <Flex
          direction="row"
          justify="space-between"
          align="stretch"
          wrap="wrap"
          gap="xl"
          mt="lg"
        >
          <Stack className={styles.flex} mt={16}>
            <Title order={4}> Request Description</Title>
            <Text>{requiredFields.request_description}</Text>
          </Stack>

          <Stack className={styles.flex} mt={16}>
            <Title order={4}>On Behalf Of</Title>
            <Text>{requiredFields.on_behalf_of}</Text>
          </Stack>
        </Flex>

        <Divider mt="xl" />

        <Stack mt="xl">
          <Title order={5}>Approver</Title>
          <Group align="apart">
            <Badge color={setBadgeColor(`${requiredFields.approval_status}`)} />
            <Text>{requiredFields.approverName}</Text>
          </Group>
        </Stack>

        <Divider mt="xl" />

        <Stack mt="xl">
          <Title order={5}>Attachment</Title>
          <Text>---</Text>

          {isApprover ? (
            <Group mt="xl" position="right">
              <Button color="green" onClick={() => handleApprove()} size="md">
                Approve
              </Button>
              <Button
                color="dark"
                onClick={() => handleSendToRevision()}
                size="md"
              >
                Send to Revision
              </Button>
              <Button color="red" onClick={() => handleReject()} size="md">
                Reject
              </Button>
            </Group>
          ) : null}
        </Stack>
        {requestFields?.map((field) => {
          const fieldType = field.field.field_type;
          const fieldLabel = field.field.field_name;
          const fieldResponse = `${field.response_value}`;
          const fieldOptions = field.field.field_option;

          if (fieldType === "text" || fieldType === "email") {
            return (
              <Box key={field.field_id}>
                {renderTooltip(
                  <TextInput
                    label={fieldLabel}
                    withAsterisk={Boolean(field.field.is_required)}
                    value={fieldResponse}
                  />,
                  `${field.field.field_tooltip}`
                )}
              </Box>
            );
          } else if (fieldType === "number") {
            return (
              <Box key={field.field_id}>
                {renderTooltip(
                  <NumberInput
                    label={fieldLabel}
                    withAsterisk={Boolean(field.field.is_required)}
                    value={Number(fieldResponse)}
                  />,
                  `${field.field.field_tooltip}`
                )}
              </Box>
            );
          } else if (fieldType === "date") {
            return (
              <Box key={field.field_id}>
                {renderTooltip(
                  <DatePicker
                    label={fieldLabel}
                    withAsterisk={Boolean(field.field.is_required)}
                    placeholder={"Choose date"}
                    value={new Date(fieldResponse)}
                  />,
                  `${field.field.field_tooltip}`
                )}
              </Box>
            );
          } else if (fieldType === "daterange") {
            return (
              <Box key={field.field_id}>
                {renderTooltip(
                  <DateRangePicker
                    label={fieldLabel}
                    withAsterisk={Boolean(field.field.is_required)}
                    placeholder={"Choose a date range"}
                    value={[
                      new Date(fieldResponse.split(",")[0]),
                      new Date(fieldResponse.split(",")[1]),
                    ]}
                  />,
                  `${field.field.field_tooltip}`
                )}
              </Box>
            );
          } else if (fieldType === "time") {
            return (
              <Box key={field.field_id}>
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
              <Box my="md" key={field.field_id}>
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
              />,
              `${field.field.field_tooltip}`
            );
          }
        })}
      </Stack>
    </Container>
  );
};

export default Request;
