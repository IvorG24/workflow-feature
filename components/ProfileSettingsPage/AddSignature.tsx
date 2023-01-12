import { Database } from "@/utils/database.types-new";
import { uploadFile } from "@/utils/file";
import { updateUserProfile } from "@/utils/queries-new";
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
import { showNotification } from "@mantine/notifications";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Close, Edit, PhotoCamera } from "../Icon";
import IconWrapper from "../IconWrapper/IconWrapper";
import styles from "./AddSignature.module.scss";

type Props = {
  onCancel: () => void;
  setCurrentSignatureUrl: (url: string) => void;
};

type Choice = "upload" | "draw" | undefined;

const AddSignature = ({ onCancel, setCurrentSignatureUrl }: Props) => {
  const supabaseClient = useSupabaseClient<Database>();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [choice, setChoice] = useState<Choice>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const user = useUser();

  useEffect(() => {
    if (file) {
      fileBrowseHandler(file);
      setChoice("upload");
    }
  }, [file]);

  const fileBrowseHandler = (file: File) => {
    const imagePath = URL.createObjectURL(file);
    setImageUrl(imagePath);
  };
  const handleUploadSignature = async () => {
    try {
      setIsUploading(true);
      let filepath;
      if (file) {
        const { path } = await uploadFile(
          supabaseClient,
          file.name,
          file,
          "signatures"
        );
        filepath = path;

        // Save uploaded signature to user profile.
        await updateUserProfile(supabaseClient, {
          user_id: user?.id,
          user_signature_filepath: filepath,
        });
        setCurrentSignatureUrl(imageUrl || "");
        showNotification({
          title: "Success!",
          message: "Signature updated.",
          color: "green",
        });
        onCancel();
      } else {
        showNotification({
          title: "Error!",
          message: "No signature file selected.",
          color: "red",
        });
        return;
      }
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error!",
        message: "Upload signature failed.",
        color: "red",
      });
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <Container fluid>
      <Title order={2} align="center">
        Add Signature
      </Title>
      {!choice && (
        <Flex
          justify="space-evenly"
          align="center"
          gap="sm"
          mt="xl"
          wrap={{
            base: "wrap",
            xs: "nowrap",
            sm: "nowrap",
            md: "nowrap",
            lg: "nowrap",
            xl: "nowrap",
          }}
        >
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

          <FileButton onChange={setFile} accept="image/png,image/jpeg">
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
      <Flex justify="center" gap="xl" mt="xl">
        <Button disabled={isUploading} onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button disabled={isUploading} onClick={handleUploadSignature}>
          Save
        </Button>
      </Flex>
    </Container>
  );
};

export default AddSignature;
