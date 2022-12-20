import RequestListContext from "@/contexts/RequestListContext";
import { retrieveRequestFormByTeam } from "@/utils/queries";
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
import { useContext, useEffect, useState } from "react";
import SvgSearch from "../Icon/Search";
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
];

const REQUEST_PER_PAGE = 8;

const RequestList = () => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const requestContext = useContext(RequestListContext);
  // const [requestList, setRequestList] = useState<RequestType[]>([]);
  const requestList = requestContext?.requestList;
  const requestCount = Number(requestContext?.requestCount);
  const [activePage, setActivePage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<RequestType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState<{ value: string; label: string }[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(
    router.query.formId ? `${router.query.formId}` : null
  );

  // useEffect(() => {
  //   try {
  //     if (requestContext?.requestList) {
  //       setRequestList(requestContext.requestList);
  //       setIsLoading(false);
  //     }
  //   } catch (error) {
  //     showNotification({
  //       title: "Error!",
  //       message: "Failed to fetch Request List",
  //       color: "red",
  //     });
  //   }
  // }, [requestContext]);

  const handleSearch = () => {
    const { tid, active_tab: activeTab } = router.query;

    router.push(
      `/t/${tid}/requests?active_tab=${activeTab}&page=${activePage}&search_query=${search}`
    );

    return;
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
    // fetchRequests(false);
    fetchForms();
  }, [supabase]);

  // filter
  useEffect(() => {
    setActivePage(1);
    // fetchRequests(false);
  }, [selectedForm, status]);

  // change page
  useEffect(() => {
    // fetchRequests(false);
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
            <ActionIcon onClick={handleSearch}>
              <SvgSearch />
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
        requestList={requestList as RequestType[]}
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
        // setRequestList={setRequestList}
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

export default RequestList;
