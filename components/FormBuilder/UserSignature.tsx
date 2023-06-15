import {
  Box,
  Button,
  Checkbox,
  Container,
  ContainerProps,
  FileButton,
  Group,
  Image,
  Paper,
  Text,
  Tooltip,
  createStyles,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle } from "@tabler/icons-react";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import ReactSignatureCanvas from "react-signature-canvas";
import { FormBuilderData } from "./FormBuilder";
import { Mode } from "./SignerSection";

type UseStylesProps = {
  mode: Mode;
};

const useStyles = createStyles((theme, { mode }: UseStylesProps) => ({
  container: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? mode === "edit"
          ? theme.colors.dark[6]
          : theme.colors.dark[7]
        : "#fff",
    borderRadius: 4,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]
    }
    `,
    paddingInline: "32px",
    paddingTop: "16px",
    paddingBottom: "32px",
  },
  checkboxCursor: {
    input: {
      cursor: "pointer",
    },
  },
}));

type Props = {
  mode?: Mode;
  username?: string;
  signatureUrl?: string;
  newUserSignatureFile?: File | null;
  setNewUserSignatureFile?: Dispatch<SetStateAction<File | null>>;
} & ContainerProps;

const UserSignature = ({
  mode = "edit",
  signatureUrl,
  username,
  setNewUserSignatureFile,
  ...props
}: Props) => {
  const { classes } = useStyles({ mode });
  const { register, getValues } = useFormContext<FormBuilderData>();

  const isSignatureRequired = getValues("isSignatureRequired");

  const [isDrawing, setIsDrawing] = useState(false);
  const sigCanvas = useRef<ReactSignatureCanvas>(null);
  const [signatureUrlState, setSignatureUrlState] = useState(signatureUrl);

  const handleChangeSignatureFile = (signatureFile: File) => {
    if (!setNewUserSignatureFile) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      return;
    }
    setNewUserSignatureFile(signatureFile);
    setSignatureUrlState(
      signatureFile ? URL.createObjectURL(signatureFile) : ""
    );
  };

  const handleOnEndDrawSignature = async () => {
    try {
      if (!setNewUserSignatureFile) {
        notifications.show({
          message: "Something went wrong. Please try again later.",
          color: "red",
        });
        return;
      }
      if (sigCanvas.current?.isEmpty()) {
        notifications.show({
          message: "Please draw a signature.",
          color: "red",
        });
        return;
      }

      // Reference: https://github.com/agilgur5/react-signature-canvas
      // Creates a copy of the canvas and returns a trimmed version of it, with all whitespace removed.
      const canvas = sigCanvas.current?.getTrimmedCanvas();
      const dataURL = canvas?.toDataURL("image/png");
      const blob = await fetch(dataURL || "").then((r) => r.blob());

      const file = new File([blob], `${username}-signature.png`, {
        type: "image/png",
      });

      if (!file) throw new Error();

      setNewUserSignatureFile(file);
    } catch (error) {
      console.error(error);
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
    }
  };

  const handleOnClickDraw = () => {
    if (!setNewUserSignatureFile) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      return;
    }
    setIsDrawing(true);
    setNewUserSignatureFile(null);
    setSignatureUrlState("");
  };

  const handleCancelDrawing = () => {
    if (!setNewUserSignatureFile) {
      notifications.show({
        message: "Something went wrong. Please try again later.",
        color: "red",
      });
      return;
    }
    setIsDrawing(false);
    setNewUserSignatureFile(null);
  };

  if (mode === "edit")
    return (
      <Container maw={768} className={classes.container} {...props}>
        <Text weight={600} size={18}>
          User Signature
        </Text>

        <Checkbox
          label="Require requester and signer's signature during request creation and approval"
          {...register("isSignatureRequired")}
          mt={32}
          className={classes.checkboxCursor}
          sx={{ input: { cursor: "pointer" } }}
        />
      </Container>
    );

  const signatureDescription = signatureUrl
    ? " Will be using your default signature. Your default signature will be replaced when you upload or draw a new signature below or from your profile."
    : "You have not uploaded a signature yet. Please provide your signature below. Your signature will be used as your default signature.";

  if (isSignatureRequired)
    return (
      <Container maw={768} className={classes.container} {...props}>
        <Group>
          <Text weight={600} size={18}>
            {mode === "view" ? "Signer" : "Requester"}&apos;s signature
          </Text>
          <Tooltip label={signatureDescription} withArrow multiline>
            <Box>
              <IconInfoCircle height={16} color="#495057" />
            </Box>
          </Tooltip>
        </Group>

        {!isDrawing && (
          <>
            <Image
              height={200}
              fit="contain"
              radius="md"
              src={signatureUrlState || signatureUrl}
              alt="No signature"
              withPlaceholder
              placeholder={<Text align="center">No signature</Text>}
              mt="md"
            />
            {setNewUserSignatureFile && (
              <>
                <Text size="xs" fw="lighter" mt={4}>
                  Upload or draw your signature. This will replace your default
                  signature.
                </Text>
                <Group data-cy="user-signature-container" mt="md">
                  <FileButton
                    onChange={handleChangeSignatureFile}
                    data-cy="user-signature-input-file"
                    accept="image/png,image/jpeg"
                  >
                    {(props) => (
                      <Button variant="outline" w={100} {...props}>
                        Upload
                      </Button>
                    )}
                  </FileButton>

                  <Button w={100} onClick={handleOnClickDraw}>
                    Draw
                  </Button>
                </Group>
              </>
            )}
          </>
        )}
        {isDrawing && setNewUserSignatureFile && (
          <>
            <Paper radius="md" withBorder h={200} mt="md">
              <ReactSignatureCanvas
                canvasProps={{
                  height: 200,
                  width: 300,
                }}
                ref={sigCanvas}
                data-testid="sigCanvas"
                onEnd={handleOnEndDrawSignature}
              />
            </Paper>
            <Text size="xs" fw="lighter" mt={4}>
              Draw on canvas
            </Text>
            <Group mt="md">
              <Button
                w={100}
                variant="outline"
                onClick={() => sigCanvas.current?.clear()}
              >
                Clear
              </Button>
              <Button w={100} onClick={handleCancelDrawing}>
                Cancel
              </Button>
            </Group>
          </>
        )}
      </Container>
    );

  return <></>;
};

export default UserSignature;
