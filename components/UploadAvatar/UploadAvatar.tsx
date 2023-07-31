import { getAvatarColor } from "@/utils/styling";
import {
  ActionIcon,
  Avatar,
  Container,
  createStyles,
  FileButton,
  Flex,
  Text,
} from "@mantine/core";
import { IconUpload, IconUser } from "@tabler/icons-react";
import { upperCase } from "lodash";

import { useRef, useState } from "react";

type Props = {
  value: File | null;
  onChange: (payload: File | null) => void;
  onError: (error: string) => void;
  size?: number;
  src?: string | null;
  disabled?: boolean;
  initials?: string;
  id?: string;
};

const useStyles = createStyles((theme) => ({
  avatarWrapper: {
    position: "relative",
    display: "inline-flex",
  },
  avatar: {
    borderRadius: "100%",
    border: `2px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[1]
    }`,
    "&:hover": {
      cursor: "pointer",
    },
  },
  fileButton: {
    border: `2px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[0]
    }`,
    position: "absolute",
    bottom: 0,
    right: "0.5em",
    height: "1em",
    width: "1em",
    padding: "0.15em",
  },
}));

const UploadAvatar = ({
  value,
  onChange,
  onError,
  size = 128,
  src = "",
  disabled = false,
  initials = "",
  id = "",
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

  return (
    <Flex direction="column" w={size}>
      <Container m={0} p={0} className={classes.avatarWrapper}>
        <Avatar
          src={value ? URL.createObjectURL(value) : src}
          alt="avatar"
          size={size}
          className={classes.avatar}
          onClick={() => buttonRef.current?.click()}
          color={id ? getAvatarColor(Number(`${id.charCodeAt(0)}`)) : "gray"}
        >
          {initials ? (
            upperCase(initials)
          ) : (
            <IconUser color="gray" size={size / 2} />
          )}
        </Avatar>

        <FileButton
          accept="image/png,image/jpeg"
          aria-label="Upload Avatar"
          onChange={fileChange}
          resetRef={resetRef}
          name="uploadAvatar"
          multiple={false}
          disabled={disabled}
        >
          {(props) => (
            <ActionIcon
              variant="default"
              color="blue"
              radius={100}
              bg={"gray"}
              className={classes.fileButton}
              {...props}
              sx={() => ({
                fontSize: `${size / 4}px}`,
              })}
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

export default UploadAvatar;
