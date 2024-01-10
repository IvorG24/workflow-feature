import {
  AttachmentTableRow,
  MemoSignerItem,
  UserTableRow,
} from "@/utils/types";
import { Container, Paper, Space, Tabs, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
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
  signerList: {
    signer_status: string;
    signer_is_primary: boolean;
    signer_team_member_id: string;
    signer_full_name: string;
    signer_avatar: string | null;
    signer_signature:
      | (AttachmentTableRow & { attachment_public_url?: string })
      | null;
    signer_job_title: string | null;
  }[];
};

type Props = {
  user: UserTableRow;
  teamMemoCount: number;
  teamMemoSignerList: MemoSignerItem[];
};

export const getDefaultMemoLineItemValue = ({
  content = "<p>Type your content here</p>",
}: {
  content?: string;
}) => ({
  line_item_content: content,
});

const CreateMemoFormPage = ({
  user,
  teamMemoCount,
  teamMemoSignerList,
}: Props) => {
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
    if (data.signerList.length <= 0) {
      return notifications.show({
        title: "Memo signers are required",
        message: "Please add atleast one signer.",
        color: "red",
      });
    }
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
              <MemoForm
                onSubmit={handleCreateMemo}
                teamMemoSignerList={teamMemoSignerList}
              />
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
