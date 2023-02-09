import { addComment, getRequest, updateRequestStatus } from "@/utils/queries";
import { getRandomColor } from "@/utils/styling";
import { RequestStatus } from "@/utils/types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Card,
  createStyles,
  Group,
  Progress,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import {
  IconDownload,
  IconMaximize,
  IconWritingSign,
  IconWritingSignOff,
} from "@tabler/icons";
import { startCase } from "lodash";
import moment from "moment";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useCallback } from "react";

type ProgressSection = {
  value: number;
  color: string;
  label: string;
  tooltip: string;
};
export type RequestCardProps = {
  requestId: number;
  title: string;
  description: string;
  sectionList: ProgressSection[];
  requesterAvatarUrl: string;
  requesterUsername: string;
  dateRequested: string;
  requestMainStatus: RequestStatus;
  approverList: {
    avatarUrl: string;
    username: string;
    actionId: string;
    actionStatus: RequestStatus;
    approverId: string;
  }[];
  isCurrentUserApprover: boolean;
  primaryApproverName: string;
  primaryApproverId: string;
  currentUserApproverActionId: string;
  currentUserApproverActionStatusId: RequestStatus;
  setIsUpdatingStatus: Dispatch<SetStateAction<boolean>>;
};

const useStyles = createStyles((theme) => ({
  card: {
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.1)
          : theme.colors[theme.primaryColor][0],
    },
    // cursor: "pointer",
  },
}));

