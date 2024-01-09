import { useActiveTeam } from "@/stores/useTeamStore";
import { getBase64 } from "@/utils/functions";
import { parseHtmlToMarkdown } from "@/utils/string";
import {
  Box,
  Divider,
  Group,
  Image as MantineImage,
  Stack,
  Text,
} from "@mantine/core";
import moment from "moment";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { MemoFormValues } from "./CreateMemoFormPage";

type Props = {
  data: MemoFormValues;
  teamMemoCount: number;
};

const MemoPreview = ({ data, teamMemoCount }: Props) => {
  const team = useActiveTeam();
  const teamName = team.team_name ?? "";

  const [lineItems, setLineItems] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const lineItemsPromises = data.lineItem.map(
        async (lineItem, lineItemIndex) => {
          const imgSrc = lineItem.line_item_image_attachment
            ? `${await getBase64(lineItem.line_item_image_attachment)}`
            : "";

          return (
            <Box key={`lineItem-${lineItemIndex}`}>
              <Markdown>
                {parseHtmlToMarkdown(lineItem.line_item_content)}
              </Markdown>
              {lineItem.line_item_image_attachment && (
                <Box maw={900} mah={600}>
                  <MantineImage
                    src={imgSrc}
                    alt={lineItem.line_item_image_caption ?? "No alt provided"}
                    withPlaceholder
                  />
                  {lineItem.line_item_image_caption && (
                    <Text italic>{lineItem.line_item_image_caption}</Text>
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
    <Box mt="md">
      <Text mb="md" weight={700}>
        MEMORANDUM
      </Text>
      <Stack spacing="xs">
        {memoData({
          label: "Reference No.",
          value: `MEMO-${teamName
            .toUpperCase()
            .split(" ")
            .join("")}-${moment().format("YYYY")}-${teamMemoCount + 1}`,
        })}
        {memoData({
          label: "Date",
          value: moment().format("MMMM DD, YYYY"),
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
      </Stack>
    </Box>
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
      <Text>{value}</Text>
    </Group>
  );
};
