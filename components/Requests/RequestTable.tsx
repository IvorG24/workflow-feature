import { Close } from "@/components/Icon";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  LoadingOverlay,
  Pagination,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { ceil, startCase, toLower } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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

const currentUser = "Lance Juat";

const tempRequests: RequestType[] = [
  {
    id: 1,
    ref: "AR-1",
    formType: "approvalRequest",
    requestTitle: "Approval Request 1",
    status: "rejected",
    lastUpdated: "10/19/20",
    requestedBy: "Lance Juat",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Maria Deanna Romero",
        status: "rejected",
      },
    ],
  },
  {
    id: 2,
    ref: "AR-2",
    formType: "approvalRequest",
    requestTitle: "Approval Request 2",
    status: "approved",
    lastUpdated: "11/23/20",
    requestedBy: "James Bautista",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Maria Deanna Romero",
        status: "approved",
      },
      {
        name: "Alberto Luis Linao",
        status: "approved",
      },
    ],
  },
  {
    id: 3,
    ref: "IT-4803",
    formType: "it",
    requestTitle: "IT 4803",
    status: "approved",
    lastUpdated: "11/15/21",
    requestedBy: "Arianne Roxas",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Alberto Luis Linao",
        status: "approved",
      },
    ],
  },
  {
    id: 4,
    ref: "IT-4805",
    formType: "it",
    requestTitle: "IT 4805",
    status: "cancelled",
    lastUpdated: "11/15/21",
    requestedBy: "Alvin Ramos",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Lance Juat",
        status: "pending",
      },
    ],
  },
  {
    id: 5,
    ref: "IT-4830",
    formType: "it",
    requestTitle: "IT 4830",
    status: "pending",
    lastUpdated: "11/16/21",
    requestedBy: "Rico Precioso",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Lance Juat",
        status: "pending",
      },
    ],
  },
  {
    id: 6,
    ref: "PTRF-5644",
    formType: "it",
    requestTitle: "From HR to IT",
    status: "forRevision",
    lastUpdated: "09/29/22",
    requestedBy: "Christine Molina",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Alberto Luis Linao",
        status: "forRevision",
      },
    ],
  },
  {
    id: 7,
    ref: "PTRF-5645",
    formType: "it",
    requestTitle: "ILIJAN LNG - PTRF",
    status: "stale",
    lastUpdated: "09/29/22",
    requestedBy: "Arianne Roxas",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Maria Deanna Romero",
        status: "pending",
      },
    ],
  },
  {
    id: 8,
    ref: "RF-53",
    formType: "requisitionForm",
    requestTitle: "Requisition Form 53",
    status: "approved",
    lastUpdated: "11/16/22",
    requestedBy: "Arianne Roxas",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Alberto Luis Linao",
        status: "approved",
      },
      {
        name: "Maria Deanna Romero",
        status: "approved",
      },
    ],
  },
  {
    id: 9,
    ref: "RF-408",
    formType: "requisitionForm",
    requestTitle: "Requisition Form 408",
    status: "pending",
    lastUpdated: "12/02/20",
    requestedBy: "Arianne Roxas",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Lance Juat",
        status: "pending",
      },
      {
        name: "Maria Deanna Romero",
        status: "pending",
      },
    ],
  },
  {
    id: 10,
    ref: "RF-409",
    formType: "requisitionForm",
    requestTitle: "Requisition Form 409",
    status: "pending",
    lastUpdated: "12/02/20",
    requestedBy: "Arianne Roxas",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sagittis odio ut bibendum bibendum. Nullam faucibus ex vitae varius molestie. Pellentesque tincidunt sit amet mauris eu malesuada. Etiam auctor ex sed mattis imperdiet. Nulla viverra ullamcorper laoreet. Integer pharetra nec dolor id ornare. Mauris sit amet tincidunt lectus.",
    approvers: [
      {
        name: "Alberto Luis Linao",
        status: "pending",
      },
      {
        name: "Lance Juat",
        status: "approved",
      },
    ],
  },
];

type Props = {
  formType: string | null;
  status: string | null;
  search: string;
};

const REQUEST_PER_PAGE = 8;

const RequestTable = ({ formType, status, search }: Props) => {
  const { width } = useViewportSize();
  const router = useRouter();

  const [activePage, setPage] = useState(1);
  const [requestList, setRequestList] = useState<RequestType[]>(tempRequests);
  const [visibleRequests, setVisibleRequests] = useState(
    tempRequests.slice(0, REQUEST_PER_PAGE)
  );
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(
    null
  );
  const [isApprover, setIsApprover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let newRequestList: RequestType[] = tempRequests;
    if (formType) {
      newRequestList = newRequestList.filter(
        (request) => request.formType === formType
      );
    }
    if (status) {
      newRequestList = newRequestList.filter(
        (request) => request.status === status
      );
    }
    if (search) {
      newRequestList = newRequestList.filter((request) =>
        toLower(request.requestTitle).includes(toLower(search))
      );
    }

    console.log;
    setRequestList(newRequestList);
    filterPage(1, newRequestList);
  }, [search, formType, status]);

  useEffect(() => {
    setIsApprover(false);
    if (selectedRequest) {
      if (
        selectedRequest.status === "stale" ||
        selectedRequest.status === "pending"
      ) {
        selectedRequest.approvers.map((approver) => {
          if (approver.name === currentUser && approver.status === "pending") {
            setIsApprover(true);
          }
        });
      }
    }
  }, [selectedRequest]);

  const filterPage = (page: number, requestList: RequestType[]) => {
    setSelectedRequest(null);
    setPage(page);
    setVisibleRequests(
      requestList.slice(
        (page - 1) * REQUEST_PER_PAGE,
        (page - 1) * REQUEST_PER_PAGE + REQUEST_PER_PAGE
      )
    );
  };

  const setBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "blue";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "forRevision":
        return "orange";
      case "stale":
        return "gray";
      case "cancelled":
        return "dark";
    }
  };

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

  const handleApprove = () => {
    setIsLoading(true);
    showNotification({
      title: "Success!",
      message: `You approved ${selectedRequest?.requestTitle}`,
      color: "green",
    });
    setSelectedRequest(null);
    setIsLoading(false);
  };

  const handleSendToRevision = () => {
    setIsLoading(true);
    showNotification({
      title: "Success!",
      message: `${selectedRequest?.requestTitle} is Sent to Revision`,
      color: "green",
    });
    setSelectedRequest(null);
    setIsLoading(false);
  };

  const handleReject = () => {
    setIsLoading(true);
    showNotification({
      title: "Success!",
      message: `You rejected ${selectedRequest?.requestTitle}`,
      color: "green",
    });
    setSelectedRequest(null);
    setIsLoading(false);
  };

  return (
    <>
      <div>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
      </div>
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
            <div className={styles.closeIcon}>
              <ActionIcon onClick={() => setSelectedRequest(null)}>
                <Close />
              </ActionIcon>
            </div>
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
      {requestList.length / REQUEST_PER_PAGE > 1 ? (
        <Pagination
          className={styles.pagination}
          page={activePage}
          onChange={(page) => filterPage(page, requestList)}
          total={ceil(requestList.length / REQUEST_PER_PAGE)}
        />
      ) : null}
    </>
  );
};

export default RequestTable;
