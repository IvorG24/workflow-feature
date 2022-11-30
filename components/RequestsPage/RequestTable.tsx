import { Close } from "@/components/Icon";
import { setBadgeColor } from "@/utils/request";
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
  Tooltip,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import styles from "./RequestTable.module.scss";

type RequestType = {
  id: number;
  ref: string;
  formType: string;
  requestTitle: string;
  status: string;
  lastUpdated: string;
  requestedBy: string;
  description: string;
  approvers: {
    name: string;
    status: string;
  }[];
};

type Props = {
  visibleRequests: RequestType[];
  selectedRequest: RequestType | null;
  setSelectedRequest: Dispatch<SetStateAction<RequestType | null>>;
  isApprover: boolean;
  handleApprove: () => void;
  handleSendToRevision: () => void;
  handleReject: () => void;
};

const RequestTable = ({
  visibleRequests,
  selectedRequest,
  setSelectedRequest,
  isApprover,
  handleApprove,
  handleSendToRevision,
  handleReject,
}: Props) => {
  const { width } = useViewportSize();
  const router = useRouter();

  const rows = visibleRequests.map((request) => (
    <tr
      key={request.id}
      className={styles.row}
      onClick={() => {
        width < 1200
          ? router.push(`/requests/${request.id}`)
          : setSelectedRequest(request);
      }}
    >
      <td>{request.ref}</td>
      <td>{request.requestTitle}</td>
      <td>
        <Badge color={setBadgeColor(request.status)}>
          {startCase(request.status)}
        </Badge>
      </td>
      <td>{request.lastUpdated}</td>
      <td>
        <Group>
          <Avatar radius={100} />
          {request.requestedBy}
        </Group>
      </td>
      <td>
        <Group>
          {request.approvers.length === 1 ? (
            <>
              <Avatar radius={100} />
              {request.approvers[0].name}
            </>
          ) : (
            <>
              {request.approvers.map((approver) => (
                <Tooltip key={approver.name} label={approver.name}>
                  <Avatar radius={100} />
                </Tooltip>
              ))}
            </>
          )}
        </Group>
      </td>
    </tr>
  ));

  return (
    <>
      <Group align="flex-start">
        <Table
          mt="xl"
          striped
          highlightOnHover
          className={styles.tableContainer}
        >
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
                <Text>{selectedRequest.requestTitle}</Text>
              </Stack>
              <Stack align="flex-start">
                <Title order={5}>Request By</Title>
                <Group>
                  <Avatar radius={100} />
                  <Text>{selectedRequest.requestedBy}</Text>
                </Group>
              </Stack>
            </Group>
            <Group mt="xl" position="apart" grow>
              <Stack align="flex-start">
                <Title order={5}>Date Created</Title>
                <Text>{selectedRequest.lastUpdated}</Text>
              </Stack>
              <Stack align="flex-start">
                <Title order={5}>Status</Title>
                <Badge color={setBadgeColor(selectedRequest.status)}>
                  {startCase(selectedRequest.status)}
                </Badge>
              </Stack>
            </Group>
            <Stack mt="xl" align="flex-start">
              <Title order={5}>Request Description</Title>
              <Text>{selectedRequest.description}</Text>
            </Stack>
            <Divider mt="xl" />
            <Stack mt="xl">
              <Title order={5}>Approver</Title>
              <Group align="apart" grow>
                {selectedRequest.approvers.map((approver) => (
                  <Group key={approver.name}>
                    <Badge color={setBadgeColor(approver.status)} />
                    <Text>{approver.name}</Text>
                  </Group>
                ))}
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
    </>
  );
};

export default RequestTable;
