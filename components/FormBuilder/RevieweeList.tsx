import { getAvatarColor } from "@/utils/styling";
import { TeamMemberType } from "@/utils/types";
import {
  Avatar,
  Container,
  ContainerProps,
  Flex,
  Group,
  Text,
  Title,
} from "@mantine/core";
import { startCase, upperCase } from "lodash";

type Props = {
  revieweeList: TeamMemberType[];
} & ContainerProps;

const RevieweeList = ({ revieweeList, ...props }: Props) => {
  return (
    <Container p={0} {...props} fluid>
      <Title order={4}>Reviewee:</Title>
      <Flex direction="column" gap="sm" pl="md" mt="md">
        {revieweeList.map((reviewee) => (
          <Group key={reviewee.team_member_id}>
            <Avatar
              size={42}
              radius={42}
              color={getAvatarColor(
                Number(`${reviewee.team_member_id.charCodeAt(0)}`)
              )}
            >
              {upperCase(reviewee.team_member_user.user_first_name[0])}
              {upperCase(reviewee.team_member_user.user_last_name[1])}
            </Avatar>
            <Flex direction="column">
              <Text lineClamp={1}>{`${startCase(
                reviewee.team_member_user.user_first_name
              )} ${startCase(reviewee.team_member_user.user_last_name)}`}</Text>
              <Text color="dimmed" size={12} lineClamp={1}>
                {reviewee.team_member_user.user_email}
              </Text>
            </Flex>
          </Group>
        ))}
      </Flex>
    </Container>
  );
};

export default RevieweeList;
