import { Group, Text, useMantineTheme } from "@mantine/core";
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons";
import { Dispatch, SetStateAction } from "react";
import { FileRejection } from "react-dropzone";

export type RequestDropzoneProps = {
  onDrop: (files: FileWithPath[]) => void;
  onReject: (fileRejections: FileRejection[]) => void;
  attachment: File | null;
  setAttachment: Dispatch<SetStateAction<File | null>>;
};

export function RequestDropzone(props: RequestDropzoneProps) {
  const theme = useMantineTheme();
  return (
    <Dropzone
      // onDrop={(files) => console.log("accepted files", files)}
      // onReject={(files) => console.log("rejected files", files)}
      {...props}
      onDrop={props.onDrop}
      onReject={props.onReject}
      maxSize={5 * 1024 ** 2}
      accept={IMAGE_MIME_TYPE}
      multiple={false}
      maxFiles={1}
    >
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: 220, pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            size={50}
            stroke={1.5}
            color={
              theme.colors[theme.primaryColor][
                theme.colorScheme === "dark" ? 4 : 6
              ]
            }
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            size={50}
            stroke={1.5}
            color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconPhoto size={50} stroke={1.5} />
        </Dropzone.Idle>

        {!props.attachment && (
          <div>
            <Text size="xl" inline>
              Drag or click to select image file.
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              Image file should should not 5mb.
            </Text>
          </div>
        )}

        {props.attachment && (
          <div>
            <Text size="xl" color="dimmed" inline mt={7}>
              {props.attachment.name}
            </Text>
            <Text size="sm" inline>
              Drag or click to replace image file.
            </Text>
          </div>
        )}
      </Group>
    </Dropzone>
  );
}
