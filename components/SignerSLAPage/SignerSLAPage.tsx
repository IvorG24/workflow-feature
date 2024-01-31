import { getFormSLA, getSignerSLA } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { ROW_PER_PAGE } from "@/utils/constant";
import { Database } from "@/utils/database";
import { formatTeamNameToUrlKey } from "@/utils/string";
import { FormSLAWithForm, SignerRequestSLA } from "@/utils/types";
import {
  Badge,
  Button,
  Container,
  Flex,
  LoadingOverlay,
  Pagination,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { IconSettings } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import SignerSLAList from "./SignerSLAList";
import SignerSLAListFilter, { SLAFormValues } from "./SignerSLAListFilter";

type Props = {
  slaFormList: FormSLAWithForm[];
};

const SignerSLAPage = ({ slaFormList }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const router = useRouter();
  const activeTeam = useActiveTeam();

  const [signerSLAList, setSignerSLAList] = useState<SignerRequestSLA[] | null>(
    null
  );
  const [signerSLATotal, setSignerSLATotal] = useState(0);
  const [slaHours, setSlaHours] = useState<number | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const filterMethods = useForm<SLAFormValues>({
    mode: "onChange",
  });
  const team = useActiveTeam();
  const handleFilterSignerSLA = async (data: SLAFormValues, page: number) => {
    if (!team) return;
    if (!data.formId) {
      notifications.show({
        message: "Please select a form then try again",
        color: "orange",
      });

      return;
    }
    try {
      setIsFetchingData(true);

      const formSLA = await getFormSLA(supabaseClient, {
        formId: data.formId,
        teamId: team.team_id,
      });

      if (formSLA.form_sla_hours <= 0) {
        const formName = slaFormList.find(
          (form) => form.form_sla_form_id === data.formId
        )?.form_table.form_name;
        if (!formName) return;
        notifications.show({
          message: (
            <Text>
              SLA required resolution time for
              <Text color="red" span>
                {` ${formName} `}
              </Text>
              is not set
            </Text>
          ),
          color: "orange",
          autoClose: false,
        });

        return;
      }
      const signerSLA = await getSignerSLA(supabaseClient, {
        teamId: team.team_id,
        formId: data.formId,
        projectId: data.projectId,
        singerId: data.singerId,
        status: data.status,
        page: page,
        limit: ROW_PER_PAGE,
      });

      setSignerSLAList(signerSLA.signerRequestSLA);
      setSlaHours(signerSLA.slaHours);
      setSignerSLATotal(signerSLA.signerRequestSLACount);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const { handleSubmit, getValues } = filterMethods;

  const handlePageChange = async (page: number) => {
    setActivePage(page);
    await handleFilterSignerSLA(getValues(), page);
  };

  return (
    <Container p={0} pos="relative">
      <LoadingOverlay visible={isFetchingData} overlayBlur={2} />

      <FormProvider {...filterMethods}>
        <Flex justify="space-between">
          <Title order={3}>Signer SLA</Title>
          <Button
            variant="light"
            onClick={() =>
              router.push(
                `/${formatTeamNameToUrlKey(
                  activeTeam.team_name ?? ""
                )}/requests/sla/signer/settings`
              )
            }
            leftIcon={<IconSettings size="1rem" />}
          >
            Settings
          </Button>
        </Flex>
        <form onSubmit={handleSubmit((data) => handleFilterSignerSLA(data, 1))}>
          <SignerSLAListFilter
            slaFormList={slaFormList}
            onSearch={() => setActivePage(1)}
          />
        </form>

        {signerSLAList && signerSLAList.length > 0 && slaHours !== null && (
          <Flex justify="flex-start" mt="md">
            <Badge>
              SLA resolution time required: {slaHours} Hour
              {slaHours > 1 ? "s" : ""}
            </Badge>
          </Flex>
        )}

        <Paper mt="md" shadow="md" p="sm">
          <SignerSLAList signerSLAList={signerSLAList} />
        </Paper>

        {signerSLATotal > 0 && (
          <Flex justify="flex-end">
            <Pagination
              value={activePage}
              onChange={(value) => handlePageChange(value)}
              total={Math.ceil(signerSLATotal / ROW_PER_PAGE)}
              mt="xl"
            />
          </Flex>
        )}
      </FormProvider>
    </Container>
  );
};

export default SignerSLAPage;
