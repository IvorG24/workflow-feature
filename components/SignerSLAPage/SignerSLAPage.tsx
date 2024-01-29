import { getFormSLA, getSignerSLA } from "@/backend/api/get";
import { useActiveTeam } from "@/stores/useTeamStore";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
import { Database } from "@/utils/database";
import { FormSLAWithFormName, SignerRequestSLA } from "@/utils/types";
import {
  Badge,
  Container,
  Flex,
  LoadingOverlay,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import SignerSLAList from "./SignerSLAList";
import SignerSLAListFilter, { SLAFormValues } from "./SignerSLAListFilter";

type Props = {
  slaFormList: FormSLAWithFormName[];
};

const SignerSLAPage = ({ slaFormList }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const [signerSLAList, setSignerSLAList] = useState<SignerRequestSLA[] | null>(
    null
  );
  const [slaHours, setSlaHours] = useState<number | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const formList = slaFormList
    .map((slaForm) => ({
      label: slaForm.form.form_name,
      value: slaForm.form_sla_form_id,
      disabled: slaForm.form_sla_hours <= 0,
    }))
    .filter((form) => !UNHIDEABLE_FORMLY_FORMS.includes(form.label))
    .sort((a, b) => (a.value === b.value ? 0 : a.value ? -1 : 1));

  const filterMethods = useForm<SLAFormValues>({
    mode: "onChange",
  });
  const team = useActiveTeam();
  const handleFilterSignerSLA = async (data: SLAFormValues) => {
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
        const formName = formList.find(
          (form) => form.value === data.formId
        )?.label;
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
      });

      setSignerSLAList(signerSLA.signerRequestSLA);
      setSlaHours(signerSLA.slaHours);
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    } finally {
      setIsFetchingData(false);
    }
  };
  const { handleSubmit } = filterMethods;
  return (
    <Container p={0}>
      <LoadingOverlay visible={isFetchingData} overlayBlur={2} />

      <FormProvider {...filterMethods}>
        <Title order={3}>Signer SLA</Title>
        <form onSubmit={handleSubmit(handleFilterSignerSLA)}>
          <SignerSLAListFilter formOptions={formList} />
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
      </FormProvider>
    </Container>
  );
};

export default SignerSLAPage;
