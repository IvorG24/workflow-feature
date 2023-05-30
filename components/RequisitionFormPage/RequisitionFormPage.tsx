import {
  FormType,
  ItemWithDescriptionType,
  TeamMemberWithUserType,
} from "@/utils/types";
import {
  Button,
  Center,
  Container,
  Flex,
  Paper,
  Space,
  Text,
  Title,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FormBuilderData } from "../FormBuilder/FormBuilder";
import SignerSection from "../FormBuilder/SignerSection";
import FormDetailsSection from "../RequestFormPage/FormDetailsSection";
import ItemDescription from "./ItemDescription/ItemDescription";
import CreateItem from "./ItemList/CreateItem";
import ItemList from "./ItemList/ItemList";

type Props = {
  items: ItemWithDescriptionType[];
  itemsCount: number;
  teamMemberList: TeamMemberWithUserType[];
  form: FormType;
};

const RequisitionFormPage = ({
  items,
  itemsCount,
  teamMemberList,
  form,
}: Props) => {
  const router = useRouter();
  const { formId } = router.query;

  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ItemWithDescriptionType | null>(null);
  const [itemList, setItemList] = useState(items);
  const [itemCount, setItemCount] = useState(itemsCount);

  const methods = useForm<FormBuilderData["signers"]>({});

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

  return (
    <Container>
      <Flex justify="space-between">
        <Title order={2} color="dimmed">
          Form Preview
        </Title>
        <Button
          onClick={() => router.push(`/team-requests/forms/${formId}/create`)}
        >
          Create Request
        </Button>
      </Flex>
      <Space h="xl" />
      <FormDetailsSection form={newForm} />
      <Space h="xl" />
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

      <Paper p="xl" shadow="xs" mt="xl">
        <FormProvider {...methods}>
          <SignerSection teamMemberList={teamMemberList} />
        </FormProvider>
      </Paper>
    </Container>
  );
};

export default RequisitionFormPage;
