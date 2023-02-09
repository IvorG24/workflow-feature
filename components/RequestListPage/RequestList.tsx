import {
  Button,
  Container,
  Group,
  Loader,
  LoadingOverlay,
  SimpleGrid,
  Text,
} from "@mantine/core";
import { useEffect, useState } from "react";
import RequestCard, { RequestCardProps } from "./RequestCard";

import {
  getRequestApproverList,
  GetRequestApproverList,
  getTeamRequestList,
  GetTeamRequestList,
} from "@/utils/queries";
import { RequestStatus } from "@/utils/types";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import queryString from "query-string";
import RequestListFilter from "./RequestListFilter";

function RequestList() {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const [noFurtherRequestList, setNoFurtherRequestList] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [requestList, setRequestList] = useState<GetTeamRequestList>([]);
  const [requestApproverList, setRequestApproverList] = useState<{
    [key: string]: GetRequestApproverList;
  }>({});
  const [isFetchingMoreRequestList, setIsFetchingMoreRequestList] =
    useState(false);

  const increment = 15;
  // const start = router.query.start ? parseInt(router.query.start as string) : 0;
  const [range, setRange] = useState([1, increment]);

  const handleLoadMore = async () => {
    try {
      setIsFetchingMoreRequestList(true);

      const newRange = [range[1] + 1, range[1] + increment];
      setRange(() => newRange);

      const stringifiedFilter = queryString.stringify(router.query);
      const parsedFilter = queryString.parse(stringifiedFilter);

      const data = await getTeamRequestList(
        supabaseClient,
        router.query.teamName as string,
        // newRange,
        // parsedFilter
      );

      if (data.length < 1) {
        setNoFurtherRequestList(true);
        return;
      }

      const promises = data.map((request) => {
        return getRequestApproverList(
          supabaseClient,
          request.request_id as number
        );
      });

      const data2 = await Promise.all(promises);

      const requestApproverList: { [key: string]: GetRequestApproverList } = {};

      data2.map((approverList) => {
        const requestId = `${approverList[0].request_id}`;
        requestApproverList[requestId] = approverList;
      });

      // append to request list and appover list
      setRequestApproverList((prev) => ({
        ...prev,
        ...requestApproverList,
      }));

      setRequestList((prev) => [...prev, ...data]);
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingMoreRequestList(false);
    }
  };

  const formatApproverListToSectionList = (
    requestId: number
  ): RequestCardProps["sectionList"] => {
    const approverList = requestApproverList[`${requestId}`];
    const sectionList: RequestCardProps["sectionList"] = [];
    const value =
      (approverList ? 1 / Object.keys(approverList).length : 0) * 100;

    approverList.map((approver) => {
      const color =
        approver.request_approver_action_status_id === "approved"
          ? "green"
          : approver.request_approver_action_status_id === "rejected"
          ? "red"
          : "gray";
      const label = approver.username || "Approver no username";
      const tooltip = `Request ${approver.request_approver_action_status_id} by ${approver.username}`;

      const section = {
        value,
        color,
        label,
        tooltip,
      };

      sectionList.push(section);
    });

    // sort section list by green first, then red, then gray
    sectionList.sort((a, b) => {
      if (a.color === "green") return -1;
      if (b.color === "green") return 1;
      if (a.color === "red") return -1;
      if (b.color === "red") return 1;
      return 0;
    });

    return sectionList;
  };

  useEffect(() => {
    (async () => {
      try {
        if (!router.isReady) return;
        setIsFetching(true);

        const stringifiedFilter = queryString.stringify(router.query);
        const parsedFilter = queryString.parse(stringifiedFilter);

        setRange(() => [1, increment]);
        setNoFurtherRequestList(false);

        const data = await getTeamRequestList(
          supabaseClient,
          router.query.teamName as string,
          // range,
          // parsedFilter
        );

        // if (data.length < 1) return;

        const promises = data.map((request) => {
          return getRequestApproverList(
            supabaseClient,
            request.request_id as number
          );
        });

        const data2 = await Promise.all(promises);

        const requestApproverList: { [key: string]: GetRequestApproverList } =
          {};

        data2.map((approverList) => {
          const requestId = `${approverList[0].request_id}`;
          requestApproverList[requestId] = approverList;
        });

        setRequestApproverList(() => requestApproverList);
        setRequestList(() => data);
      } catch (error) {
        console.error(error);
        showNotification({
          title: "Error",
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
      } finally {
        setIsFetching(false);
      }
    })();
  }, [
    router.query.form,
    router.query.mainStatus,
    router.query.requester,
    router.query.keyword,
    router.query.teamName,
  ]);

  return (
    <>
      <LoadingOverlay visible={isUpdatingStatus} overlayBlur={2} />
      <Text size="xl" mb="xl" weight="bolder">
        Requests
      </Text>
      <Container my="md" p={0}>
        {/* <RequestListFilter /> */}
        {/* Request Card List */}
        {isFetching && (
          <Group position="center" mt="xl">
            <Loader />
          </Group>
        )}
        {!isFetching && (
          <SimpleGrid
            mt="xl"
            breakpoints={[
              { minWidth: "sm", cols: 2 },
              { minWidth: "xl", cols: 3 },
            ]}
          >
            {requestList.map((request) => {
              const primaryApprover = requestApproverList[
                `${request.request_id}`
              ]?.find(
                (approver) =>
                  approver.request_approver_action_is_primary_approver
              );
              const primaryApproverName = primaryApprover?.username || "";
              const primaryApproverId = primaryApprover?.user_id || "";
              const currentUserApprover = requestApproverList[
                `${request.request_id}`
              ]?.find((approver) => approver.user_id === user?.id);
              const approverList = requestApproverList[
                `${request.request_id}`
                //   ]?.map((approver) => approver.user_avatar_filepath || "");
              ]?.map((approver) => {
                return {
                  avatarUrl: "",
                  username: approver.username || "No username",
                  actionId:
                    approver.request_approver_action_status_id as string,
                  actionStatus:
                    approver.request_approver_action_status_id as RequestStatus,
                  approverId: approver.user_id as string,
                };
              });

              const isCurrentUserApprover = !!currentUserApprover;
              const currentUserApproverActionId =
                currentUserApprover?.request_approver_action_action_id as string;
              const currentUserApproverActionStatusId =
                currentUserApprover?.request_approver_action_status_id as RequestStatus;
              const requestCardProps: RequestCardProps = {
                requestId: request.request_id as number,
                title: request.request_title || "No title",
                description: request.request_description || "No description",
                dateRequested: request.request_date_created || "",
                requestMainStatus:
                  request.form_fact_request_status_id as RequestStatus,
                requesterUsername: request.username || "Requester no username",
                requesterAvatarUrl: request.user_avatar_filepath || "",
                sectionList: formatApproverListToSectionList(
                  request.request_id as number
                ),
                primaryApproverName,
                isCurrentUserApprover,
                approverList,
                primaryApproverId,
                currentUserApproverActionId,
                currentUserApproverActionStatusId,
                setIsUpdatingStatus,
              };

              return (
                <RequestCard key={request.request_id} {...requestCardProps} />
              );
            })}
          </SimpleGrid>
        )}
      </Container>
      {/* Fetch more request list button */}
      {isFetchingMoreRequestList && !isFetching && (
        <Group position="center" mt="xl">
          <Loader />
        </Group>
      )}
      {/* {!isFetchingMoreRequestList && !isFetching && !noFurtherRequestList && (
        <Group position="center" mt="xl">
          <Button onClick={handleLoadMore}>Load More</Button>
        </Group>
      )}
      {!isFetchingMoreRequestList && !isFetching && noFurtherRequestList && (
        <Group position="center" mt="xl">
          <Text>No more requests</Text>
        </Group>
      )} */}
    </>
  );
}

export default RequestList;
