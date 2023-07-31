import { updateFormGroup, updateFormSigner } from "@/backend/api/update";
import { useFormActions, useFormList } from "@/stores/useFormStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { checkIfTwoArrayHaveAtLeastOneEqualElement } from "@/utils/arrayFunctions/arrayFunctions";
import { UNHIDEABLE_FORMLY_FORMS } from "@/utils/constant";
import { Database } from "@/utils/database";
import { FormType, TeamMemberWithUserType } from "@/utils/types";
import {
  Button,
  Center,
  Container,
  Flex,
  Group,
  Paper,
  Space,
  Stack,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { isEmpty, isEqual } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import GroupSection from "../FormBuilder/GroupSection";
import SignerSection, { RequestSigner } from "../FormBuilder/SignerSection";
import FormDetailsSection from "./FormDetailsSection";
import FormSection from "./FormSection";

type Props = {
  form: FormType;
  teamMemberList: TeamMemberWithUserType[];
  teamGroupList: string[];
};

const RequestFormPage = ({ form, teamMemberList, teamGroupList }: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const formId = form.form_id;
  const teamMember = useUserTeamMember();
  const formList = useFormList();
  const { setFormList } = useFormActions();

  const initialSignerIds: string[] = [];
  const [activeSigner, setActiveSigner] = useState<number | null>(null);
  const [isSavingSigners, setIsSavingSigners] = useState(false);
  const [initialSigners, setIntialSigners] = useState(
    form.form_signer.map((signer) => {
      initialSignerIds.push(signer.signer_team_member.team_member_id);
      const requestSigner = {
        signer_id: signer.signer_id,
        signer_team_member_id: signer.signer_team_member.team_member_id,
        signer_action: signer.signer_action,
        signer_is_primary_signer: signer.signer_is_primary_signer,
        signer_order: signer.signer_order,
        signer_form_id: formId,
      } as RequestSigner;
      return requestSigner;
    })
  );

  const [initialRequester, setInitialRequester] = useState(form.form_group);
  const [initialGroupBoolean, setInitialGroupBoolean] = useState(
    form.form_is_for_every_member
  );
  const [isSavingRequester, setIsSavingRequester] = useState(false);

  const [isGroupMember, setIsGroupMember] = useState(false);

  useEffect(() => {
    setIsGroupMember(
      form.form_is_for_every_member ||
        (teamMember?.team_member_group_list
          ? checkIfTwoArrayHaveAtLeastOneEqualElement(
              form.form_group,
              teamMember?.team_member_group_list
            )
          : false)
    );
  }, [teamMember]);

  const signerMethods = useForm<{
    signers: RequestSigner[];
    isSignatureRequired: boolean;
  }>();

  const requesterMethods = useForm<{
    groupList: string[];
    isForEveryone: boolean;
  }>({
    defaultValues: {
      groupList: form.form_group,
      isForEveryone: form.form_is_for_every_member,
    },
  });

  const watchGroup = requesterMethods.watch("groupList");

  useEffect(() => {
    const initialRequestSigners = form.form_signer.map((signer) => {
      return {
        signer_id: signer.signer_id,
        signer_team_member_id: signer.signer_team_member.team_member_id,
        signer_action: signer.signer_action,
        signer_is_primary_signer: signer.signer_is_primary_signer,
        signer_order: signer.signer_order,
        signer_form_id: formId,
      };
    });
    signerMethods.setValue("signers", initialRequestSigners);
  }, [form]);

  const handleSaveSigners = async () => {
    const values = signerMethods.getValues();
    const primarySigner = values.signers.filter(
      (signer) => signer.signer_is_primary_signer
    );
    if (isEmpty(primarySigner)) {
      notifications.show({
        message: "There must be atleast one primary signer.",
        color: "orange",
      });
      return;
    }

    setIsSavingSigners(true);
    try {
      await updateFormSigner(supabaseClient, {
        signers: values.signers.map((signer) => {
          return { ...signer, signer_is_disabled: false };
        }),
        formId,
      });
      setIntialSigners(values.signers);
      notifications.show({
        message: "Signers updated.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsSavingSigners(false);
  };

  const handleSaveRequesters = async () => {
    const values = requesterMethods.getValues();

    setIsSavingRequester(true);
    try {
      await updateFormGroup(supabaseClient, {
        formId,
        groupList: values.groupList,
        isForEveryone: values.isForEveryone,
      });
      setInitialRequester(values.groupList);
      setInitialGroupBoolean(values.isForEveryone);

      const isStillMember =
        values.isForEveryone ||
        (teamMember?.team_member_group_list
          ? checkIfTwoArrayHaveAtLeastOneEqualElement(
              values.groupList,
              teamMember?.team_member_group_list
            )
          : false);

      if (isStillMember !== isGroupMember) {
        const newForm = formList.map((form) => {
          if (form.form_id !== formId) return form;
          return { ...form, form_is_hidden: !isStillMember };
        });
        setFormList(newForm);
      }
      setIsGroupMember(isStillMember);

      notifications.show({
        message: "Requesters updated.",
        color: "green",
      });
    } catch (e) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
    setIsSavingRequester(false);
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
              router.push({
                pathname: `/team-requests/dashboard/`,
                query: { ...router.query, formId },
              })
            }
            variant="light"
          >
            Analytics
          </Button>

          {(form.form_is_formsly_form &&
            !UNHIDEABLE_FORMLY_FORMS.includes(form.form_name) &&
            isGroupMember) ||
          (!form.form_is_formsly_form && isGroupMember) ? (
            <Button
              onClick={() =>
                router.push(`/team-requests/forms/${formId}/create`)
              }
            >
              Create Request
            </Button>
          ) : null}
        </Group>
      </Flex>
      <Stack spacing="xl" mt="xl">
        <FormDetailsSection form={form} />

        {form.form_section.map((section) => (
          <FormSection section={section} key={section.section_id} />
        ))}

        <Paper p="xl" shadow="xs" mt="xl">
          <Title order={3}>Requester Details</Title>
          <Space h="xl" />
          <FormProvider {...requesterMethods}>
            <GroupSection teamGroupList={teamGroupList} />
          </FormProvider>

          {!isEqual(initialRequester, watchGroup) ||
          !isEqual(
            initialGroupBoolean,
            requesterMethods.getValues("isForEveryone")
          ) ? (
            <Center mt="xl">
              <Button
                loading={isSavingRequester}
                onClick={handleSaveRequesters}
              >
                Save Changes
              </Button>
            </Center>
          ) : null}
        </Paper>

        <Paper p="xl" shadow="xs" mt="xl">
          <Title order={3}>Signer Details</Title>
          <Space h="xl" />
          <FormProvider {...signerMethods}>
            <SignerSection
              teamMemberList={teamMemberList}
              formId={formId}
              activeSigner={activeSigner}
              onSetActiveSigner={setActiveSigner}
              initialSignerIds={initialSignerIds}
            />
          </FormProvider>

          {!isEqual(initialSigners, signerMethods.getValues("signers")) &&
          activeSigner === null ? (
            <Center mt="xl">
              <Button loading={isSavingSigners} onClick={handleSaveSigners}>
                Save Changes
              </Button>
            </Center>
          ) : null}
        </Paper>
      </Stack>
    </Container>
  );
};

export default RequestFormPage;
