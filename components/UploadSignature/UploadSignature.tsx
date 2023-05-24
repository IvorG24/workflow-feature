import { UserWithSignatureType } from "@/utils/types";
import {
  Box,
  Button,
  Center,
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
import { useRef, useState } from "react";
import {
  default as ReactSignatureCanvas,
  default as SignatureCanvas,
} from "react-signature-canvas";

type Props = {
  onUploadSignature: (signature: File) => void;
  user: UserWithSignatureType;
  isUpdatingSignature: boolean;
};

const UploadSignature = ({
  onUploadSignature,
  user,
  isUpdatingSignature,
}: Props) => {
  const signatureFilepath = user?.user_signature_attachment?.attachment_value;
  const [openCanvas, setOpenCanvas] = useState(false);
  const sigCanvas = useRef<ReactSignatureCanvas>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

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

        <Flex mt={16} gap={16} align="center" direction="column">
          {!openCanvas ? (
            <>
              <Image
                width={200}
                height={200}
                radius="md"
                // todo: change into user signature path
                src={signatureFilepath ? signatureFilepath : null}
                alt="User signature"
                fit="contain"
                withPlaceholder
                placeholder={
                  <Box>
                    <Text>No signature</Text>
                  </Box>
                }
              />
              <Group spacing={12} position="center">
                <FileButton
                  onChange={onUploadSignature}
                  accept="image/png,image/jpeg"
                >
                  {(props) => (
                    <Button size="xs" w={80} {...props}>
                      Upload
                    </Button>
                  )}
                </FileButton>
                <Button
                  size="xs"
                  variant="outline"
                  w={80}
                  onClick={() => setOpenCanvas(true)}
                >
                  Draw
                </Button>
              </Group>
            </>
          ) : (
            <>
              <Paper radius="md" withBorder h={200}>
                <SignatureCanvas
                  canvasProps={{
                    width: 200,
                    height: 156,
                  }}
                  ref={sigCanvas}
                  data-testid="sigCanvas"
                  onEnd={handleOnEndDrawSignature}
                />
                <Center>
                  <Button
                    w={80}
                    size="xs"
                    variant="light"
                    onClick={() => sigCanvas.current?.clear()}
                  >
                    Clear
                  </Button>
                </Center>
              </Paper>

              <Flex gap={12} justify="center">
                <Button
                  size="xs"
                  onClick={() => {
                    onUploadSignature(signatureFile as File);
                    setOpenCanvas(false);
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
            </>
          )}
        </Flex>
      </Paper>
    </Container>
  );
};

export default UploadSignature;
