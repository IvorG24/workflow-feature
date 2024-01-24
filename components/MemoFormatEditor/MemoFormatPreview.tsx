import { getBase64 } from "@/utils/functions";
import { Box, Flex, Image, Paper, createStyles } from "@mantine/core";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
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

const getSubsectionJustify = (subsection: string) => {
  switch (subsection) {
    case "left":
      return "flex-start";
    case "center":
      return "center";
    case "right":
      return "flex-end";

    default:
      return "#339AF0";
  }
};

const useStyles = createStyles(() => ({
  markdown: {
    "*": {
      margin: 0,
    },
  },
}));

const MemoFormatPreview = ({ formatData }: Props) => {
  const { classes } = useStyles();
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

                  if (imageAttachmentSource) {
                    return (
                      <Image
                        key={attachment.memo_format_attachment_id}
                        src={imageAttachmentSource}
                        alt="Section Image"
                        withPlaceholder
                        width={90}
                        height={30}
                        fit="contain"
                      />
                    );
                  }
                })
              );

              return (
                <Flex
                  key={subsection.memo_format_subsection_id}
                  gap="sm"
                  wrap="wrap"
                  sx={{ flex: 1 }}
                  justify={getSubsectionJustify(
                    `${subsection.memo_format_subsection_name}`
                  )}
                >
                  {subsection.memo_format_subsection_text && (
                    <Box
                      sx={{
                        wordBreak: "break-word",
                        fontSize:
                          `${subsection.memo_format_subsection_text_font_size}px` ??
                          "16px",
                      }}
                    >
                      <Markdown className={classes.markdown}>
                        {subsection.memo_format_subsection_text}
                      </Markdown>
                    </Box>
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
              mih={section.memo_format_section_name === "body" ? "100%" : 30}
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
