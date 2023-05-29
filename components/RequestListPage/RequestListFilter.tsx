import { getRequestList } from "@/backend/api/get";
import { useLoadingActions } from "@/stores/useLoadingStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { DEFAULT_REQUEST_LIST_LIMIT } from "@/utils/contant";
import {
  FormStatusType,
  RequestType,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  ActionIcon,
  Group,
  MultiSelect,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";

type RequestListFilterProps = {
  requestList: RequestType[];
  teamMemberList: TeamMemberWithUserType[];
  setVisibleRequestList: Dispatch<SetStateAction<RequestType[]>>;
};

type FilterFormValues = {
  search: string;
  requestorList: string[];
  formList: string[];
  status?: FormStatusType[];
};

const RequestListFilter = ({
  requestList,
  teamMemberList,
  setVisibleRequestList,
}: RequestListFilterProps) => {
  const supabaseClient = useSupabaseClient();
  const { setIsLoading } = useLoadingActions();
  const activeTeam = useActiveTeam();
  const [isAscendingSort, setIsAscendingSort] = useState(false);
  const inputFilterProps = {
    w: 300,
    clearable: true,
    searchable: true,
    nothingFound: "Nothing found",
  };

  const memberList = teamMemberList.map((member) => ({
    value: member.team_member_id,
    label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
  }));

  const initialFormList: { value: string; label: string }[] = [];
  const formList = requestList.reduce((uniqueForms, request) => {
    const formName = request.request_form.form_name;
    const uniqueFormNames = uniqueForms.map((form) => form.label);
    if (!uniqueFormNames.includes(formName)) {
      uniqueForms.push({
        value: request.request_form.form_id,
        label: formName,
      });
    }
    return uniqueForms;
  }, initialFormList);

  const statusList = [
    { value: "APPROVED", label: "Approved" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELED", label: "Canceled" },
  ];

  const { register, handleSubmit, getValues, control } =
    useForm<FilterFormValues>({
      mode: "onChange",
    });

  const handleFilterForms = async (
    { search, requestorList, formList, status }: FilterFormValues = getValues()
  ) => {
    try {
      setIsLoading(true);
      const params = {
        teamId: activeTeam.team_id,
        page: 1,
        limit: DEFAULT_REQUEST_LIST_LIMIT,
        requestor:
          requestorList && requestorList.length > 0 ? requestorList : undefined,
        form: formList && formList.length > 0 ? formList : undefined,
        status: status && status.length > 0 ? status : undefined,
        search: search && search !== "" ? search : undefined,
      };
      const { data, count } = await getRequestList(supabaseClient, {
        ...params,
        sort: isAscendingSort ? "ascending" : "descending",
      });
      setVisibleRequestList(data as RequestType[]);
      console.log(count);
    } catch (e) {
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFilterForms)}>
      <Group>
        <Tooltip label={isAscendingSort ? "Ascending" : "Descending"}>
          <ActionIcon
            onClick={() => setIsAscendingSort(!isAscendingSort)}
            size={36}
            color="dark.3"
            variant="outline"
          >
            {isAscendingSort ? (
              <IconSortAscending size={18} />
            ) : (
              <IconSortDescending size={18} />
            )}
          </ActionIcon>
        </Tooltip>
        <TextInput
          placeholder="Search by request id"
          rightSection={
            <ActionIcon size="xs" type="submit">
              <IconSearch />
            </ActionIcon>
          }
          w={300}
          {...register("search")}
        />
        <Controller
          control={control}
          name="formList"
          render={({ field: { value, onChange } }) => (
            <MultiSelect
              data={formList}
              placeholder="Form"
              value={value}
              onChange={async (value) => {
                onChange(value);
                await handleFilterForms();
              }}
              {...inputFilterProps}
            />
          )}
        />

        <Controller
          control={control}
          name="requestorList"
          render={({ field: { value, onChange } }) => (
            <MultiSelect
              data={memberList}
              placeholder="Requestor"
              value={value}
              onChange={async (value) => {
                onChange(value);
                await handleFilterForms();
              }}
              {...inputFilterProps}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field: { value, onChange } }) => (
            <MultiSelect
              data={statusList}
              placeholder="Status"
              value={value}
              onChange={async (value) => {
                onChange(value);
                console.log(value);
                await handleFilterForms();
              }}
              {...inputFilterProps}
            />
          )}
        />
      </Group>
    </form>
  );
};

export default RequestListFilter;
