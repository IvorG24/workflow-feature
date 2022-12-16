import {
  ActionIcon,
  Badge,
  Grid,
  Paper,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { Download } from "../Icon";

type Props = {
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  file: Blob;
};

const AttachmentBox = ({
  filename,
  fileUrl,
  fileType,
  fileSize,
  file,
}: Props) => {
  const handDownloadFile = () => {
    console.log(file);
    alert("Download file triggered");
  };
  return (
    <UnstyledButton component="a" href={fileUrl} aria-label={filename}>
      <Paper
        withBorder
        radius="xs"
        p="xs"
        maw={180}
        miw={180}
        mah={120}
        mih={120}
      >
        <Grid columns={4}>
          <Grid.Col span={1}>
            <Badge variant="filled" color="blue" p={1} radius="xs" miw={30}>
              {fileType}
            </Badge>
          </Grid.Col>
          <Grid.Col span={3} mih={70}>
            <Tooltip
              label={filename}
              openDelay={1500}
              position="bottom"
              color="dark.4"
            >
              <Text weight="bold" size="xs" lineClamp={2}>
                {filename}
              </Text>
            </Tooltip>

            <Text size="xs">{fileSize}</Text>
          </Grid.Col>
          <Grid.Col span={1}></Grid.Col>
          <Grid.Col span={3}>
            <ActionIcon
              variant="filled"
              onClick={(e) => {
                e.preventDefault();
                handDownloadFile();
              }}
            >
              <Download />
            </ActionIcon>
          </Grid.Col>
        </Grid>
      </Paper>
    </UnstyledButton>
  );
};

export default AttachmentBox;
