import { updateFormSigner } from "@/backend/api/update";
import { Database } from "@/utils/database";
import { isEmpty, isEqual } from "@/utils/functions";
import { TeamMemberWithUserType } from "@/utils/types";
import { Button, Center, CloseButton, Flex, Space, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import SignerSection, { RequestSigner } from "./SignerSection";

type Props = {
  teamMemberList: TeamMemberWithUserType[];
  formId: string;
  formSigner: RequestSigner[];
  selectedProject: { projectName: string; projectId: string };
  setSelectedProject: Dispatch<
    SetStateAction<{
      projectName: string;
      projectId: string;
    } | null>
  >;
};

const SignerPerProject = ({
  teamMemberList,
  formId,
  formSigner,
  selectedProject,
  setSelectedProject,
}: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const initialSignerIds: string[] = [];

  const [isSavingSigners, setIsSavingSigners] = useState(false);
  const [activeSigner, setActiveSigner] = useState<number | null>(null);
  const [initialSigners, setIntialSigners] = useState<RequestSigner[]>(
    formSigner.map((signer) => {
      initialSignerIds.push(signer.signer_team_member_id);
      const requestSigner = {
        signer_id: signer.signer_id,
        signer_team_member_id: signer.signer_team_member_id,
        signer_action: signer.signer_action,
        signer_is_primary_signer: signer.signer_is_primary_signer,
        signer_order: signer.signer_order,
        signer_form_id: formId,
      } as RequestSigner;
      return requestSigner;
    })
  );

  useEffect(() => {
    signerMethods.setValue(
      "signers",
      formSigner.map((signer) => {
        return {
          signer_id: signer.signer_id,
          signer_team_member_id: signer.signer_team_member_id,
          signer_action: signer.signer_action,
          signer_is_primary_signer: signer.signer_is_primary_signer,
          signer_order: signer.signer_order,
          signer_form_id: formId,
        };
      })
    );
  }, [formSigner]);

  const signerMethods = useForm<{
    signers: RequestSigner[];
  }>();

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
          return {
            ...signer,
            signer_is_disabled: false,
          };
        }),
        selectedProjectId: selectedProject.projectId,
        formId: formId as string,
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

  return (
    <>
      <Flex align="center" justify="space-between">
        <Title order={3}>{selectedProject.projectName} Signer</Title>
        <CloseButton onClick={() => setSelectedProject(null)} />
      </Flex>

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
    </>
  );
};

export default SignerPerProject;
