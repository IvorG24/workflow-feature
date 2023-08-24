import { getAvatarColor } from "@/utils/styling";
import {
  TeamGroupTableRow,
  TeamMemberTableRow,
  TeamProjectTableRow,
  UserTableRow,
} from "@/utils/types";
import {
  Avatar,
  Container,
  Divider,
  Flex,
  NumberInput,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { toUpper } from "lodash";
import MemberGroup from "./MemberGroup";
import MemberProject from "./MemberProject";

type Props = {
  member: TeamMemberTableRow & { team_member_user: UserTableRow };
  groupList: {
    team_group_member_id: string;
    team_group: TeamGroupTableRow;
  }[];
  groupCount: number;
  projectList: {
    team_project_member_id: string;
    team_project: TeamProjectTableRow;
  }[];
  projectCount: number;
};

const TeamMemberPage = ({
  member,
  groupList,
  groupCount,
  projectList,
  projectCount,
}: Props) => {
  return (
    <Container>
      <Title order={2}>Member Profile</Title>
      <Paper p="lg" shadow="xs" mt="xl">
        <Stack spacing={12}>
          <Text weight={600}>Personal Info</Text>
          <Divider />

          <Flex mt="md" justify="space-between" gap="xl" wrap="wrap">
            <Avatar
              size={150}
              src={member.team_member_user.user_avatar}
              color={getAvatarColor(
                Number(`${member.team_member_user.user_id.charCodeAt(0)}`)
              )}
              radius={150}
            >
              {toUpper(member.team_member_user.user_first_name[0])}
              {toUpper(member.team_member_user.user_last_name[0])}
            </Avatar>
          </Flex>

          <Flex direction={{ base: "column", md: "row" }} gap={16}>
            <TextInput
              w="100%"
              label="Username"
              variant="filled"
              readOnly
              value={member.team_member_user.user_username}
            />
            <TextInput
              w="100%"
              label="Email"
              variant="filled"
              readOnly
              value={member.team_member_user.user_email}
            />
          </Flex>

          <Flex direction={{ base: "column", md: "row" }} gap={16}>
            <TextInput
              w="100%"
              label="First Name"
              variant="filled"
              readOnly
              value={member.team_member_user.user_first_name}
            />
            <TextInput
              w="100%"
              label="Last Name"
              variant="filled"
              readOnly
              value={member.team_member_user.user_last_name}
            />
          </Flex>

          <Flex direction={{ base: "column", md: "row" }} gap={16}>
            <NumberInput
              w="100%"
              label="Mobile Number"
              maxLength={10}
              hideControls
              icon="+63"
              min={0}
              max={9999999999}
              variant="filled"
              readOnly
              value={Number(member.team_member_user.user_phone_number)}
            />
            <TextInput
              w="100%"
              label="Job Title"
              variant="filled"
              readOnly
              value={`${member.team_member_user.user_job_title}`}
            />
          </Flex>
        </Stack>
      </Paper>

      <MemberGroup
        memberId={member.team_member_id}
        groupList={groupList}
        groupCount={groupCount}
      />

      <MemberProject
        memberId={member.team_member_id}
        projectList={projectList}
        projectCount={projectCount}
      />
    </Container>
  );
};

export default TeamMemberPage;
