import { Close } from "@/components/Icon";
import { setBadgeColor } from "@/utils/request";
import { FormTable, UserProfile } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import styles from "./RequestTable.module.scss";

type RequestType = FormTable & {
  owner: UserProfile;
} & { approver: UserProfile };

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

  const rows = requestList.map((request) => {
    return (
      <tr
        key={request.form_id}
        className={styles.row}
        onClick={() => {
          width < 1200
            ? router.push(`/requests/${request.request_id}`)
            : setSelectedRequest(request);
        }}
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
        </Paper>
      ) : null}
    </Group>
  );
};

export default RequestTable;
