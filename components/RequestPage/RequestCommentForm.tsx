import { shortenFileName } from "@/utils/styling";
import {
  ActionIcon,
  Avatar,
  Button,
  ButtonProps,
  Card,
  FileButton,
  Flex,
  Group,
  Stack,
  Text,
  Textarea,
  TextareaProps,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useFormContext } from "react-hook-form";

export type CommentFormProps = {
  comment: string;
};

type RequestCommentFormProps = {
  onSubmit: (data: CommentFormProps) => void;
  addCancelButton?: {
    onClickHandler: MouseEventHandler<HTMLButtonElement>;
  };
  textAreaProps?: TextareaProps;
  submitButtonProps?: ButtonProps;
  isSubmittingForm?: boolean;
  isEditing?: boolean;
  setCommentAttachment?: Dispatch<SetStateAction<File[]>>;
  commentAttachment?: File[];
};

const RequestCommentForm = ({
  onSubmit,
  textAreaProps,
  submitButtonProps,
  addCancelButton,
  setCommentAttachment,
  commentAttachment,
  isSubmittingForm,
  isEditing,
}: RequestCommentFormProps) => {
  const maxFileSize = 5242880;
  const [isAttachmentOverSize, setIsAttachmentOverSize] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useFormContext<CommentFormProps>();

  const handleFileChange = (attachmentList: File[]) => {
    if (setCommentAttachment) {
      const updatedAttachmentList = [
        ...attachmentList,
        ...(commentAttachment as File[]),
      ];
      setCommentAttachment(updatedAttachmentList);
    }
  };

  const handleRemoveAttachment = (attachmentName: string) => {
    if (setCommentAttachment) {
      const prevCommentAttachment = commentAttachment || [];
      const updatedAttachmentList = prevCommentAttachment.filter(
        (attachment) => attachment.name !== attachmentName
      );

      setCommentAttachment(updatedAttachmentList);
    }
  };

  const renderAttachments = () =>
    commentAttachment &&
    commentAttachment.length > 0 && (
      <Stack spacing="xs">
        <Text size="sm" mt="sm">
          Selected attachments:
        </Text>

        {commentAttachment.map((attachment, index) => {
          const isOverSize = attachment.size > maxFileSize;
          return (
            <Card key={index} withBorder bg={isOverSize ? "red.3" : "white"}>
              <Flex align="center" gap="sm">
                <Group sx={{ flex: 1 }}>
                  <Avatar
                    color={attachment.type.includes("image") ? "cyan" : "red"}
                  >
                    {attachment.type.includes("image") ? "IMG" : "PDF"}
                  </Avatar>
                  <Text>{shortenFileName(attachment.name, 60)}</Text>
                  <Text size="xs" c="dimmed">
                    {bytesToHumanReadable(attachment.size)}
                  </Text>
                </Group>
                <ActionIcon
                  color="red"
                  onClick={() => handleRemoveAttachment(attachment.name)}
                >
                  <IconX />
                </ActionIcon>
              </Flex>
            </Card>
          );
        })}
      </Stack>
    );

  useEffect(() => {
    const currentCommentAttachment = commentAttachment || [];

    const isOverSize = currentCommentAttachment.some(
      (file) => file.size > maxFileSize
    );
    if (isOverSize) {
      setError("root", {
        type: "custom",
        message:
          "One of your attachments exceeds the size limit. Please review and ensure that each attachment is under 5 MB.",
      });
      setIsAttachmentOverSize(true);
    } else {
      clearErrors();
      setIsAttachmentOverSize(false);
    }
  }, [commentAttachment, clearErrors, setError]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ position: "relative" }}>
      <Textarea
        error={errors.comment?.message}
        {...register("comment", {
          required: "Comment must not be empty.",
        })}
        {...textAreaProps}
      />

      {errors.root && errors.root.type === "custom" && (
        <Text size={14} mt="sm" color="red">
          {errors.root.message}
        </Text>
      )}

      {renderAttachments()}

      <Group mt="sm" position="right">
        {!isEditing && (
          <FileButton
            onChange={handleFileChange}
            accept="image/png, image/gif, image/jpeg, image/svg+xml, image/webp, image/avif, application/pdf"
            multiple
          >
            {(props) => (
              <Button variant="default" {...props} disabled={isSubmittingForm}>
                Add attachment
              </Button>
            )}
          </FileButton>
        )}

        {addCancelButton && (
          <Button
            type="button"
            variant="default"
            onClick={addCancelButton.onClickHandler}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          {...submitButtonProps}
          disabled={isAttachmentOverSize}
        />
      </Group>
    </form>
  );
};

export default RequestCommentForm;

function bytesToHumanReadable(bytes: number) {
  const mb = bytes / (1024 * 1024); // 1 MB = 1024 * 1024 bytes

  if (mb >= 1) {
    return mb.toFixed(2) + " MB";
  } else {
    const kb = bytes / 1024; // 1 KB = 1024 bytes
    return kb.toFixed(2) + " KB";
  }
}
