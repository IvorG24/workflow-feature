import {
  Badge,
  Flex,
  Paper,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";

type Props = {
  filename: string;
  fileUrl: string;
  fileType: string;
};

const AttachmentPill = ({ filename, fileUrl, fileType }: Props) => {
  return (
    <UnstyledButton
      component="a"
      href={fileUrl}
      target="_blank"
      aria-label={filename}
    >
      <Tooltip
        label={filename}
        openDelay={1500}
        position="bottom"
        color="dark.4"
      >
        <Paper withBorder radius="xl" py={4} px="xs" maw={180}>
          <Flex align="center" gap={5}>
            <Badge variant="filled" color="blue" p={1} radius="xs" miw={30}>
              {fileType}
            </Badge>
            <Text lineClamp={1}>{filename}</Text>
          </Flex>
        </Paper>
      </Tooltip>
    </UnstyledButton>
  );
};

export default AttachmentPill;
