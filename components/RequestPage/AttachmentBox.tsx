import {
  Badge,
  createStyles,
  Grid,
  Paper,
  Text,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";

const useStyles = createStyles((theme) => ({
  // style on hover on the paper, slightly change the background color
  paper: {
    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.1)
          : theme.colors[theme.primaryColor][0],
    },
    cursor: "pointer",
  },
}));

export type AttachmentBoxProps = {
  filename: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  // file: File | string;
};

const AttachmentBox = ({
  filename,
  fileUrl,
  fileType,
  fileSize,
}: // file,
AttachmentBoxProps) => {
  const { classes } = useStyles();

  // * Archived
  // const handleDownloadFile = async (fileUrl: string) => {
  //   try {
  //     const response = await axios.get(fileUrl, {
  //       responseType: "blob",
  //     });

  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "image.jpg");
  //     document.body.appendChild(link);
  //     link.click();
  //   } catch (error) {
  //     console.error(`Failed to download file: ${error}`);
  //     showNotification({
  //
  //       message: "Failed to download file",
  //       color: "red",
  //     });
  //   }
  // };

  return (
    <Paper
      withBorder
      radius="xs"
      p="xs"
      maw={180}
      miw={180}
      mah={120}
      mih={120}
      // style onhover to slightly update shadow
      className={classes.paper}
    >
      <UnstyledButton
        component="a"
        href={fileUrl}
        target="_blank"
        aria-label={filename}
      >
        <Grid columns={6}>
          <Grid.Col span={2}>
            <Badge
              variant="filled"
              color="blue"
              p={1}
              radius="xs"
              miw={30}
              maw={55}
            >
              {fileType}
            </Badge>
          </Grid.Col>
          <Grid.Col span={4} mih={70}>
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
          <Grid.Col span={2}></Grid.Col>
          <Grid.Col span={4}>
            {/* //* Archived */}
            {/* <Group noWrap position="right">
              <ActionIcon
                component="a"
                size="sm"
                variant="filled"
                onClick={() => {
                  handleDownloadFile(fileUrl);
                }}
              >
                <IconDownload />
              </ActionIcon>
            </Group> */}
          </Grid.Col>
        </Grid>
      </UnstyledButton>
    </Paper>
  );
};

export default AttachmentBox;
