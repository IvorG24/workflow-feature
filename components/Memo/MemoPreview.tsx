import { Database } from "@/utils/database";
import { getBase64 } from "@/utils/functions";
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
import { MemoFormValues } from "./CreateMemoFormPage";

type Props = {
  data: MemoFormValues;
};

const MemoPreview = ({ data }: Props) => {
  const supabaseClient = createPagesBrowserClient<Database>();

  const [lineItems, setLineItems] = useState<React.JSX.Element[]>([]);
  const signerListPreview = useMemo(() => {
    if (!data.signerList) return [];

    return data.signerList.map((signer) => {
      // get signature public url
      if (signer?.signer_signature) {
        const {
          data: { publicUrl },
        } = supabaseClient.storage
          .from("USER_SIGNATURES")
          .getPublicUrl(signer.signer_signature.attachment_value);

        signer.signer_signature.attachment_public_url = `${publicUrl}?id=${uuidv4()}`;
      }

      return signer;
    });
  }, [data.signerList, supabaseClient.storage]);

  useEffect(() => {
    const fetchData = async () => {
      const lineItemsPromises = data.lineItem.map(
        async (lineItem, lineItemIndex) => {
          const imgSrc = lineItem.line_item_image_attachment
            ? `${await getBase64(lineItem.line_item_image_attachment)}`
            : "";

          return (
            <Box key={`lineItem-${lineItemIndex}`}>
              <Markdown>{lineItem.line_item_content}</Markdown>
              {lineItem.line_item_image_attachment && (
                <Box>
                  <Text weight={600}>Figure {lineItemIndex + 1}</Text>
                  <MantineImage
                    src={imgSrc}
                    alt={lineItem.line_item_image_caption ?? "No alt provided"}
                    withPlaceholder
                    width="100%"
                    height="100%"
                    fit="contain"
                    styles={{
                      image: {
                        maxHeight: 600,
                      },
                    }}
                  />
                  {lineItem.line_item_image_caption && (
                    <Text weight={600}>{`Caption ${lineItemIndex + 1}: ${
                      lineItem.line_item_image_caption
                    }`}</Text>
                  )}
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
    <Paper p="md" radius="md" maw={900} h="fit-content">
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
          value: moment().format("YYYY-MM-DD"),
        })}
        {memoData({
          label: "Author",
          value: data.author,
        })}
        {memoData({
          label: "Subject",
          value: data.subject,
        })}
        <Box>
          <Divider color="dark" mt="sm" />
          <Divider color="dark" mt={2} size="lg" />
        </Box>
        {lineItems}

        <Space mt="xl" />
        {signerListPreview.length > 0 && (
          <Flex gap={48}>
            {signerListPreview.map((signer) => (
              <Stack key={signer.signer_team_member_id} spacing={0}>
                <MantineImage
                  width={120}
                  height={80}
                  src={signer.signer_signature?.attachment_public_url}
                  alt="User signature"
                  fit="contain"
                  withPlaceholder
                  placeholder={
                    <Box>
                      <Text>No signature</Text>
                    </Box>
                  }
                />
                <Text weight={600}>{signer.signer_full_name}</Text>
                <Text>{signer.signer_job_title}</Text>
              </Stack>
            ))}
          </Flex>
        )}
      </Stack>
    </Paper>
  );
};

export default MemoPreview;

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
