import {
  Button,
  Center,
  Container,
  FileButton,
  Flex,
  Image,
  Paper,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { MouseEventHandler, useEffect, useState } from "react";
import { Close, Edit, PhotoCamera } from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";
import styles from "./AddSignature.module.scss";

type Props = {
  onCancel: MouseEventHandler<HTMLButtonElement>;
};

type Choice = "upload" | "draw" | undefined;

const AddSignature = ({ onCancel }: Props) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [choice, setChoice] = useState<Choice>(undefined);

  useEffect(() => {
    if (uploadFile) {
      fileBrowseHandler(uploadFile);
      setChoice("upload");
    }
  }, [uploadFile]);

  const fileBrowseHandler = (file: File) => {
    const imagePath = URL.createObjectURL(file);
    setImageUrl(imagePath);
  };
  return (
    <Container fluid>
      <Title order={2} align="center">
        Add Signature
      </Title>
      {!choice && (
        <Flex justify="space-evenly" align="center" gap="sm" mt="xl">
          <UnstyledButton onClick={() => setChoice("draw")}>
            <Paper withBorder shadow="md" p="xl" miw={180} radius="lg">
              <Center>
                <IconWrapper fontSize={60} color="dimmed">
                  <Edit />
                </IconWrapper>
              </Center>
              <Text weight="bold" align="center" mt="xs">
                Draw Signature
              </Text>
            </Paper>
          </UnstyledButton>

          <FileButton onChange={setUploadFile} accept="image/png,image/jpeg">
            {(props) => (
              <UnstyledButton {...props}>
                <Paper withBorder shadow="md" p="xl" miw={180} radius="lg">
                  <Center>
                    <IconWrapper fontSize={60} color="dimmed">
                      {/* todo: Change PhotoCamera icon into UploadImage icon */}
                      <PhotoCamera />
                    </IconWrapper>
                  </Center>
                  <Text weight="bold" align="center" mt="xs">
                    Upload Image
                  </Text>
                </Paper>
              </UnstyledButton>
            )}
          </FileButton>
        </Flex>
      )}
      {choice === "draw" && <Paper> Draw Signature content here</Paper>}
      {choice === "upload" && (
        <Paper
          shadow="xs"
          miw={180}
          mih={100}
          radius="lg"
          mt="xl"
          className={styles.container}
        >
          <Button
            variant="subtle"
            p="xs"
            className={styles.delete}
            onClick={() => setChoice(undefined)}
          >
            {/* todo: Change close icon into delete icon */}
            <Close />
          </Button>
          <Image radius="md" src={imageUrl} alt="Random unsplash image" />
        </Paper>
      )}
      <Flex justify="flex-end" gap="xl" mt="xl">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button>Save</Button>
      </Flex>
    </Container>
  );
};

export default AddSignature;
