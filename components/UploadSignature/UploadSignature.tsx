import { UserWithSignatureType } from "@/utils/types";
import {
  Box,
  Button,
  Container,
  Divider,
  FileButton,
  Flex,
  Group,
  Image,
  LoadingOverlay,
  Paper,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import {
  default as ReactSignatureCanvas,
  default as SignatureCanvas,
} from "react-signature-canvas";
import SignatureCrop from "./SignatureCrop";

type Props = {
  onUploadSignature: (signature: File | null) => void;
  user: UserWithSignatureType;
  isUpdatingSignature: boolean;
  openCanvas: boolean;
  setOpenCanvas: Dispatch<SetStateAction<boolean>>;
  signatureFile: File | null;
  setSignatureFile: Dispatch<SetStateAction<File | null>>;
  signatureUrl: string;
};

const UploadSignature = ({
  onUploadSignature,
  user,
  isUpdatingSignature,
  openCanvas,
  setOpenCanvas,
  signatureFile,
  setSignatureFile,
  signatureUrl,
}: Props) => {
  const sigCanvas = useRef<ReactSignatureCanvas>(null);
  const [openCrop, setOpenCrop] = useState(false);

  const handleOnEndDrawSignature = async () => {
    const canvas = sigCanvas.current?.getTrimmedCanvas();
    const dataURL = canvas?.toDataURL("image/png");
    const blob = await fetch(dataURL || "").then((r) => r.blob());

    const file = new File(
      [blob],
      `${user.user_username}-${Date.now()}-signature.png`,
      {
        type: "image/png",
      }
    );

    if (!file) throw new Error();
    setSignatureFile(file);
  };

  const checkFile = (signatureFile: File | null) => {
    if (signatureFile === null) return;

    // File size must be under 5MB
    if (signatureFile.size > 1000000 * 5) {
      notifications.show({
        message: "File size must be under 5MB for upload. Please try again.",
        color: "orange",
      });
      return;
    }
    setSignatureFile(signatureFile);
    setOpenCrop(true);
  };

  return (
    <Container p={0} mt="xl" pos="relative" fluid>
      <LoadingOverlay
        visible={isUpdatingSignature}
        overlayBlur={2}
        transitionDuration={500}
      />
      <Paper p="lg" shadow="xs">
        <Text weight={600}>Signature</Text>
        <Divider mt={4} />

        <Flex mt={16} gap={16} align="center" direction="column" mih={100}>
          {openCanvas && (
            <>
              <Paper radius="md" withBorder h={166.67} w={250}>
                <SignatureCanvas
                  canvasProps={{
                    width: 250,
                    height: 166.67,
                  }}
                  ref={sigCanvas}
                  data-testid="sigCanvas"
                  onEnd={handleOnEndDrawSignature}
                />
                <Flex justify="flex-start"></Flex>
              </Paper>

              <Flex justify="space-between" gap="xs">
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => sigCanvas.current?.clear()}
                >
                  Clear
                </Button>
                <Flex justify="flex-end" gap="xs">
                  <Button
                    size="xs"
                    onClick={() => {
                      onUploadSignature(signatureFile as File);
                    }}
                  >
                    Done
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setOpenCanvas(false)}
                  >
                    Cancel
                  </Button>
                </Flex>
              </Flex>
            </>
          )}

          {openCrop && signatureFile && (
            <Flex direction="column" justify="space-between" w={250} mih={275}>
              <Group pos="absolute" h={166.67} w={250} mb="lg">
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 166.67,
                  }}
                >
                  <SignatureCrop
                    file={signatureFile}
                    setFile={setSignatureFile}
                    onSaveChanges={onUploadSignature}
                    onClose={() => setOpenCrop(false)}
                  />
                </div>
              </Group>
            </Flex>
          )}

          {!openCanvas && !openCrop && (
            <>
              <Image
                width={250}
                height={166.67}
                radius="md"
                src={signatureUrl}
                alt="User signature"
                fit="contain"
                withPlaceholder
                placeholder={
                  <Box>
                    <Text>No signature</Text>
                  </Box>
                }
              />
              <Flex gap={12} justify="flex-start">
                <FileButton onChange={checkFile} accept="image/png,image/jpeg">
                  {(props) => (
                    <Button size="xs" {...props}>
                      Upload
                    </Button>
                  )}
                </FileButton>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setOpenCanvas(true)}
                >
                  Draw
                </Button>
              </Flex>
            </>
          )}
        </Flex>
      </Paper>
    </Container>
  );
};

export default UploadSignature;
