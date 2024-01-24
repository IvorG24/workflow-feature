import { getBase64 } from "@/utils/functions";
import { ReferenceMemoType } from "@/utils/types";
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
import moment from "moment";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";

type Props = {
  data: ReferenceMemoType;
};

const ReferenceMemoPreview = ({ data }: Props) => {
  const memoAuthorFullname = `${data.memo_author_user.user_first_name} ${data.memo_author_user.user_last_name}`;
  const [lineItems, setLineItems] = useState<React.JSX.Element[]>([]);

  const signerListPreview = data.memo_signer_list ?? [];

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
                  <>
                    <Text weight={600}>Figure {lineItemIndex + 1}</Text>
                    <MantineImage
                      src={imgSrc}
                      alt={caption ?? "No alt provided"}
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
                    {caption && (
                      <Text weight={600}>{`Caption ${
                        lineItemIndex + 1
                      }: ${caption}`}</Text>
                    )}
                  </>
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
    <Paper p="md" radius="md" maw={900}>
      <Text mb="md" weight={700}>
        MEMORANDUM
      </Text>
      <Stack spacing="xs">
        {memoData({
          label: "Reference No.",
          value: data.memo_reference_number,
        })}
        {memoData({
          label: "Date",
          value: moment().format("YYYY-MM-DD"),
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
                    src={signer.memo_signer_signature_public_url}
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

export default ReferenceMemoPreview;

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
