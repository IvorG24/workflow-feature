import {
  getNotificationList,
  GetNotificationListFilter,
  GET_NOTIFICATION_LIST_LIMIT,
  readNotification,
} from "@/utils/queries";
import { NotificationType } from "@/utils/types";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Container,
  createStyles,
  Group,
  SegmentedControl,
  Select,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  createServerSupabaseClient,
  User,
} from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconSearch } from "@tabler/icons";
import { DataTable } from "mantine-datatable";
import moment from "moment";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "pages/_app";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const useStyles = createStyles((theme) => ({
  read: {
    cursor: "default",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.gray[7]
        : theme.colors.gray[5],
  },
  hasRedirectionUrl: {
    cursor: "pointer",
    "&:hover": {
      color:
        theme.colorScheme === "dark"
          ? theme.colors.gray[7]
          : theme.colors.gray[5],
    },
  },

  hasNoRedirectionUrl: {
    cursor: "default",
  },
}));

export type NotificationRow = {
  notificationId: string;
  content: string;
  redirectionUrl: string | null;
  dateCreated: string;
  notificationType: NotificationType;
  isRead: boolean;
  checked?: boolean;
  teamUserNotificationId: string;
};

export type TeamInvitationListPageProps = {
  notificationList: NotificationRow[];
  user: User;
  teamName: string;
  count: number;
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: "/authentication",
        permanent: false,
      },
    };
  }

  const user = session?.user;

  const filter: GetNotificationListFilter = {
    notificationType: "team_invitation",
  };

  const { data, count } = await getNotificationList(
    supabaseClient,
    user.id,
    filter
  );

  // format data to match TeamInvitationListPageProps
  const notificationList = data.map((notification) => {
    const date = moment(notification.notification_date_created);
    const formattedDate = date.fromNow();

    return {
      // notificationId: notification.team_user_notification_id,
      notificationId: notification.notification_id as string,
      content: notification.notification_content as string,
      redirectionUrl: notification.notification_redirect_url,
      dateCreated: formattedDate as string,
      notificationType:
        notification.team_user_notification_type_id as NotificationType,
      isRead: notification.notification_is_read as boolean,
      teamUserNotificationId: notification.team_user_notification_id as string,
    };
  });

  const headerCheckboxKey = uuidv4();
  const headerButtonKey = uuidv4();

  return {
    props: {
      notificationList,
      user,
      count,
      headerCheckboxKey,
      headerButtonKey,
    },
  };
};

