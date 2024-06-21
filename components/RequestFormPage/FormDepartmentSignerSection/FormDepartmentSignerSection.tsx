import {
  getProjectDepartmentSignerList,
  getTeamDepartmentOptions,
} from "@/backend/api/get";
import { createDepartmentSigner } from "@/backend/api/post";
import { updateDepartmentSigner } from "@/backend/api/update";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import {
  DepartmentSigner,
  DepartmentSignerTableInsert,
  DepartmentSignerTableUpdate,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconReload, IconSearch, IconSettings } from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormDepartmentSignerForm from "./FormDepartmentSignerForm";

type Props = {
  formId: string;
  selectedProjectId: string;
  teamMemberList: TeamMemberWithUserType[];
};

type FormValues = DepartmentSignerTableInsert | DepartmentSignerTableUpdate;

const FormDepartmentSignerSection = ({
  formId,
  selectedProjectId,
  teamMemberList,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const [departmentSignerList, setDepartmentSignerList] = useState<
    DepartmentSigner[]
  >([]);
  const [departmentSignerCount, setDepartmentSignerCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [departmentOptionList, setDepartmentOptionList] = useState<
    { value: string; label: string }[]
  >([]);
  const [openDepartmentSignerForm, setOpenDepartmentSignerForm] =
    useState(false);
  const [isUpdatingDepartmentSigner, setIsUpdatingDepartmentSigner] =
    useState(false);

  const submitDepartmentSignerFormMethods = useForm<FormValues>();
  const { setValue, reset: resetDepartmentSignerForm } =
    submitDepartmentSignerFormMethods;

  const memberWithApproverRoleList = teamMemberList.filter(
    (member) => member.team_member_role !== "MEMBER"
  );
  const signerOptionList = memberWithApproverRoleList.map((member) => ({
    value: member.team_member_id,
    label: `${member.team_member_user.user_first_name} ${member.team_member_user.user_last_name}`,
  }));

  const handleSubmitDepartmentSigner = async (data: FormValues) => {
    try {
      setIsLoading(true);

      if (isUpdatingDepartmentSigner) {
        await updateDepartmentSigner(supabaseClient, data);

        setIsUpdatingDepartmentSigner(false);
      } else {
        const newSigner = await createDepartmentSigner(supabaseClient, {
          ...(data as DepartmentSignerTableInsert),
          department_signer_project_id: selectedProjectId,
          department_signer_form_id: formId,
        });

        if (!newSigner) {
          notifications.show({
            message: "Department already has a signer.",
            color: "red",
          });
          return;
        }
      }
      setOpenDepartmentSignerForm(false);
      resetDepartmentSignerForm();
      notifications.show({
        message: `Successfully ${
          isUpdatingDepartmentSigner ? "updated" : "created"
        } department signer`,
        color: "green",
      });
    } catch (error) {
      notifications.show({
        message: `Failed to ${
          isUpdatingDepartmentSigner ? "update" : "create"
        } department signer`,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchDepartmentSignerList = async (
    page: number,
    search: string
  ) => {
    try {
      setActivePage(page);
      setIsLoading(true);
      const { data, count } = await getProjectDepartmentSignerList(
        supabaseClient,
        {
          formId: formId,
          projectId: selectedProjectId,
          page,
          search,
          limit: ROW_PER_PAGE,
        }
      );
      setDepartmentSignerList(data);
      setDepartmentSignerCount(count ?? 0);
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepartmentSignerList = async () => {
      await handleFetchDepartmentSignerList(1, "");

      const departmentList = await getTeamDepartmentOptions(supabaseClient, {
        index: 1,
        limit: 124,
      });

      setDepartmentOptionList(
        departmentList.map((d) => ({
          value: d.team_department_id,
          label: d.team_department_name,
        }))
      );
    };
    fetchDepartmentSignerList();
  }, []);

  return (
    <Paper p="xl" shadow="xs">
      <Group position="apart">
        <Flex gap="md" align="center">
          <Title order={3}>List of Department Signers</Title>
          <TextInput
            miw={150}
            placeholder="Department"
            rightSection={
              <ActionIcon
                onClick={() =>
                  handleFetchDepartmentSignerList(1, departmentSearch)
                }
              >
                <IconSearch size={16} />
              </ActionIcon>
            }
            value={departmentSearch}
            onChange={async (e) => {
              setDepartmentSearch(e.target.value);
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleFetchDepartmentSignerList(1, departmentSearch);
              }
            }}
            maxLength={4000}
          />
          <Button
            variant="light"
            leftIcon={<IconReload size={16} />}
            onClick={() =>
              handleFetchDepartmentSignerList(activePage, departmentSearch)
            }
          >
            Refresh
          </Button>
        </Flex>
        <Button onClick={() => setOpenDepartmentSignerForm(true)}>
          + Add Department Signer
        </Button>
      </Group>

      <DataTable
        idAccessor="department_signer_id"
        mt="xs"
        withBorder
        fw="bolder"
        c="dimmed"
        minHeight={390}
        fetching={isLoading}
        records={departmentSignerList}
        columns={[
          {
            accessor: "department.team_department_id",
            title: "Department",
            render: ({ department: { team_department_name } }) => (
              <Text>{team_department_name}</Text>
            ),
          },
          {
            accessor: "signer.team_member_id",
            title: "Signer",
            render: ({
              signer: {
                team_member_user: { user_first_name, user_last_name },
              },
            }) => <Text>{`${user_first_name} ${user_last_name}`}</Text>,
          },
          {
            accessor: "department_signer_is_primary",
            title: "Primary",
            render: ({ department_signer_is_primary }) =>
              department_signer_is_primary ? (
                <Badge color="green">Primary</Badge>
              ) : (
                <></>
              ),
          },
          {
            accessor: "department_signer_id",
            title: "Action",
            render: ({ department_signer_id, department, signer }) => (
              <ActionIcon
                onClick={() => {
                  setIsUpdatingDepartmentSigner(true);
                  setOpenDepartmentSignerForm(true);
                  setValue("department_signer_id", department_signer_id);
                  setValue(
                    "department_signer_department_id",
                    department.team_department_id
                  );
                  setValue(
                    "department_signer_team_member_id",
                    signer.team_member_id
                  );
                }}
              >
                <IconSettings size={16} />
              </ActionIcon>
            ),
          },
        ]}
        totalRecords={departmentSignerCount}
        recordsPerPage={ROW_PER_PAGE}
        page={activePage}
        onPageChange={(page: number) => {
          handleFetchDepartmentSignerList(page, departmentSearch);
        }}
      />
      {openDepartmentSignerForm && (
        <FormProvider {...submitDepartmentSignerFormMethods}>
          <FormDepartmentSignerForm
            opened={openDepartmentSignerForm}
            onSubmit={handleSubmitDepartmentSigner}
            close={() => {
              resetDepartmentSignerForm();
              setOpenDepartmentSignerForm(false);
              setIsUpdatingDepartmentSigner(false);
            }}
            isLoading={isLoading}
            departmentOptionList={departmentOptionList}
            signerOptionList={signerOptionList}
          />
        </FormProvider>
      )}
    </Paper>
  );
};

export default FormDepartmentSignerSection;
