import { getBase64 } from "@/utils/functions";
import { Box, Flex, Image, Paper, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { MemoFormatFormValues } from "./MemoFormatEditor";

type Props = {
  formatData: MemoFormatFormValues;
};

const getSectionColor = (section: string) => {
  switch (section) {
    case "header":
      return "#339AF0";
    case "body":
      return "#51CF66";
    case "footer":
      return "#373A40";

    default:
      return "#339AF0";
  }
};

const MemoFormatPreview = ({ formatData }: Props) => {
  const { formatSection } = formatData;
  const [sectionList, setSectionList] = useState<React.JSX.Element[]>([]);

  useEffect(() => {
    const renderFormatData = async () => {
      const formatDataWithImageAttachment = formatSection.map(
        async (section) => {
          const renderSubsection = await Promise.all(
            section.format_subsection.map(async (subsection) => {
              const renderImageAttachmentList = await Promise.all(
                subsection.subsection_attachment.map(async (attachment) => {
                  const imageAttachmentSource =
                    attachment.memo_format_attachment_file
                      ? `${await getBase64(
                          attachment.memo_format_attachment_file
                        )}`
                      : attachment.memo_format_attachment_url;

                  return (
                    <Box key={attachment.memo_format_attachment_id}>
                      {imageAttachmentSource && (
                        <Image
                          src={imageAttachmentSource}
                          alt="Section Image"
                          withPlaceholder
                          width={90}
                          height={30}
                          fit="contain"
                        />
                      )}
                    </Box>
                  );
                })
              );

              return (
                <Flex
                  key={subsection.memo_format_subsection_id}
                  gap="sm"
                  wrap="wrap"
                >
                  {subsection.memo_format_subsection_text && (
                    <Text miw={0} sx={{ wordBreak: "break-word" }}>
                      {subsection.memo_format_subsection_text}
                    </Text>
                  )}
                  {subsection.subsection_attachment.length > 0
                    ? renderImageAttachmentList
                    : null}
                </Flex>
              );
            })
          );

          return (
            <Flex
              key={section.memo_format_section_id}
              mih={section.memo_format_section_name === "body" ? "100%" : 60}
              mt={`${section.memo_format_section_margin_top}px`}
              mr={`${section.memo_format_section_margin_right}px`}
              mb={`${section.memo_format_section_margin_bottom}px`}
              ml={`${section.memo_format_section_margin_left}px`}
              sx={{
                border: `1px solid ${getSectionColor(
                  `${section.memo_format_section_name}`
                )}`,
                flex: section.memo_format_section_name === "body" ? 1 : 0,
              }}
              justify="space-between"
              align="center"
            >
              {renderSubsection}
            </Flex>
          );
        }
      );

      const resolvedFormatData = await Promise.all(
        formatDataWithImageAttachment
      );
      setSectionList(resolvedFormatData);
    };
    renderFormatData();
  }, [formatSection]);

  return (
    <Paper maw={600} h={900} withBorder>
      <Flex w="100%" mih="100%" direction="column">
        {sectionList}
      </Flex>
    </Paper>
  );
};

export default MemoFormatPreview;
