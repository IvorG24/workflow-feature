import { Search } from "@/components/Icon";
import {
  retrieveRequestFormByTeam,
  retrieveRequestList,
} from "@/utils/queries";
import type { Database, RequestType } from "@/utils/types";
import {
  ActionIcon,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ceil } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from "./RequestsPage.module.scss";
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
  { value: "cancelled", label: "Cancelled" },
];

const REQUEST_PER_PAGE = 8;

const All = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [requestList, setRequestList] = useState<RequestType[]>([]);
  const [activePage, setActivePage] = useState(1);
  const [requestCount, setRequestCount] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState<{ value: string; label: string }[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(
    router.query.formId ? `${router.query.formId}` : null
  );

  const fetchRequests = async (isSearch: boolean) => {
    try {
      setSelectedRequest(null);
      setIsLoading(true);
      const start = (activePage - 1) * REQUEST_PER_PAGE;

      const { requestList, requestCount } = await retrieveRequestList(
        supabase,
        start,
        `${router.query.tid}`,
        REQUEST_PER_PAGE,
        selectedForm,
        status,
        search,
        isSearch
      );

      if (!isSearch) {
        setSearch("");
      }
      setRequestList(requestList);
      setRequestCount(Number(requestCount));

      setIsLoading(false);
    } catch (e) {
      showNotification({
        title: "Error!",
        message: "Failed to fetch Request List",
        color: "red",
      });
    }
  };

  const fetchForms = async () => {
    try {
      const requestFormList = await retrieveRequestFormByTeam(
        supabase,
        `${router.query.tid}`
      );
      const forms = requestFormList?.map((form) => {
        return { value: `${form.form_id}`, label: `${form.form_name}` };
      });
      setForms(forms);
    } catch {
      showNotification({
        title: "Error!",
        message: "Failed to fetch Form List",
        color: "red",
      });
    }
  };

  // first load
  useEffect(() => {
    fetchRequests(false);
    fetchForms();
  }, [supabase]);

  // filter
  useEffect(() => {
    setActivePage(1);
    fetchRequests(false);
  }, [selectedForm, status]);

  // change page
  useEffect(() => {
    fetchRequests(false);
  }, [activePage]);

  // todo: add eslint to show error for `mt={"xl"}`
  return (
    <Stack>
      <LoadingOverlay visible={isLoading} overlayBlur={2} />
      <Group mt="xl">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          rightSection={
            <ActionIcon onClick={() => fetchRequests(true)}>
              <Search />
            </ActionIcon>
          }
        />
        <Select
          clearable
          placeholder="Form Type"
          data={forms}
          value={selectedForm}
          onChange={setSelectedForm}
        />
        <Select
          clearable
          placeholder="Status"
          data={statusOptions}
          value={status}
          onChange={setStatus}
        />
      </Group>
      <RequestTable
        requestList={requestList}
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
        setRequestList={setRequestList}
        setIsLoading={setIsLoading}
        
      />
      {requestCount / REQUEST_PER_PAGE > 1 ? (
        <Pagination
          className={styles.pagination}
          page={activePage}
          onChange={setActivePage}
          total={ceil(requestCount / REQUEST_PER_PAGE)}
        />
      ) : null}
    </Stack>
  );
};

export default All;
