import Layout from "@/components/Layout/Layout";
import {
  getTeam,
  GetTeam,
  getTeamFormTemplateList,
  getTeamMember,
  updateFormTemplateVisbility,
} from "@/utils/queries";
import {
  ActionIcon,
  Box,
  Checkbox,
  Grid,
  Group,
  Text,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { IconEye, IconEyeOff, IconSearch } from "@tabler/icons";
import { DataTable } from "mantine-datatable";
import moment from "moment";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { NextPageWithLayout } from "pages/_app";
import { ReactElement, useEffect, useState } from "react";

const PAGE_SIZE = 15;

export type Form = {
  userId: string;
  username: string;
  formId: string;
  formName: string;
  formIsHidden: boolean;
  formDateCreated: string;
};

export type FormListPagePageProps = {
  formList: Form[];
  team: GetTeam;
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

  const teamName = `${ctx.query?.teamName}`;
  const user = session?.user;

  const [currentUserTeamInfo, team, data] = await Promise.all([
    getTeamMember(supabaseClient, teamName, user.id),
    getTeam(supabaseClient, teamName),
    getTeamFormTemplateList(supabaseClient, teamName),
  ]);

  // if current user is not admin, return not found page
  if (currentUserTeamInfo?.member_role_id === "member" || !team) {
    return {
      notFound: true,
    };
  }

  // format to match FormListPagePageProps
  const formList = data.map((form) => {
    const date = moment(form.form_date_created);
    const formattedDate = date.fromNow();

    return {
      userId: form.user_id,
      username: form.username,
      formId: form.form_id,
      formName: form.form_name,
      formIsHidden: form.form_is_hidden,
      formDateCreated: formattedDate,
    };
  });

  return {
    props: {
      formList,
      team,
    },
  };
};

const FormListPagePage: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ formList, team }) => {
  const supabaseClient = useSupabaseClient();
  const [page, setPage] = useState(1);

  const [records, setRecords] = useState(formList.slice(0, PAGE_SIZE));
  const [totalRecords, setTotalRecords] = useState(formList.length);

  const [query, setQuery] = useState("");
  const [hiddenOnly, setHiddenOnly] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const teamName = team?.team_name as string;
  // const teamId = team?.team_id as string;

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(formList.slice(from, to));
  }, [page]);

  const handleRefetchFormList = async () => {
    try {
      setIsLoading(true);

      const filter = {
        keyword: query,
        isHiddenOnly: hiddenOnly,
      };

      const data = await getTeamFormTemplateList(
        supabaseClient,
        teamName,
        filter
      );

      // format to match FormListPagePageProps
      const formList = data.map((form) => {
        const date = moment(form.form_date_created);
        const formattedDate = date.format("MMM D, YYYY");

        return {
          userId: form.user_id,
          username: form.username,
          formId: form.form_id,
          formName: form.form_name,
          formIsHidden: form.form_is_hidden,
          formDateCreated: formattedDate,
        };
      });

      setPage(1);
      setRecords(formList.slice(0, PAGE_SIZE));
      setTotalRecords(formList.length);
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

  useEffect(() => {
    handleRefetchFormList();
  }, [hiddenOnly]);

  const handleUpdateFormTemplateVisbility = async (
    formId: number,
    isHidden: boolean
  ) => {
    try {
      setIsLoading(true);

      await updateFormTemplateVisbility(supabaseClient, formId, isHidden);

      showNotification({
        message: "Form template visibility updated.",
        color: "green",
      });

      handleRefetchFormList();
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

  return (
    <>
      <Grid align="center" mb="md">
        <Grid.Col xs={8} sm={9}>
          <Group noWrap>
            <TextInput
              sx={{ width: "100%" }}
              placeholder="Search member..."
              // icon={<IconSearch size={16} />}
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
            />
            <ActionIcon
              // size="md"
              onClick={() => handleRefetchFormList()}
            >
              <IconSearch size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Grid.Col>
        <Grid.Col xs={4} sm={3}>
          <Checkbox
            label="Hidden only"
            checked={hiddenOnly}
            onChange={(e) => {
              setHiddenOnly(e.currentTarget.checked);
            }}
          />
        </Grid.Col>
      </Grid>
      {/* <Box h={500}> */}
      <Box>
        <DataTable
          withBorder
          fw="bolder"
          c="dimmed"
          minHeight={250}
          fetching={isLoading}
          records={records}
          columns={[
            { accessor: "formName" },
            { accessor: "formDateCreated" },
            {
              accessor: "username",
            },
            {
              accessor: "formIsHidden",
              title: <Text mr="xs">Visibility</Text>,
              // textAlignment: "right",
              render: ({ formId, formIsHidden }) => {
                return (
                  <Group spacing={4} noWrap>
                    <ActionIcon
                      // size="md"
                      onClick={() =>
                        handleUpdateFormTemplateVisbility(
                          formId as number,
                          !formIsHidden
                        )
                      }
                    >
                      {formIsHidden && <IconEyeOff size={18} stroke={1.5} />}
                      {!formIsHidden && <IconEye size={18} stroke={1.5} />}
                    </ActionIcon>
                  </Group>
                );
              },
            },
          ]}
          totalRecords={totalRecords}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={(p) => setPage(p)}
        />
      </Box>
    </>
  );
};

export default FormListPagePage;

FormListPagePage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
