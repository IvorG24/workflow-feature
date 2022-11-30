import {
  Avatar,
  Badge,
  Button,
  Divider,
  Flex,
  Group,
  Loader,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { startCase } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "./Request.module.scss";

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

const currentUser = "Lance Juat";

const Request = () => {
  const router = useRouter();
  const selectedRequest = tempRequests.find(
    (request) => `${request.id}` === router.query.id
  );
  let isApprover = false;
  if (selectedRequest) {
    if (
      selectedRequest.status === "stale" ||
      selectedRequest.status === "pending"
    ) {
      selectedRequest.approvers.map((approver) => {
        if (approver.name === currentUser && approver.status === "pending") {
          isApprover = true;
        }
      });
    }
  }

  const [isLoading, setIsLoading] = useState(false);

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

  const handleApprove = () => {
    setIsLoading(true);
    showNotification({
      title: "Success!",
      message: `You approved ${selectedRequest?.requestTitle}`,
      color: "green",
    });
    router.push("/requests");
  };

  const handleSendToRevision = () => {
    setIsLoading(true);
    showNotification({
      title: "Success!",
      message: `${selectedRequest?.requestTitle} is Sent to Revision`,
      color: "green",
    });
    router.push("/requests");
  };

  const handleReject = () => {
    setIsLoading(true);
    showNotification({
      title: "Success!",
      message: `You rejected ${selectedRequest?.requestTitle}`,
      color: "green",
    });
    router.push("/requests");
  };

  if (!selectedRequest) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      <div>
        <LoadingOverlay visible={isLoading} overlayBlur={2} />
      </div>
      <Stack>
        <Flex
          direction="row"
          justify="space-between"
          align="stretch"
          wrap="wrap"
          gap="xl"
        >
          <Stack className={styles.flex}>
            <Title order={4}> Request Title</Title>
            <Text>{selectedRequest.requestTitle}</Text>
          </Stack>
          <Stack className={styles.flex}>
            <Title order={4}> Request By</Title>
            <Group>
              <Avatar radius={100} />
              <Text>{selectedRequest.requestedBy}</Text>
            </Group>
          </Stack>
          <Stack className={styles.flex}>
            <Title order={4}>Date Created</Title>
            <Text>{selectedRequest.lastUpdated}</Text>
          </Stack>
          <Stack className={styles.flex}>
            <Title order={4}>Status</Title>
            <Badge color={setBadgeColor("approved")}>
              {startCase("approved")}
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
          <Stack className={styles.flex}>
            <Title order={4}> Request Description</Title>
            <Text>{selectedRequest.description}</Text>
          </Stack>

          <Stack className={styles.flex}>
            <Title order={4}>On Behalf Of</Title>
            <Text>---</Text>
          </Stack>
        </Flex>

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

          {isApprover ? (
            <Group mt="xl" className={styles.buttons}>
              <Button color="green" onClick={() => handleApprove()}>
                Approve
              </Button>
              <Button color="dark" onClick={() => handleSendToRevision()}>
                Send to Revision
              </Button>
              <Button color="red" onClick={() => handleReject()}>
                Reject
              </Button>
            </Group>
          ) : null}
        </Stack>
      </Stack>
    </div>
  );
};

export default Request;
