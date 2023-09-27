import {
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
import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";

export type CommentFormProps = {
  comment: string;
  attachment: File[];
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<CommentFormProps>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ position: "relative" }}>
      <Textarea
        error={errors.comment?.message}
        {...register("comment", {
          required: "Comment must not be empty.",
        })}
        {...textAreaProps}
      />

      {commentAttachment && commentAttachment.length > 0 && (
        <Stack spacing="xs">
          <Text size="sm" mt="sm">
            Selected attachments:
          </Text>

          {commentAttachment.map((attachment, index) => (
            <Card key={index} withBorder>
              <Flex gap="sm">
                <Avatar
                  color={attachment.type.includes("image") ? "cyan" : "red"}
                >
                  {attachment.type.includes("image") ? "IMG" : "PDF"}
                </Avatar>
                <Text>{attachment.name}</Text>
              </Flex>
            </Card>
          ))}
        </Stack>
      )}

      <Group mt="sm" position="right">
        {!isEditing && (
          <FileButton
            onChange={setCommentAttachment as Dispatch<SetStateAction<File[]>>}
            accept="image/png,
          image/gif,
          image/jpeg,
          image/svg+xml,
          image/webp,
          image/avif,
          application/pdf"
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
        <Button type="submit" {...submitButtonProps} />
      </Group>
    </form>
  );
};

export default RequestCommentForm;
