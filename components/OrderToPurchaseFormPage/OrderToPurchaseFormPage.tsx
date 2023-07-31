import { checkOrderToPurchaseFormStatus } from "@/backend/api/get";
import { updateFormGroup, updateFormSigner } from "@/backend/api/update";
import { useFormActions, useFormList } from "@/stores/useFormStore";
import { useActiveTeam } from "@/stores/useTeamStore";
import { useUserTeamMember } from "@/stores/useUserStore";
import { checkIfTwoArrayHaveAtLeastOneEqualElement } from "@/utils/arrayFunctions/arrayFunctions";
import { Database } from "@/utils/database";
import {
  FormType,
  ItemWithDescriptionType,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Group,
  Paper,
  Space,
  Stack,
  Switch,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { isEmpty, isEqual } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import GroupSection from "../FormBuilder/GroupSection";
import SignerSection, { RequestSigner } from "../FormBuilder/SignerSection";
import FormDetailsSection from "../RequestFormPage/FormDetailsSection";
import FormSection from "../RequestFormPage/FormSection";
import ItemDescription from "./ItemDescription/ItemDescription";
import CreateItem from "./ItemList/CreateItem";
import ItemList from "./ItemList/ItemList";

type Props = {
  items: ItemWithDescriptionType[];
  itemListCount: number;
  teamMemberList: TeamMemberWithUserType[];
  form: FormType;
  teamGroupList: string[];
};

const OrderToPurchaseFormPage = ({
  items,
  itemListCount,
  teamMemberList,
  form,
  teamGroupList,
}: Props) => {
  const router = useRouter();
  const supabaseClient = createPagesBrowserClient<Database>();
  const { formId } = router.query;
  const team = useActiveTeam();
  const teamMember = useUserTeamMember();
  const formList = useFormList();
  const { setFormList } = useFormActions();
  const initialSignerIds: string[] = [];

  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ItemWithDescriptionType | null>(null);
  const [itemList, setItemList] = useState(items);
  const [itemCount, setItemCount] = useState(itemListCount);

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
        signer_form_id: formId as string,
      } as RequestSigner;
      return requestSigner;
    })
  );
  const [activeSigner, setActiveSigner] = useState<number | null>(null);
  const [switchValue, setSwitchValue] = useState(false);

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
        signer_form_id: `${formId}`,
      };
    });
    signerMethods.setValue("signers", initialRequestSigners);
  }, [form]);

  const newTeamMember = {
    form_team_member: {
      team_member_id: form.form_team_member.team_member_id,
      team_member_user: {
        user_id: uuidv4(),
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

  const handleSaveRequesters = async () => {
    const values = requesterMethods.getValues();

    setIsSavingRequester(true);
    try {
      await updateFormGroup(supabaseClient, {
        formId: `${formId}`,
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
              router.push({
                pathname: `/team-requests/dashboard/`,
                query: { ...router.query, formId },
              })
            }
            variant="light"
          >
            Analytics
          </Button>
          {isGroupMember ? (
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
      <Space h="xl" />
      <FormDetailsSection
        form={newForm}
        formVisibilityRestriction={handleFormVisibilityRestriction}
      />
      <Space h="xl" />
      <Center>
        <Switch
          onLabel="Form Preview"
          offLabel="Form Details"
          size="xl"
          checked={switchValue}
          onChange={(e) => setSwitchValue(e.target.checked)}
          sx={{
            label: {
              cursor: "pointer",
            },
          }}
        />
      </Center>
      <Space h="xl" />

      {!switchValue ? (
        <Box>
          <Paper p="xl" shadow="xs">
            {!isCreatingItem ? (
              <ItemList
                itemList={itemList}
                setItemList={setItemList}
                itemCount={itemCount}
                setItemCount={setItemCount}
                setIsCreatingItem={setIsCreatingItem}
                setSelectedItem={setSelectedItem}
              />
            ) : null}
            {isCreatingItem ? (
              <CreateItem
                setIsCreatingItem={setIsCreatingItem}
                setItemList={setItemList}
                setItemCount={setItemCount}
              />
            ) : null}
          </Paper>
          <Space h="xl" />
          <Paper p="xl" shadow="xs">
            {!selectedItem ? (
              <Center>
                <Text color="dimmed">No item selected</Text>
              </Center>
            ) : null}
            {selectedItem ? (
              <ItemDescription
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            ) : null}
          </Paper>
        </Box>
      ) : null}

      {switchValue ? (
        <Stack spacing="xl">
          <FormSection section={form.form_section[0]} />
          <FormSection section={form.form_section[1]} />
          <FormSection
            section={{
              ...form.form_section[2],
              section_field: form.form_section[2].section_field.slice(0, 5),
            }}
          />
        </Stack>
      ) : null}

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
            <Button loading={isSavingRequester} onClick={handleSaveRequesters}>
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
            formId={`${formId}`}
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
    </Container>
  );
};

export default OrderToPurchaseFormPage;
