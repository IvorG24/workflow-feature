import {
  ActionIcon,
  Avatar,
  Container,
  createStyles,
  FileButton,
  Flex,
  Text,
} from "@mantine/core";
import { IconPhoto, IconUpload } from "@tabler/icons-react";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: File | null;
  onChange: (payload: File | null) => void;
  onError: (error: string) => void;
  size?: number;
  src?: string | null;
  disabled?: boolean;
  initials?: string;
  fieldError?: string;
};

const useStyles = createStyles((theme) => ({
  avatarWrapper: {
    position: "relative",
    display: "inline-flex",
  },
  avatar: {
    borderRadius: "16px",
    border: `2px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[1]
    }`,
    "&:hover": {
      cursor: "pointer",
    },
  },
  fileButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    height: 24,
    width: 24,
    padding: 6,
    color: "#ffffff",
    border: "none",
  },
}));

const UploadId = ({
  value,
  onChange,
  onError,
  size = 128,
  src = "",
  disabled = false,
  fieldError = "",
}: Props) => {
  const { classes } = useStyles();
  const [error, setError] = useState("");
  const resetRef = useRef<() => void>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 1024 * 1024 * 10) {
      const message = "File size is too large";
      onError(message);
      setError(message);
    } else {
      setError("");
      onChange(file);
    }
  };

  useEffect(() => {
    if (fieldError) {
      setError(fieldError);
    }
  }, [fieldError]);

  return (
    <Flex direction="column" w={size}>
      <Container m={0} p={0} className={classes.avatarWrapper}>
        <Avatar
          src={value ? URL.createObjectURL(value) : src}
          alt="avatar"
          size={size}
          className={classes.avatar}
          onClick={() => buttonRef.current?.click()}
        >
          <IconPhoto color="gray" size={size / 2} />
        </Avatar>

        <FileButton
          accept="image/png,image/jpeg"
          aria-label="Upload Id File"
          onChange={fileChange}
          resetRef={resetRef}
          name="uploadId"
          multiple={false}
          disabled={disabled}
        >
          {(props) => (
            <ActionIcon
              size="md"
              variant="filled"
              color="blue"
              radius={100}
              className={classes.fileButton}
              {...props}
              sx={{ fontSize: `${size / 4}px}` }}
              ref={buttonRef}
            >
              <IconUpload />
            </ActionIcon>
          )}
        </FileButton>
      </Container>
      {error && (
        <Text
          role="alert"
          color="red"
          align="center"
          size={12}
          mt="xs"
          maw={size}
        >
          {error}
        </Text>
      )}
    </Flex>
  );
};

export default UploadId;
