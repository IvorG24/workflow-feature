import RequestListContext from "@/contexts/RequestListContext";
import { getFileUrl } from "@/utils/queries";
import type { Database, RequestType } from "@/utils/types";
import {
  ActionIcon,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  SelectItem,
  Stack,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ceil } from "lodash";
import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useState } from "react";
import SvgSearch from "../Icon/Search";
import RequestTable from "./RequestTable";

const statusOptions: {
  value: Database["public"]["Enums"]["request_status"];
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "revision", label: "Revision" },
  { value: "stale", label: "Stale" },
];

const REQUEST_PER_PAGE = 8;

const RequestList = () => {
  const router = useRouter();
  const supabaseClient = useSupabaseClient<Database>();
  const requestContext = useContext(RequestListContext);
  const [requestList, setRequestList] = useState<RequestType[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const forms = requestContext?.forms;
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(
    null
  );
  const [selectedForm, setSelectedForm] = useState<string | null>(
    router.query.formId ? `${router.query.formId}` : null
  );

  const handleSearch = useCallback(
    (search: string) => {
      setIsLoading(true);
      setSearch(search);
      router.replace({ query: { ...router.query, search_query: search } });
    },
    [router]
  );

  // !!! need to test if this will work on a mobile phone
  const handleSearchOnKeyUp = (e: {
    key: string;
    currentTarget: { value: string };
  }) => {
    const search = e.currentTarget.value;

    if (e.key === "Enter") {
      handleSearch(search);
    }
    if (e.key === "Backspace" && search === "") {
      setSearch("");
      handleSearch(search);
    }
  };

  const handleFilterBySelectedForm = useCallback(
    (selectedForm: string | null) => {
      setIsLoading(true);
      setSelectedForm(selectedForm);
      if (selectedForm) {
        router.replace({ query: { ...router.query, form: selectedForm } });
      } else {
        router.push(
          `/t/${router.query.tid}/requests?active_tab=all&page=${activePage}`
        );
      }
    },
    [router, activePage]
  );

  const handleFilterByStatus = useCallback(
    (status: string | null) => {
      setIsLoading(true);
      setStatus(status);
      if (status) {
        router.replace({ query: { ...router.query, status: status } });
      } else {
        router.push(
          `/t/${router.query.tid}/requests?active_tab=${router.query.active_tab}&page=${activePage}`
        );
      }
    },
    [router, activePage]
  );

  const handlePagination = (activePage: number) => {
    setActivePage(activePage);
    router.replace({ query: { ...router.query, page: activePage } });
  };

  useEffect(() => {
    try {
      // * Loop through request list and getFileUrl for each attachment.
      (async () => {
        const requestListWithFileUrl =
          requestContext?.requestList as RequestType[];
        for (const requestItem of requestListWithFileUrl) {
          const attachmentList = requestItem.attachments
            ? requestItem.attachments
            : [];
          const attachmentUrlList = await Promise.all(
            attachmentList.map((path) =>
              getFileUrl(supabaseClient, path, "request_attachments")
            )
          );
          requestItem.attachments = attachmentUrlList;
        }
        setRequestList(requestListWithFileUrl);
      })();
      setRequestCount(Number(requestContext?.requestCount));
      setIsLoading(false);
    } catch (error) {
      showNotification({
        title: "Error!",
        message: "Failed to fetch Request List",
        color: "red",
      });
    }
  }, [requestContext, supabaseClient]);

  // reset filters when team_id changes
  useEffect(() => {
    setSearch("");
    setSelectedForm(null);
    setStatus(null);
  }, [router.query.tid]);

  // set Form Type based on route query
  useEffect(() => {
    setSelectedForm(router.query.form as string);
  }, [router.query.form]);

  // todo: add eslint to show error for `mt={"xl"}`
  return (
    <Stack>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Group mt="xl">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search"
          rightSection={
            <ActionIcon onClick={() => handleSearch(search)}>
              <SvgSearch />
            </ActionIcon>
          }
          onKeyUp={handleSearchOnKeyUp}
        />
        <Select
          clearable
          placeholder="Form Type"
          data={forms as (string | SelectItem)[]}
          value={selectedForm}
          onChange={handleFilterBySelectedForm}
        />
        <Select
          clearable
          placeholder="Status"
          data={statusOptions}
          value={status}
          onChange={handleFilterByStatus}
          data-cy="request-select-status"
        />
      </Group>
      <RequestTable
        requestList={requestList as RequestType[]}
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
        setRequestList={setRequestList}
        setIsLoading={setIsLoading}
      />

      {ceil(requestCount / REQUEST_PER_PAGE) >= 1 ? (
        <Pagination
          sx={{ alignSelf: "flex-end" }}
          page={activePage}
          onChange={handlePagination}
          total={ceil(requestCount / REQUEST_PER_PAGE)}
        />
      ) : null}
    </Stack>
  );
};

export default RequestList;
