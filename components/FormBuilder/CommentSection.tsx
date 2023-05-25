import { Comment } from "@/backend/utils/types";
import {
  Box,
  Button,
  Container,
  ContainerProps,
  Divider,
  Flex,
  Text,
  Textarea,
  createStyles,
} from "@mantine/core";
import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import CommentItem from "./CommentItem";

export type Mode = "answer" | "edit" | "view";

type Props = {
  commentValue?: string;
  setCommentValue?: Dispatch<SetStateAction<string>>;
  mode?: Mode;
  onCreateComment?: MouseEventHandler<HTMLButtonElement>;
  commentList: Comment[];
} & ContainerProps;

type UseStylesProps = {
  mode: Mode;
};

const useStyles = createStyles((theme, { mode }: UseStylesProps) => ({
  container: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : "#fff",
    borderRadius: 4,
    border: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[2]
    }
    `,
    paddingInline: "32px",
    paddingTop: "16px",
    paddingBottom: mode === "edit" ? "16px" : "32px",
  },
}));

const CommentSection = ({
  mode = "edit",
  commentValue,
  setCommentValue,
  onCreateComment,
  commentList,
  ...props
}: Props) => {
  const { classes } = useStyles({ mode });

  return (
    <Container maw={768} className={classes.container} {...props}>
      <Box maw={522}>
        <Text weight={600} size={18}>
          Comments
        </Text>

        <Textarea
          placeholder="Leave a comment"
          value={commentValue}
          onChange={(event) => {
            if (setCommentValue) setCommentValue(event.currentTarget.value);
          }}
          mt="xl"
        />

        <Button onClick={onCreateComment} mt="md">
          Comment
        </Button>

        <Divider mt="md" />

        <Flex gap="lg" direction="column" mt="md">
          {commentList.length > 0 ? (
            commentList.map((comment) => (
              <CommentItem comment={comment} key={comment.id} />
            ))
          ) : (
            <Text color="dimmed" opacity={0.8}>
              No comments yet
            </Text>
          )}
        </Flex>
      </Box>
    </Container>
  );
};

export default CommentSection;
