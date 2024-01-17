import { Database } from "@/utils/database";
import { getBase64 } from "@/utils/functions";
import { EditMemoType } from "@/utils/types";
import {
  Box,
  Divider,
  Flex,
  Group,
  Image as MantineImage,
  Paper,
  Space,
  Stack,
  Text,
} from "@mantine/core";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import moment from "moment";
import { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import { v4 as uuidv4 } from "uuid";

type Props = {
  data: EditMemoType;
};

const EditMemoPreview = ({ data }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();
  const memoAuthorFullname = `${data.memo_author_user.user_first_name} ${data.memo_author_user.user_last_name}`;
  const [lineItems, setLineItems] = useState<React.JSX.Element[]>([]);

  const signerListPreview = useMemo(() => {
    const signerList = data.memo_signer_list;
    if (!signerList) return [];

    return signerList.map((signer) => {
      const signatureAttachmentValue =
        signer.memo_signer_team_member?.user.user_signature_attachment
          ?.attachment_value;
      // get signature public url
      if (signatureAttachmentValue) {
        const {
          data: { publicUrl },
        } = supabaseClient.storage
          .from("USER_SIGNATURES")
          .getPublicUrl(signatureAttachmentValue);

        signer.signature_public_url = `${publicUrl}?id=${uuidv4()}`;
      }

      return signer;
    });
  }, [data.memo_signer_list, supabaseClient.storage]);

  useEffect(() => {
    const fetchData = async () => {
      const lineItemsPromises = data.memo_line_item_list.map(
        async (lineItem, lineItemIndex) => {
          const imgSrc =
            lineItem.memo_line_item_attachment &&
            lineItem.memo_line_item_attachment.memo_line_item_attachment_file
              ? `${await getBase64(
                  lineItem.memo_line_item_attachment
                    .memo_line_item_attachment_file
                )}`
              : "";

          const caption =
            lineItem.memo_line_item_attachment
              ?.memo_line_item_attachment_caption;

          return (
            <Box key={`lineItem-${lineItemIndex}`}>
              <Markdown>{lineItem.memo_line_item_content}</Markdown>
              {lineItem.memo_line_item_attachment &&
                lineItem.memo_line_item_attachment
                  .memo_line_item_attachment_file && (
                  <Box maw={900} mah={600}>
                    <MantineImage
                      src={imgSrc}
                      alt={caption ?? "No alt provided"}
                      withPlaceholder
                    />
                    {caption && <Text italic>Image Caption: {caption}</Text>}
                  </Box>
                )}
            </Box>
          );
        }
      );

      const resolvedLineItems = await Promise.all(lineItemsPromises);
      setLineItems(resolvedLineItems);
    };

    fetchData();
  }, [data]);

  return (
    <Paper p="md" radius="md">
      <Text mb="md" weight={700}>
        MEMORANDUM
      </Text>
      <Stack spacing="xs">
        {/* {memoData({
          label: "Reference No.",
          value: `MEMO-${teamName
            .toUpperCase()
            .split(" ")
            .join("")}-${moment().format("YYYY")}-${teamMemoCount + 1}`,
        })} */}
        {memoData({
          label: "Date",
          value: moment().format("MMMM DD, YYYY"),
        })}
        {memoData({
          label: "Author",
          value: memoAuthorFullname,
        })}
        {memoData({
          label: "Subject",
          value: data.memo_subject,
        })}
        <Box>
          <Divider color="dark" mt="sm" />
          <Divider color="dark" mt={2} size="lg" />
        </Box>
        {lineItems}

        <Space mt="xl" />
        {signerListPreview.length > 0 && (
          <Flex gap={48}>
            {signerListPreview.map((signer) => {
              const userData = signer.memo_signer_team_member?.user;
              return (
                <Stack key={signer.memo_signer_id} spacing={0}>
                  <MantineImage
                    width={120}
                    height={80}
                    src={signer.signature_public_url}
                    alt="User signature"
                    fit="contain"
                    withPlaceholder
                    placeholder={
                      <Box>
                        <Text>No signature</Text>
                      </Box>
                    }
                  />
                  <Text
                    weight={600}
                  >{`${userData?.user_first_name} ${userData?.user_last_name}`}</Text>
                  <Text>{userData?.user_job_title}</Text>
                </Stack>
              );
            })}
          </Flex>
        )}
      </Stack>
    </Paper>
  );
};

export default EditMemoPreview;

const memoData = ({ label, value }: { label: string; value: string }) => {
  return (
    <Group>
      <Text weight={600} miw={120}>
        {label}
      </Text>
      <Text>:</Text>
      <Text>{value !== "" ? value : "<empty>"}</Text>
    </Group>
  );
};
