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
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  default as ReactSignatureCanvas,
  default as SignatureCanvas,
} from "react-signature-canvas";
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
  const sigCanvas = useRef<ReactSignatureCanvas>(null);
  const router = useRouter();

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
  const handleConvertCanvasAndUploadSignature = async () => {
    try {
      // disable saving of signature if user hasn't drawn a signature
      if (sigCanvas.current?.isEmpty()) {
        showNotification({
          title: "Error!",
          message: "No signature provided.",
          color: "red",
        });
        return;
      }
      setIsUploading(true);

      // Convert canvas to image.

      const canvas = sigCanvas.current?.getCanvas();
      const dataURL = canvas?.toDataURL("image/png");
      const blob = await fetch(dataURL || "").then((r) => r.blob());
      const file = new File([blob], `${user?.id}-signature.png`, {
        type: "image/png",
      });

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
        const imageUrl = URL.createObjectURL(file);
        setCurrentSignatureUrl(imageUrl || "");
        showNotification({
          title: "Success!",
          message: "Signature updated.",
          color: "green",
        });
        router.reload();
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
      {choice === "draw" && (
        <div className={styles.canvasContainer}>
          <SignatureCanvas
            canvasProps={{
              className: styles.sigCanvas,
            }}
            ref={sigCanvas}
            data-testid="sigCanvas"
          />
        </div>
      )}
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
        {choice === "draw" && (
          <Button
            disabled={isUploading}
            onClick={() => sigCanvas.current?.clear()}
            variant="outline"
          >
            Clear
          </Button>
        )}
        <Button disabled={isUploading} onClick={onCancel} variant="outline">
          Cancel
        </Button>

        {choice === "draw" && (
          <Button
            disabled={isUploading}
            onClick={handleConvertCanvasAndUploadSignature}
          >
            Save
          </Button>
        )}
        {choice === "upload" && (
          <Button disabled={isUploading} onClick={handleUploadSignature}>
            Save
          </Button>
        )}
      </Flex>
    </Container>
  );
};

export default AddSignature;
