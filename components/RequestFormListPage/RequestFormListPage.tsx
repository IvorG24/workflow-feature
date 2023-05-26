import { deleteForm } from "@/backend/api/delete";
import { getFormListWithFilter } from "@/backend/api/get";
import { updateFormVisibility } from "@/backend/api/update";
import { DEFAULT_FORM_LIST_LIMIT } from "@/utils/contant";
import { Database } from "@/utils/database";
import { FormWithOwnerType, TeamMemberWithUserType } from "@/utils/types";
import {
  ActionIcon,
  Container,
  Flex,
  LoadingOverlay,
  MultiSelect,
  Pagination,
  Select,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { useFocusWithin } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import {
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import DeleteFormModal from "./DeleteFormModal";
import FormCard from "./FormCard";
import ToggleHideFormModal from "./ToggleHideFormModal";

type Props = {
  formList: FormWithOwnerType[];
  formListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  teamId: string;
};

type SearchForm = {
  search: string;
  creatorList: string[];
  isAscendingSort: boolean;
  status?: "hidden" | "visible";
};

const RequestFormListPage = ({
  formList: initialFormList,
  formListCount: initialFormListCount,
  teamMemberList,
  teamId,
}: Props) => {
  const supabaseClient = createBrowserSupabaseClient<Database>();

  const [formList, setFormList] =
    useState<FormWithOwnerType[]>(initialFormList);
  const [formListCount, setFormListCount] = useState(initialFormListCount);
  const [isFetchingFormList, setIsFetchingFormList] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [isDeletingForm, setIsDeletingForm] = useState(false);
  const [isHidingForm, setIsHidingForm] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormWithOwnerType | null>(
    null
  );

  const { register, handleSubmit, getValues, setValue, control } =
    useForm<SearchForm>({
      defaultValues: { isAscendingSort: false },
      mode: "onChange",
    });

  const { ref: creatorRef, focused: creatorRefFocused } = useFocusWithin();
  const handleFilterForms = async (
    { search, creatorList, isAscendingSort, status }: SearchForm = getValues()
  ) => {
    try {
      setIsFetchingFormList(true);

      const { data, count } = await getFormListWithFilter(supabaseClient, {
        teamId,
        app: "REQUEST",
        page: activePage,
        limit: DEFAULT_FORM_LIST_LIMIT,
        creator: creatorList,
        status: status,
        sort: isAscendingSort ? "ascending" : "descending",
        search: search,
      });

      const result = data as FormWithOwnerType[];
      setFormList(result);
      setFormListCount(count || 0);
    } catch (e) {
      console.log(e);
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
    } finally {
      setIsFetchingFormList(false);
    }
  };

  const handleUpdateFormVisibility = async (id: string, isHidden: boolean) => {
    try {
      await updateFormVisibility(supabaseClient, {
        formId: id,
        isHidden: !isHidden,
      });

      setFormList((formList) =>
        formList.map((form) => {
          if (form.form_id !== id) return form;
          return { ...form, form_is_hidden: !isHidden };
        })
      );

      notifications.show({
        title: "Success!",
        message: "Updated form visibility.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
    }
  };

  const handleDeleteForm = async (id: string) => {
    try {
      await deleteForm(supabaseClient, {
        formId: id,
      });

      setFormList((formList) => formList.filter((form) => form.form_id !== id));

      notifications.show({
        title: "Success!",
        message: "Deleted form.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Something went wrong",
        message: "Please try again later",
        color: "red",
      });
    }
  };

  const creatorData = teamMemberList.map((member) => {
    return {
      value: member.team_member_id,
      label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
    };
  });

  const statusData = [
    {
      value: "visible",
      label: "Visible only",
    },
    {
      value: "hidden",
      label: "Hidden only",
    },
  ];

  return (
    <Container p={0} fluid>
      <Title order={2}>Forms </Title>

      <form onSubmit={handleSubmit(handleFilterForms)}>
        <Flex gap="lg" align="center" wrap="wrap" mt="xl">
          <Controller
            control={control}
            name="isAscendingSort"
            defaultValue={true}
            render={({ field: { value } }) => {
              return (
                <Tooltip
                  label={
                    getValues("isAscendingSort") ? "Ascending" : "Descending"
                  }
                  openDelay={800}
                >
                  <ActionIcon
                    onClick={async () => {
                      setValue(
                        "isAscendingSort",
                        !getValues("isAscendingSort")
                      );

                      await handleFilterForms();
                    }}
                    size={36}
                    color="dark.3"
                    variant="outline"
                  >
                    {value ? (
                      <IconSortAscending size={18} />
                    ) : (
                      <IconSortDescending size={18} />
                    )}
                  </ActionIcon>
                </Tooltip>
              );
            }}
          />

          <TextInput
            placeholder="Search form..."
            rightSection={
              <ActionIcon size="xs" type="submit">
                <IconSearch />
              </ActionIcon>
            }
            {...register("search")}
          />

          <Controller
            control={control}
            name="creatorList"
            render={({ field: { value, onChange } }) => (
              <MultiSelect
                data={creatorData}
                placeholder="Creator"
                value={value}
                onChange={async (value) => {
                  onChange(value);
                  if (!creatorRefFocused) await handleFilterForms();
                }}
                onDropdownClose={async () => await handleFilterForms()}
                ref={creatorRef}
                color={creatorRefFocused ? "green" : "red"}
                clearable
                searchable
              />
            )}
          />

          <Controller
            control={control}
            name="status"
            render={({ field: { value, onChange } }) => (
              <Select
                data={statusData}
                placeholder="Status"
                value={value}
                onChange={async (value) => {
                  onChange(value);
                  await handleFilterForms();
                }}
                clearable
              />
            )}
          />
        </Flex>
      </form>

      <Container m={0} p={0} pos="relative" fluid>
        <LoadingOverlay
          visible={isFetchingFormList}
          overlayBlur={2}
          transitionDuration={500}
        />
        <Flex
          justify={formList.length > 0 ? "flex-start" : "center"}
          align="center"
          gap="md"
          wrap="wrap"
          mih={170}
          mt="xl"
        >
          {formList.length > 0 ? (
            formList.map((form) => (
              <FormCard
                form={form}
                onDeleteForm={() => {
                  setSelectedForm(form);
                  setIsDeletingForm(true);
                }}
                onHideForm={() => {
                  setSelectedForm(form);
                  setIsHidingForm(true);
                }}
                key={form.form_id}
              />
            ))
          ) : (
            <Text align="center" size={24} weight="bolder" color="dark.1">
              No form/s found
            </Text>
          )}
        </Flex>
      </Container>

      <Pagination
        value={activePage}
        total={Math.ceil(formListCount / DEFAULT_FORM_LIST_LIMIT)}
        onChange={async (value) => {
          setActivePage(value);
          await handleFilterForms();
        }}
        mt="xl"
        position="right"
      />

      {selectedForm !== null && (
        <>
          <DeleteFormModal
            opened={isDeletingForm}
            onClose={() => setIsDeletingForm(false)}
            onDeleteForm={async () => {
              await handleDeleteForm(selectedForm?.form_id);
              setIsDeletingForm(false);
            }}
          />

          <ToggleHideFormModal
            opened={isHidingForm}
            onClose={() => setIsHidingForm(false)}
            onToggleHideForm={async () => {
              await handleUpdateFormVisibility(
                selectedForm?.form_id,
                selectedForm?.form_is_hidden
              );
              setIsHidingForm(false);
            }}
            isHidden={selectedForm?.form_is_hidden}
          />
        </>
      )}
    </Container>
  );
};

export default RequestFormListPage;
