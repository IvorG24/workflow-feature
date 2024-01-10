import { createTeamMemo } from "@/backend/api/post";
import { useActiveTeam } from "@/stores/useTeamStore";
import { Database } from "@/utils/database";
import { getMemoReferencePrefix, parseHtmlToMarkdown } from "@/utils/string";
import {
  AttachmentTableRow,
  MemoSignerItem,
  UserTableRow,
} from "@/utils/types";
import { Container, Space, Tabs, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
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
  content = "",
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
  const supabaseClient = createPagesBrowserClient<Database>();
  const activeTeam = useActiveTeam();
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

  const handleCreateMemo = async (data: MemoFormValues) => {
    try {
      if (data.signerList.length <= 0) {
        return notifications.show({
          title: "Memo signers are required",
          message: "Please add atleast one signer.",
          color: "red",
        });
      }

      let signerData = data.signerList
        .sort(
          (a, b) => Number(b.signer_is_primary) - Number(a.signer_is_primary)
        )
        .map((signer, signerIndex) => ({
          memo_signer_order: signerIndex,
          memo_signer_is_primary: signer.signer_is_primary,
          memo_signer_team_member_id: signer.signer_team_member_id,
        }));

      // automatically make signer primary if signerList has only 1 signer
      if (signerData.length === 1) {
        signerData = signerData.map((signer) => ({
          ...signer,
          memo_signer_is_primary: true,
        }));
      }

      const lineItemData = data.lineItem.map((lineItem) => {
        const newLineItem = {
          memo_line_item_content: parseHtmlToMarkdown(
            lineItem.line_item_content
          ),
        };

        if (lineItem.line_item_image_attachment) {
          const newLineItemWithAttachment = {
            ...newLineItem,
            memo_line_item_attachment: lineItem.line_item_image_attachment,
            memo_line_item_attachment_name:
              lineItem.line_item_image_attachment.name,
            memo_line_item_attachment_caption: lineItem.line_item_image_caption,
          };

          return newLineItemWithAttachment;
        }

        return newLineItem;
      });

      const createMemoParams = {
        memoData: {
          memo_author_user_id: user.user_id,
          memo_subject: data.subject,
          memo_team_id: activeTeam.team_id,
          memo_reference_number_prefix: getMemoReferencePrefix(
            activeTeam.team_name
          ),
        },
        signerData,
        lineItemData,
      };
      console.log(createMemoParams);
      const newMemo = await createTeamMemo(supabaseClient, createMemoParams);
      console.log(newMemo);
    } catch (error) {
      console.log(error);
      notifications.show({
        message: "Failed to create memo",
        color: "red",
      });
    }
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
      <Tabs
        variant="pills"
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
    </Container>
  );
};

export default CreateMemoFormPage;
