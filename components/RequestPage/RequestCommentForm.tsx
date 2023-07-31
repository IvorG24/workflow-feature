import {
  Button,
  ButtonProps,
  Group,
  Textarea,
  TextareaProps,
} from "@mantine/core";
import { MouseEventHandler } from "react";
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
};

const RequestCommentForm = ({
  onSubmit,
  textAreaProps,
  submitButtonProps,
  addCancelButton,
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
      <Group mt="sm" position="right">
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
