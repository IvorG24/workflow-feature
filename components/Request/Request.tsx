// todo: create unit test
import { setBadgeColor } from "@/utils/request";
import type {
  Database,
  FormNameRow,
  FormRow,
  Marks,
  QuestionRow,
  SelectOptionRow,
  TeamRow,
  UserProfileRow,
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

// type RequestType = FormTable & {
//   owner: UserProfile;
// } & { approver: UserProfile };

export type Request = (FormRow & { form_name: FormNameRow } & {
  question: QuestionRow;
} & { question_option: SelectOptionRow } & { team: TeamRow } & {
  owner: UserProfileRow;
} & {
  approver: UserProfileRow;
})[];

const Request = () => {
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
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();
  const [isFetchingRequest, setIsFetchingRequest] = useState(true);
  const [request, setRequest] = useState<Request | null>(null);
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

  useEffect(() => {
    if (!router.isReady) return;
    setIsFetchingRequest(true);

    const fetchRequest = async () => {
      const { data, error } = await supabase
        .from("form_table")
        .select(
          `
            *,
            form_name:form_name_id(*),
            question:question_id(*),
            question_option:question_option_id(*),
            team:team_id(*),
            owner:response_owner(*),
            approver:approver_id(*)

          `
        )
        .eq("request_id", router.query.id)
        // .eq("form_name_id", router.query.formId)
        .order("created_at", { ascending: true });
      if (error) {
        console.log(error);
      }
      if (data) {
        setRequest(data as Request);

        // TODO: I just did this to give type to data because data[0].etc. outputs Object is of type unknown linting error.
        const temp = data as Request;
        console.log(temp);
        setRequiredFields({
          approval_status: `${temp[0].approval_status}`,
          request_title: `${temp[0].request_title}`,
          request_description: `${temp[0].request_description}`,
          on_behalf_of: `${temp[0].on_behalf_of}`,
          requestedBy: `${temp[0].owner.full_name}`,
          approverName: `${temp[0].approver.full_name}`,
          created_at: `${temp[0].created_at}`,
          approverId: `${temp[0].approver.user_id}`,
        });
        setIsFetchingRequest(false);
        console.log(JSON.stringify(data, null, 2));
      }
    };

    fetchRequest();
  }, [supabase, router]);

  useEffect(() => {
    console.log(isFetchingRequest);
  }, [isFetchingRequest]);

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

  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from("form_table")
      .update({ approval_status: "approved" })
      .eq("request_id", Number(`${router.query.id}`))
      .neq("approval_status", null);

    if (error) {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${requiredFields?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    } else {
      showNotification({
        title: "Success!",
        message: `You approved ${requiredFields?.request_title}`,
        color: "green",
      });
      router.push("/requests");
    }
  };

  const handleSendToRevision = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from("form_table")
      .update({ approval_status: "revision" })
      .eq("request_id", Number(`${router.query.id}`))
      .neq("approval_status", null);

    if (error) {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${requiredFields?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    } else {
      showNotification({
        title: "Success!",
        message: `${requiredFields?.request_title} is Sent to Revision`,
        color: "green",
      });
      router.push("/requests");
    }
  };

  const handleReject = async () => {
    const { error } = await supabase
      .from("form_table")
      .update({ approval_status: "rejected" })
      .eq("request_id", Number(`${router.query.id}`))
      .neq("approval_status", null);

    if (error) {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${requiredFields?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    } else {
      showNotification({
        title: "Success!",
        message: `You rejected ${requiredFields?.request_title}`,
        color: "green",
      });
      router.push("/requests");
    }
  };

  // if (isFetchingRequest) return null;

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
        {request?.map((form) => {
          const responseValue =
            form.response_value && form.response_value[0]
              ? form.response_value[0]
              : "";

          if (
            form?.question?.expected_response_type === "text" ||
            form?.question?.expected_response_type === "email"
          ) {
            return (
              <Box key={form.form_id}>
                <TextInput
                  label={form.question.question}
                  value={responseValue}
                />
              </Box>
            );
          } else if (form?.question?.expected_response_type === "number") {
            return (
              <Box key={form?.form_id}>
                <NumberInput
                  label={form?.question.question}
                  value={Number(responseValue)}
                />
              </Box>
            );
          } else if (form?.question?.expected_response_type === "date") {
            return (
              <Box key={form?.form_id}>
                <DatePicker
                  label={form?.question?.question}
                  placeholder={"Choose date"}
                  value={new Date(responseValue)}
                />
              </Box>
            );
          } else if (form?.question?.expected_response_type === "daterange") {
            return (
              <Box key={form?.form_id}>
                <DateRangePicker
                  label={form?.question?.question}
                  placeholder={"Choose a date range"}
                  value={[
                    new Date(responseValue.split(",")[0]),
                    new Date(responseValue.split(",")[1]),
                  ]}
                />
              </Box>
            );
          } else if (form?.question?.expected_response_type === "time") {
            return (
              <Box key={form?.form_id}>
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
              <Box my="md" key={form?.form_id}>
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
              />
            );
          }
        })}
      </Stack>
    </Container>
  );
};

export default Request;
