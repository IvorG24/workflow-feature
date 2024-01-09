import { UserTableRow } from "@/utils/types";
import { Container, Paper, Space, Tabs, Title } from "@mantine/core";
import { IconEye, IconFileDescription } from "@tabler/icons-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import MemoForm from "./MemoForm";
import MemoPreview from "./MemoPreview";

export type MemoFormValues = {
  author: string;
  subject: string;
  lineItem: {
    line_item_content: string;
    line_item_image_attachment?: File;
    line_item_image_caption?: string;
  }[];
};

type Props = {
  user: UserTableRow;
  teamMemoCount: number;
};

export const getDefaultMemoLineItemValue = ({
  content = "Type your content here",
}: {
  content?: string;
}) => ({
  line_item_content: content,
});

const CreateMemoFormPage = ({ user, teamMemoCount }: Props) => {
  const userFullname = `${user.user_first_name} ${user.user_last_name}`;

  const memoFormMethods = useForm<MemoFormValues>({
    defaultValues: {
      author: userFullname,
      subject: "",
      lineItem: [getDefaultMemoLineItemValue({})],
    },
  });

  const [activeTab, setActiveTab] = useState("create");
  const [previewData, setPreviewData] = useState(memoFormMethods.getValues());

  const handleCreateMemo = (data: MemoFormValues) => {
    console.log(data);
  };

  const handleChangeActiveTab = (selectedTab: string) => {
    const currentFormData = memoFormMethods.getValues();
    setPreviewData(currentFormData);
    setActiveTab(selectedTab);
  };

  return (
    <Container>
      <Title order={2} color="dimmed">
        Create Memo Page
      </Title>
      <Space h="xl" />
      <Paper p="md">
        <Tabs
          variant="outline"
          value={activeTab}
          onTabChange={(selectedTab: string) =>
            handleChangeActiveTab(selectedTab)
          }
        >
          <Tabs.List>
            <Tabs.Tab value="create" icon={<IconFileDescription size={14} />}>
              Create
            </Tabs.Tab>
            <Tabs.Tab value="preview" icon={<IconEye size={14} />}>
              Preview
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="create" pt="xs">
            <FormProvider {...memoFormMethods}>
              <MemoForm onSubmit={handleCreateMemo} />
            </FormProvider>
          </Tabs.Panel>

          <Tabs.Panel value="preview" pt="xs">
            <MemoPreview data={previewData} teamMemoCount={teamMemoCount} />
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
};

export default CreateMemoFormPage;
