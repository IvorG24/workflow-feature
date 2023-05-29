import { getAvatarColor } from "@/utils/styling";
import { CommentTableRow } from "@/utils/types";
import { Avatar, Container, Flex, Group, Text } from "@mantine/core";
import { capitalize, startCase, upperCase } from "lodash";
import moment from "moment";

type Props = {
  comment: CommentTableRow;
};

const CommentItem = ({ comment }: Props) => {
  return (
    <Container m={0} p={0} fluid>
      <Group>
        <Flex gap="xs">
          <Avatar
            size={42}
            radius={42}
            color={getAvatarColor(
              Number(`${comment.comment_team_member_id?.charCodeAt(0)}`)
            )}
          >
            {upperCase(comment..username[0])}
            {upperCase(comment.createdBy.username[1])}
          </Avatar>
          <Flex direction="column">
            <Group spacing={8}>
              <Text weight={500}>
                {`${startCase(comment.createdBy.firstName)} ${startCase(
                  comment.createdBy.lastName
                )}`}
              </Text>

              <Text color="dimmed">&#x2022;</Text>

              <Text color="dimmed" sx={{ fontFamily: "Open Sans" }} size={12}>
                {capitalize(moment(comment.dateCreated).fromNow())}
              </Text>
            </Group>
            <Text size="xs" color="dimmed">
              {comment.createdBy.username}
            </Text>
          </Flex>
        </Flex>
      </Group>
      {comment.type === "REQUEST_COMMENT" && (
        <Text size="sm" color="dimmed" mt={4}>
          {comment.content}
        </Text>
      )}
      {comment.type === "REQUEST_CREATED" && (
        <Text size="sm" color="dimmed" mt={4}>
          {comment.createdBy.username} created this request on{" "}
          {moment(comment.dateCreated).format("MMM DD, YYYY")}
        </Text>
      )}
      {comment.type === "ACTION_APPROVED" && (
        <Text size="sm" color="dimmed" mt={4}>
          {comment.createdBy.username} approved this request on{" "}
          {moment(comment.dateCreated).format("MMM DD, YYYY")}
        </Text>
      )}
      {comment.type === "ACTION_REJECTED" && (
        <Text size="sm" color="dimmed" mt={4}>
          {comment.createdBy.username} rejected this request on{" "}
          {moment(comment.dateCreated).format("MMM DD, YYYY")}
        </Text>
      )}
      {comment.type === "REQUEST_CANCELED" && (
        <Text size="sm" color="dimmed" mt={4}>
          {comment.createdBy.username} cancelled this request on{" "}
          {moment(comment.dateCreated).format("MMM DD, YYYY")}
        </Text>
      )}
      {comment.type === "REQUEST_UNDO" && (
        <Text size="sm" color="dimmed" mt={4}>
          {comment.createdBy.username} cancelled this request on{" "}
          {moment(comment.dateCreated).format("MMM DD, YYYY")}
        </Text>
      )}
    </Container>
  );
};

export default CommentItem;
