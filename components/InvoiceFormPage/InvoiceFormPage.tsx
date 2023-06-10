import { checkOrderToPurchaseFormStatus } from "@/backend/api/get";
import { updateFormSigner } from "@/backend/api/update";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import {
  AccountingProcessorTableRow,
  FormType,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  Button,
  Center,
  Container,
  Flex,
  Group,
  Paper,
  Space,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { isEmpty, isEqual } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import SignerSection, { RequestSigner } from "../FormBuilder/SignerSection";

import FormDetailsSection from "../RequestFormPage/FormDetailsSection";
import AccountingProcessorList from "./AccountingProcessorList/AccountingProcessorList";
import CreateAccountingProcessor from "./AccountingProcessorList/CreateAccountingProcessor";

type Props = {
  teamMemberList: TeamMemberWithUserType[];
  form: FormType;
  accountingProcessors: AccountingProcessorTableRow[];
  accountingProcessorListCount: number;
};

const InvoiceFormPage = ({
  teamMemberList,
  form,

  accountingProcessors,
  accountingProcessorListCount,
}: Props) => {
  const router = useRouter();
  const supabaseClient = createBrowserSupabaseClient<Database>();
  const { formId } = router.query;
  const team = useActiveTeam();
  const initialSignerIds: string[] = [];

  const [isCreatingAccountingProcessor, setIsCreatingAccountingProcessor] =
    useState(false);
  const [accountingProcessorList, setAccountingProcessorList] =
    useState(accountingProcessors);
  const [accountingProcessorCount, setAccountingProcessorCount] = useState(
    accountingProcessorListCount
  );

  const [isSavingSigners, setIsSavingSigner] = useState(false);
  const [initialSigners, setIntialSigners] = useState(
    form.form_signer.map((signer) => {
      initialSignerIds.push(signer.signer_team_member.team_member_id);
      const requestSigner = {
        signer_id: signer.signer_id,
        signer_team_member_id: signer.signer_team_member.team_member_id,
        signer_action: signer.signer_action,
        signer_is_primary_signer: signer.signer_is_primary_signer,
        signer_order: signer.signer_order,
        signer_form_id: formId as string,
      } as RequestSigner;
      return requestSigner;
    })
  );
  const [activeSigner, setActiveSigner] = useState<number | null>(null);

  const methods = useForm<{
    signers: RequestSigner[];
    isSignatureRequired: boolean;
  }>({});

  useEffect(() => {
    const initialRequestSigners = form.form_signer.map((signer) => {
      return {
        signer_id: signer.signer_id,
        signer_team_member_id: signer.signer_team_member.team_member_id,
        signer_action: signer.signer_action,
        signer_is_primary_signer: signer.signer_is_primary_signer,
        signer_order: signer.signer_order,
        signer_form_id: `${formId}`,
      };
    });
    methods.setValue("signers", initialRequestSigners);
  }, [form]);

  const newTeamMember = {
    form_team_member: {
      team_member_id: form.form_team_member.team_member_id,
      team_member_user: {
        user_first_name: "Formsly",
        user_last_name: "",
        user_avatar: "/icon-request-light.svg",
        user_username: "formsly",
      },
    },
  };
  const newForm = {
    ...form,
    ...newTeamMember,
  };

  const handleSaveSigners = async () => {
    const values = methods.getValues();
    const primarySigner = values.signers.filter(
      (signer) => signer.signer_is_primary_signer
    );
    if (isEmpty(primarySigner)) {
      notifications.show({
        message: "There must be atleast one primary signer",
        color: "orange",
      });
      return;
    }

    setIsSavingSigner(true);
    try {
      await updateFormSigner(supabaseClient, {
        signers: values.signers.map((signer) => {
          return { ...signer, signer_is_disabled: false };
        }),
        formId: formId as string,
      });
      setIntialSigners(values.signers);
      notifications.show({
        title: "Success",
        message: "Signers updated",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsSavingSigner(false);
  };

  const handleFormVisibilityRestriction = async () => {
    try {
      const result = await checkOrderToPurchaseFormStatus(supabaseClient, {
        teamId: team.team_id,
        formId: `${formId}`,
      });
      return result;
    } catch {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  return (
    <Container>
      <Flex justify="space-between">
        <Title order={2} color="dimmed">
          Form Preview
        </Title>
        <Group>
          <Button
            onClick={() =>
              router.push(`/team-requests/forms/${formId}/analytics`)
            }
            variant="light"
          >
            Analytics
          </Button>
          <Button
            onClick={() => router.push(`/team-requests/forms/${formId}/create`)}
          >
            Create Request
          </Button>
        </Group>
      </Flex>
      <Space h="xl" />
      <FormDetailsSection
        form={newForm}
        formVisibilityRestriction={handleFormVisibilityRestriction}
      />

      <Space h="xl" />
      <Paper p="xl" shadow="xs">
        {!isCreatingAccountingProcessor ? (
          <AccountingProcessorList
            accountingProcessorList={accountingProcessorList}
            setAccountingProcessorList={setAccountingProcessorList}
            accountingProcessorCount={accountingProcessorCount}
            setAccountingProcessorCount={setAccountingProcessorCount}
            setIsCreatingAccountingProcessor={setIsCreatingAccountingProcessor}
          />
        ) : null}
        {isCreatingAccountingProcessor ? (
          <CreateAccountingProcessor
            setIsCreatingAccountingProcessor={setIsCreatingAccountingProcessor}
            setAccountingProcessorList={setAccountingProcessorList}
            setAccountingProcessorCount={setAccountingProcessorCount}
          />
        ) : null}
      </Paper>

      <Paper p="xl" shadow="xs" mt="xl">
        <Title order={3}>Signer Details</Title>
        <Space h="xl" />
        <FormProvider {...methods}>
          <SignerSection
            teamMemberList={teamMemberList}
            formId={`${formId}`}
            activeSigner={activeSigner}
            onSetActiveSigner={setActiveSigner}
            initialSignerIds={initialSignerIds}
          />
        </FormProvider>

        {!isEqual(initialSigners, methods.getValues("signers")) &&
        activeSigner === null ? (
          <Center mt="xl">
            <Button loading={isSavingSigners} onClick={handleSaveSigners}>
              Save Changes
            </Button>
          </Center>
        ) : null}
      </Paper>
    </Container>
  );
};

export default InvoiceFormPage;