const TeamInvitationListPage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ notificationList, user, count, headerCheckboxKey, headerButtonKey }) => {
  const { classes, cx } = useStyles();

  const supabaseClient = useSupabaseClient();

  const router = useRouter();

  const [page, setPage] = useState(1);

  const [records, setRecords] = useState(notificationList);
  const [totalRecords, setTotalRecords] = useState(count);

  const [isLoading, setIsLoading] = useState(false);

  const [keyword, setKeyword] = useState("");

  const [checkList, setCheckList] = useState<string[]>([]);

  const [filter, setFilter] = useState<GetNotificationListFilter>({
    keyword: "",
    notificationType: "team_invitation",
    isUnreadOnly: false,
    sort: "desc",
    range: [0, GET_NOTIFICATION_LIST_LIMIT - 1],
  });

  const handleBulkRead = async () => {
    try {
      const promises = checkList.map((notificationId) =>
        readNotification(supabaseClient, notificationId)
      );

      await Promise.all(promises);

      showNotification({
        message: "Marked notifications as read",
      });

      // update notification list isRead
      const updatedNotificationList = records.map((notification) => {
        if (checkList.includes(notification.notificationId)) {
          return {
            ...notification,
            isRead: true,
          };
        }

        return notification;
      });

      setRecords(updatedNotificationList);

      // clear checkList

      setCheckList([]);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Failed to mark notifications as read",
      });
    }
  };

  const handleCheckRow = (notificationId: string) => {
    if (checkList.includes(notificationId)) {
      setCheckList(checkList.filter((id) => id !== notificationId));
    } else {
      setCheckList([...checkList, notificationId]);
    }
  };

  const handleCheckAllRows = (checkAll: boolean) => {
    if (checkAll) {
      const allNotificationIds = records.map(
        (notification) => notification.notificationId
      );
      setCheckList(allNotificationIds);
    } else {
      setCheckList([]);
    }
  };

  const handleRefetchNotificationList = async () => {
    try {
      setIsLoading(true);

      const { data, count } = await getNotificationList(
        supabaseClient,
        user.id,
        filter
      );

      // format data to match TeamInvitationListPageProps
      const notificationList = data.map((notification) => {
        const date = moment(notification.notification_date_created);
        const formattedDate = date.fromNow();

        return {
          // notificationId: notification.team_user_notification_id,
          notificationId: notification.notification_id as string,
          content: notification.notification_content as string,
          redirectionUrl: notification.notification_redirect_url,
          dateCreated: formattedDate as string,
          notificationType:
            notification.team_user_notification_type_id as NotificationType,
          isRead: notification.notification_is_read as boolean,
          teamUserNotificationId: notification.team_user_notification_id as string,
        };
      });

      setRecords(notificationList);
      setTotalRecords(count);
      setCheckList([]);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPage(page);

    const index = page - 1;
    const start = index * GET_NOTIFICATION_LIST_LIMIT;
    const end = start + GET_NOTIFICATION_LIST_LIMIT - 1;

    setFilter((prevFilter) => ({
      ...prevFilter,
      range: [start, end],
    }));
  };

  const handleRowClick = async ({
    notificationId,
    redirectionUrl,
  }: NotificationRow) => {
    try {
      if (!redirectionUrl) {
        return;
      }
      await readNotification(supabaseClient, notificationId);

      router.push(redirectionUrl);
    } catch (error) {
      console.error(error);
      showNotification({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleFilterChange = (filter: GetNotificationListFilter) => {
    setFilter(filter);
    setPage(1);
  };

  useEffect(() => {
    handleRefetchNotificationList();
  }, [filter]);

  return (
    <Container mt="xl">
      <Group position="apart">
        <Group noWrap spacing="xl">
          <SegmentedControl
            data={[
              { label: "All", value: "all" },
              { label: "Unread", value: "unread" },
            ]}
            value={filter["isUnreadOnly"] ? "unread" : "all"}
            onChange={(value) => {
              if (value === "all") {
                handleFilterChange({
                  ...filter,
                  isUnreadOnly: false,
                });
              } else {
                handleFilterChange({
                  ...filter,
                  isUnreadOnly: true,
                });
              }
            }}
          />
          <TextInput
            placeholder="Search notification..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <ActionIcon
            onClick={() =>
              handleFilterChange({
                ...filter,
                keyword,
              })
            }
          >
            <IconSearch size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
        <Select
          placeholder="Sort by"
          value={filter["sort"]}
          data={[
            { value: "desc", label: "Recent first" },
            { value: "asc", label: "Oldest first" },
          ]}
          onChange={(value) =>
            handleFilterChange({
              ...filter,
              sort: value as "asc" | "desc",
            })
          }
        />
      </Group>

      <Box mt="md">
        <DataTable
          withBorder
          minHeight={250}
          fetching={isLoading}
          records={records}
          fw="bolder"
          // c="dimmed"
          // on hover change background color
          rowClassName={({ redirectionUrl, isRead }) => {
            return cx({
              [classes.hasRedirectionUrl]: redirectionUrl,
              [classes.hasNoRedirectionUrl]: !redirectionUrl,
              [classes.read]: isRead,
            });
          }}
          onRowClick={handleRowClick}
          columns={[
            {
              accessor: "checkbox",
              title: (
                <Checkbox
                  key={headerCheckboxKey}
                  checked={
                    checkList.length > 0 && checkList.length === records.length
                  }
                  size="xs"
                  onChange={(e) => handleCheckAllRows(e.currentTarget.checked)}
                />
              ),
              render: ({ notificationId }) => (
                <Checkbox
                  key={notificationId}
                  size="xs"
                  checked={checkList.includes(notificationId)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleCheckRow(notificationId);
                  }}
                />
              ),
              width: 40,
            },
            {
              accessor: "content",
              title:
                checkList.length > 0 ? (
                  <Button
                    key={headerButtonKey}
                    compact
                    size="xs"
                    onClick={handleBulkRead}
                  >
                    Read
                  </Button>
                ) : (
                  ""
                ),
            },
            // {
            //   accessor: "notificationType",
            //   title: "",
            //   render: ({ notificationType }) => {
            //     return startCase(notificationType as string);
            //   },
            //   visibleMediaQuery: (theme) =>
            //     `(min-width: ${theme.breakpoints.xs}px)`,
            // },
            {
              accessor: "dateCreated",
              title: "",
              textAlignment: "right",
            },
          ]}
          totalRecords={totalRecords}
          recordsPerPage={GET_NOTIFICATION_LIST_LIMIT}
          page={page}
          onPageChange={handlePageChange}
        />
      </Box>
    </Container>
  );
};

export default TeamInvitationListPage;