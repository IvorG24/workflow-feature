// todo: create unit test
import { setBadgeColor } from "@/utils/request";
import type { Database } from "@/utils/types";
import { FormTable, UserProfile } from "@/utils/types";
import {
  Avatar,
  Badge,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./Request.module.scss";

type RequestType = FormTable & {
  owner: UserProfile;
} & { approver: UserProfile };

const Request = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const user = useUser();

  const [request, setRequest] = useState<RequestType | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      const { data } = await supabase
        .from("form_table")
        .select("*, owner:response_owner(*), approver:approver_id(*)")
        .eq("request_id", `${router.query.id}`)
        .single();
      if (data) {
        setRequest(data as RequestType);
      }
    };

    fetchRequest();
  }, [supabase, router]);

  let isApprover = false;
  if (request) {
    if (
      (request.approval_status === "stale" ||
        request.approval_status === "pending") &&
      request.approver.user_id === user?.id
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
      .eq("request_id", Number(`${router.query.id}`));

    if (error) {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${request?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    } else {
      showNotification({
        title: "Success!",
        message: `You approved ${request?.request_title}`,
        color: "green",
      });
      router.push("/requests");
    }
  };

  const handleSendToRevision = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from("form_table")
      .update({ approval_status: "approved" })
      .eq("request_id", Number(`${router.query.id}`));

    if (error) {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${request?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    } else {
      showNotification({
        title: "Success!",
        message: `${request?.request_title} is Sent to Revision`,
        color: "green",
      });
      router.push("/requests");
    }
  };

  const handleReject = async () => {
    const { error } = await supabase
      .from("form_table")
      .update({ approval_status: "approved" })
      .eq("request_id", Number(`${router.query.id}`));

    if (error) {
      showNotification({
        title: "Error!",
        message: `Failed to approve ${request?.request_title}`,
        color: "red",
      });
      setIsLoading(false);
    } else {
      showNotification({
        title: "Success!",
        message: `You rejected ${request?.request_title}`,
        color: "green",
      });
      router.push("/requests");
    }
  };

  return (
    <Container px={8} py={16} fluid>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />

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
            <Text>{request?.request_title}</Text>
          </Stack>
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Request By</Title>
            <Group>
              <Avatar radius={100} />
              <Text>{request?.owner.full_name}</Text>
            </Group>
          </Stack>
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Date Created</Title>
            <Text>{request?.created_at?.slice(0, 10)}</Text>
          </Stack>
          <Stack className={styles.flex} mt={16}>
            <Title order={4}>Status</Title>
            <Badge color={setBadgeColor(`${request?.approval_status}`)}>
              {startCase(`${request?.approval_status}`)}
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
            <Text>{request?.request_description}</Text>
          </Stack>

          <Stack className={styles.flex} mt={16}>
            <Title order={4}>On Behalf Of</Title>
            <Text>{request?.on_behalf_of}</Text>
          </Stack>
        </Flex>

        <Divider mt="xl" />

        <Stack mt="xl">
          <Title order={5}>Approver</Title>
          <Group align="apart">
            <Badge color={setBadgeColor(`${request?.approval_status}`)} />
            <Text>{request?.approver.full_name}</Text>
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
      </Stack>
    </Container>
  );
};

export default Request;