function RequestCard({
  requestId,
  title,
  description,
  sectionList,
  requesterAvatarUrl,
  requesterUsername,
  dateRequested,
  requestMainStatus,
  approverList,
  isCurrentUserApprover,
  primaryApproverName,
  primaryApproverId,
  currentUserApproverActionId,
  currentUserApproverActionStatusId,
  setIsUpdatingStatus,
}: RequestCardProps) {
  const { classes } = useStyles();
  const router = useRouter();
  const theme = useMantineTheme();
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  const iconDownloadTooltip =
    requestMainStatus === "approved"
      ? "Export request receipt"
      : "Cannot export request receipt. Approval required.";
  const iconApproveTooltip =
    requestMainStatus === "pending" && isCurrentUserApprover
      ? "Approve request"
      : requestMainStatus === "approved" && isCurrentUserApprover
      ? "You approved this request"
      : "You are not assigned as one of the approvers";
  const iconRejectTooltip =
    requestMainStatus === "pending" && isCurrentUserApprover
      ? "Reject request"
      : requestMainStatus === "rejected" && isCurrentUserApprover
      ? "You rejected this request"
      : "You are not assigned as one of the approvers";
  const disableDownload = requestMainStatus !== "approved";
  const disableApprove =
    !isCurrentUserApprover || requestMainStatus !== "pending";
  const disableReject =
    !isCurrentUserApprover || requestMainStatus !== "pending";

  const displayApprove =
    isCurrentUserApprover && currentUserApproverActionStatusId === "approved";
  const displayReject =
    isCurrentUserApprover && currentUserApproverActionStatusId === "rejected";

  const approvalsCompleted = sectionList.filter(
    (section) => section.color === "green"
  ).length;
  const date = moment(dateRequested);
  const formattedDate = date.format("MMM D, YYYY");
  const requestMainStatusTooltip = `Request ${requestMainStatus} by primary approver ${primaryApproverName}`;
  const requestMainStatusBadgeColor =
    requestMainStatus === "approved"
      ? "green"
      : requestMainStatus === "rejected"
      ? "red"
      : "gray";
  const teamName = router.query.teamName as string;

  const memoizedCallback = useCallback(() => {
    return getRandomColor(theme);
  }, []);

  const handleUpdateStatus = async (
    userId: string,
    requestId: number,
    actionId: string,
    newStatus: RequestStatus,
    primaryApproverId: string
  ) => {
    try {
      setIsUpdatingStatus(true);

      // check if request is canceled already from the server
      const request = await getRequest(supabaseClient, requestId);

      if (request[0].request_is_cancelled) {
        showNotification({
          title: "Error",
          message: "Request is already canceled. Kindly refresh the page.",
          color: "red",
        });
        return;
      }

      const isUpdatedByPrimaryApprover = userId === primaryApproverId;

      await updateRequestStatus(
        supabaseClient,
        userId,
        requestId,
        actionId,
        newStatus,
        isUpdatedByPrimaryApprover,
        null
      );

      await addComment(
        supabaseClient,
        requestId,
        userId,
        null,
        newStatus === "approved" ? "approved" : "rejected",
        null
      );

      showNotification({
        title: "Success",
        message: `Request ${newStatus} successfully.`,
        color: "green",
      });
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <Card withBorder radius="md" className={classes.card}>
        <Group position="apart" align="top" noWrap>
          {/* <MantineLogo type="mark" size={28} /> */}
          <Group noWrap>
            <Avatar
              // src={requesterAvatarUrl}
              radius="sm"
              color={memoizedCallback()}
            >
              {startCase(requesterUsername[0])}
              {startCase(requesterUsername[1])}
            </Avatar>

            <div>
              <Text weight={500}>{requesterUsername}</Text>
              <Text size="xs" color="dimmed">
                posted on {formattedDate}
              </Text>
            </div>
          </Group>
          <Tooltip multiline label={requestMainStatusTooltip}>
            <Badge size="sm" color={requestMainStatusBadgeColor}>
              {startCase(requestMainStatus)}
            </Badge>
          </Tooltip>
        </Group>

        <Text size="md" weight={500} h={24} mt="md" truncate={true}>
          {title}
        </Text>

        <Text
          size="xs"
          color="dimmed"
          h={60}
          mt={5}
          lineClamp={3}
          sx={{
            overflowWrap: "break-word",
            wordWrap: "break-word",
            hyphens: "auto",
          }}
        >
          {description}
        </Text>

        <Text color="dimmed" size="xs" mt="md">
          Approvals completed:{" "}
          <Text
            span
            weight={500}
            sx={(theme) => ({
              color: theme.colorScheme === "dark" ? theme.white : theme.black,
            })}
          >
            {`${approvalsCompleted} / ${sectionList.length}`}
          </Text>
        </Text>

        {/* <Progress value={(23 / 36) * 100} mt={5} /> */}

        <Progress sections={sectionList} mt={5} />

        <Group position="apart" mt="md">
          <Tooltip multiline label="Assigned approvers">
            <Avatar.Group spacing="sm">
              {approverList[0] && (
                <Avatar
                  //   src={approverList[0].avatarUrl}
                  radius="xl"
                >
                  {startCase(approverList[0].username[0])}
                  {startCase(approverList[0].username[1])}
                </Avatar>
              )}
              {approverList[1] && (
                <Avatar
                  //   src={approverList[1].avatarUrl}
                  radius="xl"
                >
                  {startCase(approverList[1].username[0])}
                  {startCase(approverList[1].username[1])}
                </Avatar>
              )}
              {approverList[2] && (
                <Avatar
                  //   src={approverList[2].avatarUrl}
                  radius="xl"
                >
                  {startCase(approverList[2].username[0])}
                  {startCase(approverList[2].username[1])}
                </Avatar>
              )}
              {approverList.length - 3 > 0 && (
                <Avatar radius="xl">approverAvatarUrlList.length - 3</Avatar>
              )}
            </Avatar.Group>
          </Tooltip>
          <Group noWrap>
            <Tooltip multiline label={iconDownloadTooltip}>
              <ActionIcon
                variant="default"
                disabled={disableDownload}
                onClick={() => {
                  showNotification({
                    title: "Info",
                    message:
                      "Export request receipt is currently being worked on.",
                    color: "blue",
                  });
                }}
              >
                <IconDownload size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip multiline label={iconApproveTooltip}>
              <ActionIcon
                variant="filled"
                color="green"
                disabled={disableApprove && !displayApprove}
                onClick={() => {
                  if (displayApprove) {
                    showNotification({
                      title: "Info",
                      message: "You already approved this request.",
                      color: "blue",
                    });

                    return;
                  }

                  handleUpdateStatus(
                    user?.id as string,
                    requestId,
                    currentUserApproverActionId as string,
                    "approved",
                    primaryApproverId
                  );
                }}
              >
                <IconWritingSign size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip multiline label={iconRejectTooltip}>
              <ActionIcon
                variant="filled"
                color="red"
                disabled={disableReject && !displayReject}
                onClick={() => {
                  if (displayReject) {
                    showNotification({
                      title: "Info",
                      message: "You already rejected this request.",
                      color: "blue",
                    });

                    return;
                  }

                  handleUpdateStatus(
                    user?.id as string,
                    requestId,
                    currentUserApproverActionId as string,
                    "rejected",
                    primaryApproverId
                  );
                }}
              >
                <IconWritingSignOff size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip
              multiline
              label="Go to request"
              onClick={() =>
                router.push(`/teams/${teamName}/requests/${requestId}`)
              }
            >
              <ActionIcon variant="default">
                <IconMaximize size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Card>
    </>
  );
}

export default RequestCard;
