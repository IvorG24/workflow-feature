import { getReferenceMemo, getTeamMemoSignerList } from "@/backend/api/get";
import Meta from "@/components/Meta/Meta";
import ReferenceMemoPage from "@/components/ReferenceMemoPage/ReferenceMemoPage";
import { withActiveTeam } from "@/utils/server-side-protections";
import { MemoSignerItem, ReferenceMemoType } from "@/utils/types";
import { notifications } from "@mantine/notifications";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";

export const getServerSideProps: GetServerSideProps = withActiveTeam(
  async ({ supabaseClient, context, user, userActiveTeam }) => {
    try {
      const { memoId } = context.query;
      if (!memoId) {
        return {
          redirect: {
            destination: "/500",
            permanent: false,
          },
        };
      }

      const memo = await getReferenceMemo(supabaseClient, {
        memo_id: `${memoId}`,
        current_user_id: user.id,
      });

      const teamMemoSignerList = await getTeamMemoSignerList(supabaseClient, {
        teamId: userActiveTeam.team_id,
      });

      return {
        props: { memo, teamMemoSignerList },
      };
    } catch (e) {
      return {
        redirect: {
          destination: "/500",
          permanent: false,
        },
      };
    }
  }
);

type Props = {
  memo: ReferenceMemoType;
  teamMemoSignerList: MemoSignerItem[];
};

const Page = ({ memo, teamMemoSignerList }: Props) => {
  const [updatedMemo, setUpdatedMemo] = useState<ReferenceMemoType | null>(
    null
  );

  useEffect(() => {
    const fetchLineItemAttachment = async () => {
      const updatedLineItemWithAttachmentFile = await Promise.all(
        memo.memo_line_item_list.map(async (lineItem) => {
          try {
            if (
              lineItem.memo_line_item_attachment &&
              lineItem.memo_line_item_attachment.memo_line_item_attachment_name
            ) {
              const oldLineAttachmentResponse = await fetch(
                `${lineItem.memo_line_item_attachment.memo_line_item_attachment_public_url}`
              );

              if (!oldLineAttachmentResponse.ok) {
                throw new Error(
                  `Failed to fetch attachment for line item: ${lineItem.memo_line_item_id}`
                );
              }

              const blob = await oldLineAttachmentResponse.blob();
              const oldLineAttachmentFile = new File(
                [blob],
                lineItem.memo_line_item_attachment.memo_line_item_attachment_name,
                { type: blob.type }
              );

              const newLineItem = {
                ...lineItem,
                memo_line_item_attachment: {
                  ...lineItem.memo_line_item_attachment,
                  memo_line_item_attachment_file: oldLineAttachmentFile,
                },
              };
              return newLineItem;
            }

            return lineItem;
          } catch (e) {
            notifications.show({
              message: "Something went wrong. Please try again later.",
              color: "red",
            });
            return lineItem;
          }
        })
      );

      const updatedMemo = {
        ...memo,
        memo_line_item_list: updatedLineItemWithAttachmentFile,
      };

      setUpdatedMemo(updatedMemo);
    };

    fetchLineItemAttachment();
  }, [memo]);

  return (
    <>
      <Meta description="EditMemo Page" url="/teamName/memo/memoId/edit" />
      {updatedMemo && (
        <ReferenceMemoPage
          memo={updatedMemo}
          teamMemoSignerList={teamMemoSignerList}
        />
      )}
    </>
  );
};

export default Page;
Page.Layout = "APP";
